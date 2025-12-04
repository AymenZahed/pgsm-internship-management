const db = require('../config/database');
const { hashPassword } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.id;

    const [users] = await db.query(
      `SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.phone, u.avatar, u.created_at
       FROM users u WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    let profileData = {};

    if (user.role === 'student') {
      const [students] = await db.query('SELECT * FROM students WHERE user_id = ?', [userId]);
      if (students.length > 0) profileData = students[0];
    } else if (user.role === 'doctor') {
      const [doctors] = await db.query(
        `SELECT d.*, h.name as hospital_name 
         FROM doctors d 
         LEFT JOIN hospitals h ON h.id = d.hospital_id 
         WHERE d.user_id = ?`,
        [userId]
      );
      if (doctors.length > 0) profileData = doctors[0];
    } else if (user.role === 'hospital') {
      const [hospitals] = await db.query('SELECT * FROM hospitals WHERE user_id = ?', [userId]);
      if (hospitals.length > 0) profileData = hospitals[0];
    }

    res.json({
      success: true,
      data: { ...user, profile: profileData }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, phone, ...profileData } = req.body;

    // Update base user info
    await db.query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
      [first_name, last_name, phone, req.user.id]
    );

    // Update role-specific profile
    if (req.user.role === 'student' && Object.keys(profileData).length > 0) {
      const fields = [];
      const values = [];
      
      ['student_number', 'faculty', 'department', 'academic_year', 'date_of_birth', 
       'address', 'city', 'emergency_contact', 'emergency_phone', 'bio'].forEach(field => {
        if (profileData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(profileData[field]);
        }
      });

      if (fields.length > 0) {
        values.push(req.user.id);
        await db.query(
          `UPDATE students SET ${fields.join(', ')} WHERE user_id = ?`,
          values
        );
      }
    } else if (req.user.role === 'doctor' && Object.keys(profileData).length > 0) {
      const fields = [];
      const values = [];
      
      ['specialization', 'department', 'title', 'license_number', 'years_experience', 
       'bio', 'is_available', 'max_students'].forEach(field => {
        if (profileData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(profileData[field]);
        }
      });

      if (fields.length > 0) {
        values.push(req.user.id);
        await db.query(
          `UPDATE doctors SET ${fields.join(', ')} WHERE user_id = ?`,
          values
        );
      }
    } else if (req.user.role === 'hospital' && Object.keys(profileData).length > 0) {
      const fields = [];
      const values = [];
      
      ['name', 'type', 'address', 'city', 'postal_code', 'phone', 'email', 
       'website', 'description', 'capacity'].forEach(field => {
        if (profileData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(profileData[field]);
        }
      });

      if (fields.length > 0) {
        values.push(req.user.id);
        await db.query(
          `UPDATE hospitals SET ${fields.join(', ')} WHERE user_id = ?`,
          values
        );
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update avatar
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const avatarPath = req.file.path;
    await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, req.user.id]);

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: { avatar: avatarPath }
    });
  } catch (error) {
    next(error);
  }
};

// Get user settings
const getSettings = async (req, res, next) => {
  try {
    const [settings] = await db.query(
      'SELECT * FROM settings WHERE user_id = ?',
      [req.user.id]
    );

    if (settings.length === 0) {
      // Create default settings
      const id = uuidv4();
      await db.query('INSERT INTO settings (id, user_id) VALUES (?, ?)', [id, req.user.id]);
      
      return res.json({
        success: true,
        data: { language: 'fr', theme: 'system', email_notifications: true, push_notifications: true }
      });
    }

    res.json({
      success: true,
      data: settings[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update user settings
const updateSettings = async (req, res, next) => {
  try {
    const { language, theme, email_notifications, push_notifications, sms_notifications } = req.body;

    await db.query(
      `UPDATE settings SET language = ?, theme = ?, email_notifications = ?, 
       push_notifications = ?, sms_notifications = ? WHERE user_id = ?`,
      [language, theme, email_notifications, push_notifications, sms_notifications, req.user.id]
    );

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  getSettings,
  updateSettings
};
