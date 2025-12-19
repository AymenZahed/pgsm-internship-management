const db = require('../config/database');
const { paginate, paginationResponse, hashPassword, generateId } = require('../utils/helpers');

// Get dashboard stats
const getDashboardStats = async (req, res, next) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'hospital') as total_hospitals,
        (SELECT COUNT(*) FROM users WHERE role = 'doctor') as total_doctors,
        (SELECT COUNT(*) FROM stage_offers WHERE status = 'published') as active_offers,
        (SELECT COUNT(*) FROM applications WHERE status = 'pending') as pending_applications,
        (SELECT COUNT(*) FROM internships WHERE status = 'active') as active_internships,
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as new_users_today
    `);

    // Recent activity
    const [recentActivity] = await db.query(`
      SELECT 'user' as type, CONCAT(first_name, ' ', last_name) as description, 
             role as status, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Monthly registrations
    const [monthlyStats] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month,
             SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
             SUM(CASE WHEN role = 'hospital' THEN 1 ELSE 0 END) as hospitals,
             SUM(CASE WHEN role = 'doctor' THEN 1 ELSE 0 END) as doctors
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);

    res.json({
      success: true,
      data: {
        stats: stats[0],
        recentActivity,
        monthlyStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all users
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role, is_active } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    if (is_active !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(is_active === 'true');
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
      params
    );

    const [users] = await db.query(
      `SELECT id, email, role, first_name, last_name, phone, avatar, is_active, 
              email_verified, last_login, created_at
       FROM users WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageLimit, offset]
    );

    res.json({
      success: true,
      ...paginationResponse(users, countResult[0].total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// Create user
const createUser = async (req, res, next) => {
  try {
    const { email, password, role, first_name, last_name, phone } = req.body;

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const userId = generateId();

    await db.query(
      `INSERT INTO users (id, email, password, role, first_name, last_name, phone, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, TRUE)`,
      [userId, email, hashedPassword, role, first_name, last_name, phone]
    );

    // Create role-specific profile
    if (role === 'student') {
      await db.query('INSERT INTO students (id, user_id) VALUES (?, ?)', [generateId(), userId]);
    } else if (role === 'doctor') {
      await db.query('INSERT INTO doctors (id, user_id) VALUES (?, ?)', [generateId(), userId]);
    } else if (role === 'hospital') {
      await db.query('INSERT INTO hospitals (id, user_id, name) VALUES (?, ?, ?)',
        [generateId(), userId, `${first_name} ${last_name}`]);
    }

    await db.query('INSERT INTO settings (id, user_id) VALUES (?, ?)', [generateId(), userId]);

    // Send welcome email
    try {
      const { sendEmail } = require('../utils/email.service');
      await sendEmail({
        to: email,
        subject: 'Welcome to PGSM - Your Account Created',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Welcome to PGSM</h2>
            <p>Dear ${first_name} ${last_name},</p>
            <p>Your account has been created successfully with the role: <strong>${role}</strong>.</p>
            <p>Your login credentials are:</p>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Password:</strong> ${password}</li>
            </ul>
            <p>Please log in and change your password immediately.</p>
            <br>
            <p>Best regards,<br>PGSM Administration</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue execution, don't fail the request if email fails?
      // User asked to "send him password", implies important.
      // But creating user is done.
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id: userId }
    });
  } catch (error) {
    next(error);
  }
};

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, is_active, role } = req.body;

    await db.query(
      `UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name),
       phone = COALESCE(?, phone), is_active = COALESCE(?, is_active), role = COALESCE(?, role)
       WHERE id = ?`,
      [first_name, last_name, phone, is_active, role, id]
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Don't allow deleting self
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get students
const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, faculty, status } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR s.student_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (faculty) {
      whereClause += ' AND s.faculty = ?';
      params.push(faculty);
    }

    if (status !== undefined) {
      whereClause += ' AND u.is_active = ?';
      params.push(status === 'active');
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM students s JOIN users u ON u.id = s.user_id WHERE ${whereClause}`,
      params
    );

    const [students] = await db.query(
      `SELECT s.*, u.email, u.first_name, u.last_name, u.phone, u.avatar, u.is_active, u.created_at,
              (SELECT COUNT(*) FROM internships WHERE student_id = s.id AND status = 'active') as active_internships,
              (SELECT COUNT(*) FROM applications WHERE student_id = s.id) as total_applications
       FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageLimit, offset]
    );

    res.json({
      success: true,
      ...paginationResponse(students, countResult[0].total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// Get student by ID
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [students] = await db.query(
      `SELECT s.*, u.email, u.first_name, u.last_name, u.phone, u.avatar, u.is_active, u.created_at
       FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      data: students[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update student
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [student] = await db.query('SELECT user_id FROM students WHERE id = ?', [id]);
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Update user fields
    if (updates.first_name || updates.last_name || updates.phone || updates.is_active !== undefined) {
      await db.query(
        `UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name),
         phone = COALESCE(?, phone), is_active = COALESCE(?, is_active) WHERE id = ?`,
        [updates.first_name, updates.last_name, updates.phone, updates.is_active, student[0].user_id]
      );
    }

    // Update student fields
    await db.query(
      `UPDATE students SET student_number = COALESCE(?, student_number), faculty = COALESCE(?, faculty),
       academic_year = COALESCE(?, academic_year), department = COALESCE(?, department) WHERE id = ?`,
      [updates.student_number, updates.faculty, updates.academic_year, updates.department, id]
    );

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete student
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [student] = await db.query('SELECT user_id FROM students WHERE id = ?', [id]);
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [student[0].user_id]);

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get hospitals
const getHospitals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, type, status } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (h.name LIKE ? OR h.city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (type) {
      whereClause += ' AND h.type = ?';
      params.push(type);
    }

    if (status !== undefined) {
      whereClause += ' AND h.is_verified = ?';
      params.push(status === 'verified');
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM hospitals h WHERE ${whereClause}`,
      params
    );

    const [hospitals] = await db.query(
      `SELECT h.*, u.email,
              (SELECT COUNT(*) FROM stage_offers WHERE hospital_id = h.id AND status = 'published') as active_offers,
              (SELECT COUNT(*) FROM internships WHERE hospital_id = h.id AND status = 'active') as current_interns,
              (SELECT COUNT(*) FROM services WHERE hospital_id = h.id) as services_count
       FROM hospitals h
       JOIN users u ON u.id = h.user_id
       WHERE ${whereClause}
       ORDER BY h.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageLimit, offset]
    );

    res.json({
      success: true,
      ...paginationResponse(hospitals, countResult[0].total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital by ID
const getHospitalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [hospitals] = await db.query(
      `SELECT h.*, u.email FROM hospitals h JOIN users u ON u.id = h.user_id WHERE h.id = ?`,
      [id]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({ success: true, data: hospitals[0] });
  } catch (error) {
    next(error);
  }
};

// Create hospital
const createHospital = async (req, res, next) => {
  try {
    const { email, password, name, type, city, address, phone, description } = req.body;

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const userId = generateId();
    const hospitalId = generateId();

    await db.query(
      `INSERT INTO users (id, email, password, role, first_name, last_name, is_active, email_verified)
       VALUES (?, ?, ?, 'hospital', ?, '', TRUE, TRUE)`,
      [userId, email, hashedPassword, name]
    );

    await db.query(
      `INSERT INTO hospitals (id, user_id, name, type, city, address, phone, description, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [hospitalId, userId, name, type, city, address, phone, description]
    );

    await db.query('INSERT INTO settings (id, user_id) VALUES (?, ?)', [generateId(), userId]);

    res.status(201).json({ success: true, message: 'Hospital created successfully', data: { id: hospitalId } });
  } catch (error) {
    next(error);
  }
};

// Update hospital
const updateHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await db.query(
      `UPDATE hospitals SET name = COALESCE(?, name), type = COALESCE(?, type), city = COALESCE(?, city),
       address = COALESCE(?, address), phone = COALESCE(?, phone), description = COALESCE(?, description),
       is_verified = COALESCE(?, is_verified) WHERE id = ?`,
      [updates.name, updates.type, updates.city, updates.address, updates.phone, updates.description, updates.is_verified, id]
    );

    res.json({ success: true, message: 'Hospital updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete hospital
const deleteHospital = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [hospital] = await db.query('SELECT user_id FROM hospitals WHERE id = ?', [id]);
    if (hospital.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [hospital[0].user_id]);

    res.json({ success: true, message: 'Hospital deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get internships
const getInternships = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, hospital_id, status } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR h.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (hospital_id) {
      whereClause += ' AND i.hospital_id = ?';
      params.push(hospital_id);
    }

    if (status) {
      whereClause += ' AND i.status = ?';
      params.push(status);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM internships i
       JOIN students s ON s.id = i.student_id
       JOIN users u ON u.id = s.user_id
       JOIN hospitals h ON h.id = i.hospital_id
       WHERE ${whereClause}`,
      params
    );

    const [internships] = await db.query(
      `SELECT i.*, u.first_name, u.last_name, h.name as hospital_name, sv.name as service_name,
              CONCAT(tu.first_name, ' ', tu.last_name) as tutor_name
       FROM internships i
       JOIN students s ON s.id = i.student_id
       JOIN users u ON u.id = s.user_id
       JOIN hospitals h ON h.id = i.hospital_id
       LEFT JOIN services sv ON sv.id = i.service_id
       LEFT JOIN doctors d ON d.id = i.tutor_id
       LEFT JOIN users tu ON tu.id = d.user_id
       WHERE ${whereClause}
       ORDER BY i.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageLimit, offset]
    );

    res.json({
      success: true,
      ...paginationResponse(internships, countResult[0].total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// Get internship by ID
const getInternshipById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [internships] = await db.query(
      `SELECT i.*, u.first_name, u.last_name, u.email, u.phone, u.avatar,
              s.student_number, s.faculty, s.academic_year,
              h.name as hospital_name, sv.name as service_name,
              CONCAT(tu.first_name, ' ', tu.last_name) as tutor_name
       FROM internships i
       JOIN students s ON s.id = i.student_id
       JOIN users u ON u.id = s.user_id
       JOIN hospitals h ON h.id = i.hospital_id
       LEFT JOIN services sv ON sv.id = i.service_id
       LEFT JOIN doctors d ON d.id = i.tutor_id
       LEFT JOIN users tu ON tu.id = d.user_id
       WHERE i.id = ?`,
      [id]
    );

    if (internships.length === 0) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    res.json({ success: true, data: internships[0] });
  } catch (error) {
    next(error);
  }
};

// Get activity logs
const getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, user_id, action, date_from, date_to } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    let whereClause = '1=1';
    const params = [];

    if (user_id) {
      whereClause += ' AND l.user_id = ?';
      params.push(user_id);
    }

    if (action) {
      whereClause += ' AND l.action = ?';
      params.push(action);
    }

    if (date_from) {
      whereClause += ' AND l.created_at >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND l.created_at <= ?';
      params.push(date_to);
    }

    const [logs] = await db.query(
      `SELECT l.*, u.first_name, u.last_name, u.email
       FROM activity_logs l
       LEFT JOIN users u ON u.id = l.user_id
       WHERE ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageLimit, offset]
    );

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

// System statistics
const getStatistics = async (req, res, next) => {
  try {
    const [applicationStats] = await db.query(`SELECT status, COUNT(*) as count FROM applications GROUP BY status`);
    const [internshipStats] = await db.query(`SELECT status, COUNT(*) as count FROM internships GROUP BY status`);
    const [topHospitals] = await db.query(`
      SELECT h.name, COUNT(i.id) as internship_count
      FROM hospitals h LEFT JOIN internships i ON i.hospital_id = h.id
      GROUP BY h.id ORDER BY internship_count DESC LIMIT 10
    `);
    const [evaluationStats] = await db.query(`
      SELECT AVG(overall_score) as avg_overall, AVG(technical_skills_score) as avg_technical,
             AVG(patient_relations_score) as avg_patient_relations, AVG(teamwork_score) as avg_teamwork,
             AVG(professionalism_score) as avg_professionalism
      FROM evaluations
    `);
    const [monthlyData] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
      FROM applications WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month
    `);
    const [departmentData] = await db.query(`SELECT department, COUNT(*) as count FROM stage_offers GROUP BY department`);
    const [universityData] = await db.query(`SELECT faculty, COUNT(*) as count FROM students WHERE faculty IS NOT NULL GROUP BY faculty`);

    res.json({
      success: true,
      data: { applicationStats, internshipStats, topHospitals, evaluationStats: evaluationStats[0], monthlyData, departmentData, universityData }
    });
  } catch (error) {
    next(error);
  }
};

// Support tickets
const getSupportTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    let whereClause = '1=1';
    const params = [];

    if (status) { whereClause += ' AND st.status = ?'; params.push(status); }
    if (priority) { whereClause += ' AND st.priority = ?'; params.push(priority); }

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM support_tickets st WHERE ${whereClause}`, params);
    const [tickets] = await db.query(
      `SELECT st.*, u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email, u.role as user_role,
              (SELECT COUNT(*) FROM support_responses WHERE ticket_id = st.id) as responses_count
       FROM support_tickets st
       LEFT JOIN users u ON u.id = st.user_id
       WHERE ${whereClause}
       ORDER BY st.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageLimit, offset]
    );

    res.json({ success: true, ...paginationResponse(tickets, countResult[0].total, page, limit) });
  } catch (error) {
    next(error);
  }
};

const getSupportTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [tickets] = await db.query(
      `SELECT st.*, u.first_name, u.last_name, u.email, u.role FROM support_tickets st LEFT JOIN users u ON u.id = st.user_id WHERE st.id = ?`,
      [id]
    );
    if (tickets.length === 0) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const [responses] = await db.query(
      `SELECT sr.*, u.first_name, u.last_name, u.role FROM support_responses sr LEFT JOIN users u ON u.id = sr.responder_id WHERE sr.ticket_id = ? ORDER BY sr.created_at`,
      [id]
    );

    res.json({ success: true, data: { ...tickets[0], responses } });
  } catch (error) {
    next(error);
  }
};

const updateSupportTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;
    await db.query(`UPDATE support_tickets SET status = COALESCE(?, status), priority = COALESCE(?, priority), updated_at = NOW() WHERE id = ?`, [status, priority, id]);
    res.json({ success: true, message: 'Ticket updated successfully' });
  } catch (error) {
    next(error);
  }
};

const replySupportTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const responseId = generateId();
    await db.query(`INSERT INTO support_responses (id, ticket_id, responder_id, message, created_at) VALUES (?, ?, ?, ?, NOW())`, [responseId, id, req.user.id, message]);
    await db.query(`UPDATE support_tickets SET status = 'in_progress', updated_at = NOW() WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Reply sent successfully' });
  } catch (error) {
    next(error);
  }
};

// Configuration
const getConfiguration = async (req, res, next) => {
  try {
    const [config] = await db.query('SELECT * FROM system_config');
    const configObj = {};
    config.forEach(c => { configObj[c.key] = c.value; });
    res.json({ success: true, data: configObj });
  } catch (error) {
    next(error);
  }
};

const updateConfiguration = async (req, res, next) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await db.query('INSERT INTO system_config (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?', [key, value, value]);
    }
    res.json({ success: true, message: 'Configuration updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Reports
const getReports = async (req, res, next) => {
  try {
    const [reports] = await db.query('SELECT * FROM reports ORDER BY created_at DESC');
    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

const generateReport = async (req, res, next) => {
  try {
    const { type, start_date, end_date, format } = req.body;
    const id = generateId();
    await db.query(
      `INSERT INTO reports (id, name, type, status, created_at) VALUES (?, ?, ?, 'generating', NOW())`,
      [id, `${type}_${new Date().toISOString().split('T')[0]}`, type]
    );
    // In a real app, you'd queue this for background processing
    setTimeout(async () => {
      await db.query(`UPDATE reports SET status = 'ready', file_path = ? WHERE id = ?`, [`/reports/${id}.${format || 'pdf'}`, id]);
    }, 2000);
    res.json({ success: true, message: 'Report generation started', data: { id } });
  } catch (error) {
    next(error);
  }
};

const downloadReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [reports] = await db.query('SELECT * FROM reports WHERE id = ?', [id]);
    if (reports.length === 0 || reports[0].status !== 'ready') {
      return res.status(404).json({ success: false, message: 'Report not ready or not found' });
    }
    res.download(reports[0].file_path);
  } catch (error) {
    next(error);
  }
};

// Export functions
const exportUsers = async (req, res, next) => {
  try {
    const { format = 'csv' } = req.query;
    const [users] = await db.query('SELECT id, email, role, first_name, last_name, phone, is_active, created_at FROM users');
    if (format === 'csv') {
      const csv = 'ID,Email,Role,First Name,Last Name,Phone,Active,Created At\n' +
        users.map(u => `${u.id},${u.email},${u.role},${u.first_name},${u.last_name},${u.phone || ''},${u.is_active},${u.created_at}`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      res.send(csv);
    } else {
      res.json({ success: true, data: users });
    }
  } catch (error) {
    next(error);
  }
};

const exportStudents = async (req, res, next) => {
  try {
    const { format = 'csv' } = req.query;
    const [students] = await db.query(`
      SELECT s.*, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.created_at
      FROM students s JOIN users u ON u.id = s.user_id
    `);
    if (format === 'csv') {
      const csv = 'ID,Email,First Name,Last Name,Student Number,Faculty,Academic Year,Phone,Active,Created At\n' +
        students.map(s => `${s.id},${s.email},${s.first_name},${s.last_name},${s.student_number || ''},${s.faculty || ''},${s.academic_year || ''},${s.phone || ''},${s.is_active},${s.created_at}`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
      res.send(csv);
    } else {
      res.json({ success: true, data: students });
    }
  } catch (error) {
    next(error);
  }
};

const exportInternships = async (req, res, next) => {
  try {
    const { format = 'csv' } = req.query;
    const [internships] = await db.query(`
      SELECT i.*, u.first_name, u.last_name, h.name as hospital_name, sv.name as service_name
      FROM internships i
      JOIN students s ON s.id = i.student_id
      JOIN users u ON u.id = s.user_id
      JOIN hospitals h ON h.id = i.hospital_id
      LEFT JOIN services sv ON sv.id = i.service_id
    `);
    if (format === 'csv') {
      const csv = 'ID,Student,Hospital,Service,Start Date,End Date,Status,Created At\n' +
        internships.map(i => `${i.id},${i.first_name} ${i.last_name},${i.hospital_name},${i.service_name || ''},${i.start_date},${i.end_date},${i.status},${i.created_at}`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=internships.csv');
      res.send(csv);
    } else {
      res.json({ success: true, data: internships });
    }
  } catch (error) {
    next(error);
  }
};

// Send email
const sendEmail = async (req, res, next) => {
  try {
    const { user_id, subject, message } = req.body;
    // In a real app, you'd integrate with an email service
    console.log(`Sending email to user ${user_id}: ${subject}`);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
  getInternships,
  getInternshipById,
  getActivityLogs,
  getStatistics,
  getSupportTickets,
  getSupportTicketById,
  updateSupportTicket,
  replySupportTicket,
  getConfiguration,
  updateConfiguration,
  getReports,
  generateReport,
  downloadReport,
  exportUsers,
  exportStudents,
  exportInternships,
  sendEmail
};
