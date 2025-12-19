const db = require('../config/database');
const { generateId } = require('../utils/helpers');

// Get user's notifications
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread_only } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'user_id = ?';
    const params = [req.user.id];

    if (unread_only === 'true') {
      whereClause += ' AND is_read = FALSE';
    }

    const [notifications] = await db.query(
      `SELECT * FROM notifications WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [unreadCount] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount[0].count
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get unread count
const getUnreadCount = async (req, res, next) => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    res.json({
      success: true,
      data: { unread: result[0].count }
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// Mark all as read
const markAllAsRead = async (req, res, next) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
};

// Clear all notifications
const clearAllNotifications = async (req, res, next) => {
  try {
    await db.query(
      'DELETE FROM notifications WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    next(error);
  }
};

// Create notification (internal use)
const { sendEmail } = require('../utils/email.service');

// Create notification (internal use)
const createNotification = async (userId, type, title, message, data = null) => {
  const id = generateId();

  // Create in-app notification
  await db.query(
    `INSERT INTO notifications (id, user_id, type, title, message, data)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, userId, type, title, message, JSON.stringify(data)]
  );

  // Send email notification based on settings
  try {
    // Get user email and settings
    const [userData] = await db.query(
      `SELECT u.email, u.first_name, 
              s.email_notifications, s.student_updates, s.logbook_alerts, s.message_alerts, s.evaluation_reminders, s.login_alerts
       FROM users u
       LEFT JOIN settings s ON s.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (userData.length > 0) {
      const user = userData[0];

      // Check if global email notifications are enabled
      if (user.email_notifications) {
        let shouldSend = true;

        // Apply specific filters based on notification type
        if (type === 'message' && !user.message_alerts) shouldSend = false;
        if (type === 'logbook' && !user.logbook_alerts) shouldSend = false;
        if (type === 'evaluation' && !user.evaluation_reminders) shouldSend = false;
        if (type === 'security' && !user.login_alerts) shouldSend = false;
        // 'application' type usually defaults to true or falls under student_updates if meaningful

        if (shouldSend) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">${title}</h2>
              <p>Hello ${user.first_name},</p>
              <p>${message}</p>
              <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  You check the details by logging into your account.
                </p>
              </div>
            </div>
          `;

          await sendEmail(user.email, title, emailHtml);
        }
      }
    }
  } catch (error) {
    console.error('Failed to send email notification:', error);
    // Don't throw, just log error so we don't block the main flow
  }

  return id;
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification
};
