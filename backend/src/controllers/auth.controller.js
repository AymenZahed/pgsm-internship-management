const db = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

// Register new user
const register = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, role, phone } = req.body;

    // Check if user exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();

    // Create user
    await db.query(
      `INSERT INTO users (id, email, password, role, first_name, last_name, phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, email, hashedPassword, role, first_name, last_name, phone || null]
    );

    // Create role-specific profile
    if (role === 'student') {
      await db.query(
        'INSERT INTO students (id, user_id) VALUES (?, ?)',
        [uuidv4(), userId]
      );
    } else if (role === 'doctor') {
      await db.query(
        'INSERT INTO doctors (id, user_id) VALUES (?, ?)',
        [uuidv4(), userId]
      );
    } else if (role === 'hospital') {
      await db.query(
        'INSERT INTO hospitals (id, user_id, name) VALUES (?, ?, ?)',
        [uuidv4(), userId, `${first_name} ${last_name}`]
      );
    }

    // Create default settings
    await db.query(
      'INSERT INTO settings (id, user_id) VALUES (?, ?)',
      [uuidv4(), userId]
    );

    const token = generateToken(userId, role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: userId,
          email,
          role,
          first_name,
          last_name
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      'SELECT id, email, password, role, first_name, last_name, avatar, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check Maintenance Mode
    const [config] = await db.query('SELECT value FROM system_config WHERE `key` = "maintenanceMode"');
    const maintenanceMode = config[0]?.value === 'true';

    if (maintenanceMode && user.role !== 'admin') {
      return res.status(503).json({
        success: false,
        message: 'System is currently under maintenance. Only administrators can log in.'
      });
    }

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Notify user of new login
    // Note: To avoid spam, we might usually check IP, but user requested "New Login" notification
    const { createNotification } = require('./notification.controller');
    createNotification(
      user.id,
      'security',
      'New Login Detected',
      `A new login to your account was detected at ${new Date().toLocaleString()}.`
    ).catch(err => console.error('Login notification error:', err)); // Non-blocking

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: user.avatar
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const me = async (req, res, next) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.phone, u.avatar, u.created_at,
              s.language, s.theme, s.email_notifications, s.push_notifications
       FROM users u
       LEFT JOIN settings s ON s.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Get role-specific data
    let profileData = {};
    if (user.role === 'student') {
      const [students] = await db.query('SELECT * FROM students WHERE user_id = ?', [user.id]);
      if (students.length > 0) profileData = students[0];
    } else if (user.role === 'doctor') {
      const [doctors] = await db.query('SELECT * FROM doctors WHERE user_id = ?', [user.id]);
      if (doctors.length > 0) profileData = doctors[0];
    } else if (user.role === 'hospital') {
      const [hospitals] = await db.query('SELECT * FROM hospitals WHERE user_id = ?', [user.id]);
      if (hospitals.length > 0) profileData = hospitals[0];
    }

    res.json({
      success: true,
      data: {
        ...user,
        profile: profileData
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);

    const isValid = await comparePassword(current_password, users[0].password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedPassword = await hashPassword(new_password);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    const { createNotification } = require('./notification.controller');
    await createNotification(
      req.user.id,
      'security',
      'Password Changed',
      'Your password was successfully changed. If this wasn\'t you, please contact support immediately.'
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password (request reset)
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const crypto = require('crypto');
    const { sendEmail } = require('../utils/email.service');

    const [users] = await db.query('SELECT id, email, first_name FROM users WHERE email = ?', [email]);

    if (users.length > 0) {
      const user = users[0];
      const rawPassword = crypto.randomBytes(4).toString('hex'); // 8 characters
      const hashedPassword = await hashPassword(rawPassword);

      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);

      await sendEmail({
        to: user.email,
        subject: 'PGSM - Reset Password',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Password Reset Request</h2>
            <p>Hello ${user.first_name},</p>
            <p>Your password has been reset as requested. Your new temporary password is:</p>
            <h3 style="background: #f4f4f4; padding: 10px; border-radius: 5px; display: inline-block;">${rawPassword}</h3>
            <p>Please log in using this password and change it immediately in your settings.</p>
            <br>
            <p>Best regards,<br>PGSM Team</p>
          </div>
        `
      });
    }

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If the email exists, a new password has been sent.'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  changePassword,
  forgotPassword
};
