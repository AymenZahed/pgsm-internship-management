const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get user's conversations
const getConversations = async (req, res, next) => {
  try {
    const [conversations] = await db.query(
      `SELECT c.*, 
              (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
              (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id 
               AND m.sender_id != ? AND m.status != 'read') as unread_count
       FROM conversations c
       JOIN conversation_participants cp ON cp.conversation_id = c.id
       WHERE cp.user_id = ?
       ORDER BY last_message_time DESC`,
      [req.user.id, req.user.id]
    );

    // Get other participant info for each conversation
    for (let conv of conversations) {
      const [participants] = await db.query(
        `SELECT u.id, u.first_name, u.last_name, u.avatar, u.role
         FROM conversation_participants cp
         JOIN users u ON u.id = cp.user_id
         WHERE cp.conversation_id = ? AND cp.user_id != ?`,
        [conv.id, req.user.id]
      );
      conv.participants = participants;
    }

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// Get or create conversation with user
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    if (user_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot create conversation with yourself' });
    }

    // Check if conversation exists
    const [existing] = await db.query(
      `SELECT c.id FROM conversations c
       JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = ?
       JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = ?
       WHERE c.type = 'direct'`,
      [req.user.id, user_id]
    );

    if (existing.length > 0) {
      return res.json({
        success: true,
        data: { id: existing[0].id, isNew: false }
      });
    }

    // Create new conversation
    const conversationId = uuidv4();
    await db.query(
      'INSERT INTO conversations (id, type) VALUES (?, "direct")',
      [conversationId]
    );

    // Add participants
    await db.query(
      'INSERT INTO conversation_participants (id, conversation_id, user_id) VALUES (?, ?, ?), (?, ?, ?)',
      [uuidv4(), conversationId, req.user.id, uuidv4(), conversationId, user_id]
    );

    res.status(201).json({
      success: true,
      data: { id: conversationId, isNew: true }
    });
  } catch (error) {
    next(error);
  }
};

// Get messages in conversation
const getMessages = async (req, res, next) => {
  try {
    const { conversation_id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verify user is participant
    const [participant] = await db.query(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversation_id, req.user.id]
    );

    if (participant.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [messages] = await db.query(
      `SELECT m.*, u.first_name, u.last_name, u.avatar
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [conversation_id, parseInt(limit), offset]
    );

    // Get attachments for messages
    for (let msg of messages) {
      const [attachments] = await db.query(
        'SELECT * FROM message_attachments WHERE message_id = ?',
        [msg.id]
      );
      msg.attachments = attachments;
    }

    // Mark messages as read
    await db.query(
      `UPDATE messages SET status = 'read' 
       WHERE conversation_id = ? AND sender_id != ? AND status != 'read'`,
      [conversation_id, req.user.id]
    );

    // Update last_read_at
    await db.query(
      'UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = ? AND user_id = ?',
      [conversation_id, req.user.id]
    );

    res.json({
      success: true,
      data: messages.reverse()
    });
  } catch (error) {
    next(error);
  }
};

// Send message
const sendMessage = async (req, res, next) => {
  try {
    const { conversation_id, content } = req.body;

    // Verify user is participant
    const [participant] = await db.query(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversation_id, req.user.id]
    );

    if (participant.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messageId = uuidv4();
    await db.query(
      `INSERT INTO messages (id, conversation_id, sender_id, content, status)
       VALUES (?, ?, ?, ?, 'sent')`,
      [messageId, conversation_id, req.user.id, content]
    );

    // Handle attachments
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.query(
          `INSERT INTO message_attachments (id, message_id, file_name, file_path, file_type, file_size)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [uuidv4(), messageId, file.originalname, file.path, file.mimetype, file.size]
        );
      }
    }

    // Update conversation
    await db.query(
      'UPDATE conversations SET updated_at = NOW() WHERE id = ?',
      [conversation_id]
    );

    // Mark as delivered for other participants
    setTimeout(async () => {
      await db.query(
        'UPDATE messages SET status = "delivered" WHERE id = ?',
        [messageId]
      );
    }, 1000);

    // Notify recipient(s)
    const { createNotification } = require('./notification.controller');

    // Get other participants to notify
    const [recipients] = await db.query(
      'SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?',
      [conversation_id, req.user.id]
    );

    for (const recipient of recipients) {
      await createNotification(
        recipient.user_id,
        'message',
        'New Message',
        'You have received a new message.',
        { conversation_id, message_id: messageId }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: { id: messageId }
    });
  } catch (error) {
    next(error);
  }
};

// Get unread count
const getUnreadCount = async (req, res, next) => {
  try {
    const [result] = await db.query(
      `SELECT COUNT(*) as count FROM messages m
       JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
       WHERE cp.user_id = ? AND m.sender_id != ? AND m.status != 'read'`,
      [req.user.id, req.user.id]
    );

    res.json({
      success: true,
      data: { unread: result[0].count }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getUnreadCount
};
