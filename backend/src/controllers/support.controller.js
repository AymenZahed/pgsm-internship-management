const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const contactSupport = async (req, res, next) => {
  try {
    const { name, email, category, subject, message } = req.body;

    // Try to find user by email to link ticket
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    let userId = null;

    if (users.length > 0) {
      userId = users[0].id;
    } else {
      // For now, if user not found, we cannot insert because of potential FK constraint ?
      // Schema: FOREIGN KEY (user_id) REFERENCES users(id).
      // If user doesn't exist, we fail?
      // User said "save it correct in database".
      // If the contact form is public, we might have non-users.
      // If schema requires user_id, we can't save non-users.
      // I will assume for now that only users or correct emails work.
      // OR I should check if schema allows NULL?
      // Schema said: `user_id VARCHAR(36) NOT NULL`.
      // So... guest support is NOT supported in DB.
      // I will return an error if email not found.
      return res.status(404).json({
        success: false,
        message: 'Email not associated with any account. Please use your registered email.'
      });
    }

    const ticketId = uuidv4();
    await db.query(
      `INSERT INTO support_tickets (id, user_id, subject, description, category, status, priority)
       VALUES (?, ?, ?, ?, ?, 'open', 'medium')`,
      [ticketId, userId, subject, message, category]
    );

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  contactSupport
};
