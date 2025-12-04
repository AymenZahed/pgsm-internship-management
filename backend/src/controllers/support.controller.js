const db = require('../config/database');
const { generateId } = require('../utils/helpers');

// Submit contact form (public)
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required',
      });
    }

    const id = generateId();
    await db.query(
      `INSERT INTO support_tickets (id, subject, description, priority, status, category, guest_name, guest_email, guest_phone, created_at)
       VALUES (?, ?, ?, 'medium', 'open', 'contact', ?, ?, ?, NOW())`,
      [id, subject || 'Contact Form Submission', message, name, email, phone || null]
    );

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      data: { id },
    });
  } catch (error) {
    console.error('Submit contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
};

// Get user's support tickets
exports.getMyTickets = async (req, res) => {
  try {
    const userId = req.user.id;

    const [tickets] = await db.query(
      `SELECT st.*, 
        (SELECT COUNT(*) FROM support_responses WHERE ticket_id = st.id) as responses_count
       FROM support_tickets st
       WHERE st.user_id = ?
       ORDER BY st.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get support tickets',
    });
  }
};

// Create support ticket
exports.createTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, description, category, priority } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject and description are required',
      });
    }

    const id = generateId();
    await db.query(
      `INSERT INTO support_tickets (id, user_id, subject, description, category, priority, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'open', NOW())`,
      [id, userId, subject, description, category || 'general', priority || 'medium']
    );

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
    });
  }
};

// Get ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [tickets] = await db.query(
      `SELECT st.*
       FROM support_tickets st
       WHERE st.id = ? AND (st.user_id = ? OR ? IN (SELECT id FROM users WHERE role = 'admin'))`,
      [id, userId, userId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Get responses
    const [responses] = await db.query(
      `SELECT sr.*, u.first_name, u.last_name, u.role
       FROM support_responses sr
       LEFT JOIN users u ON sr.responder_id = u.id
       WHERE sr.ticket_id = ?
       ORDER BY sr.created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...tickets[0],
        responses,
      },
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ticket',
    });
  }
};

// Reply to ticket
exports.replyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // Check ticket exists and user has access
    const [tickets] = await db.query(
      `SELECT * FROM support_tickets 
       WHERE id = ? AND (user_id = ? OR ? IN (SELECT id FROM users WHERE role = 'admin'))`,
      [id, userId, userId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    const responseId = generateId();
    await db.query(
      `INSERT INTO support_responses (id, ticket_id, responder_id, message, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [responseId, id, userId, message]
    );

    // Update ticket status if needed
    await db.query(
      `UPDATE support_tickets SET updated_at = NOW() WHERE id = ?`,
      [id]
    );

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: { id: responseId },
    });
  } catch (error) {
    console.error('Reply to ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply',
    });
  }
};
