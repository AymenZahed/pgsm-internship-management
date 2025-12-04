const db = require('../config/database');
const { paginate, paginationResponse } = require('../utils/helpers');

// Get all students (for admin/hospital/doctor)
const getAllStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, faculty } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR s.student_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (faculty) {
      whereClause += ' AND s.faculty = ?';
      params.push(faculty);
    }

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM students s 
       JOIN users u ON u.id = s.user_id 
       WHERE ${whereClause}`,
      params
    );

    // Get students
    const [students] = await db.query(
      `SELECT s.*, u.id as user_id, u.email, u.first_name, u.last_name, u.phone, u.avatar, u.is_active,
              (SELECT COUNT(*) FROM internships i WHERE i.student_id = s.id AND i.status = 'active') as active_internships,
              (SELECT COUNT(*) FROM applications a WHERE a.student_id = s.id) as total_applications
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
      `SELECT s.*, u.id as user_id, u.email, u.first_name, u.last_name, u.phone, u.avatar, u.created_at
       FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student's internships
    const [internships] = await db.query(
      `SELECT i.*, h.name as hospital_name, sv.name as service_name
       FROM internships i
       JOIN hospitals h ON h.id = i.hospital_id
       LEFT JOIN services sv ON sv.id = i.service_id
       WHERE i.student_id = ?
       ORDER BY i.start_date DESC`,
      [id]
    );

    // Get student's evaluations
    const [evaluations] = await db.query(
      `SELECT e.*, u.first_name as evaluator_first_name, u.last_name as evaluator_last_name
       FROM evaluations e
       JOIN users u ON u.id = e.evaluator_id
       WHERE e.student_id = ?
       ORDER BY e.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...students[0],
        internships,
        evaluations
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get student's internships
const getStudentInternships = async (req, res, next) => {
  try {
    const studentId = req.params.id;
    const { status } = req.query;

    let whereClause = 'i.student_id = ?';
    const params = [studentId];

    if (status) {
      whereClause += ' AND i.status = ?';
      params.push(status);
    }

    const [internships] = await db.query(
      `SELECT i.*, h.name as hospital_name, h.city as hospital_city, 
              sv.name as service_name, 
              CONCAT(u.first_name, ' ', u.last_name) as tutor_name
       FROM internships i
       JOIN hospitals h ON h.id = i.hospital_id
       LEFT JOIN services sv ON sv.id = i.service_id
       LEFT JOIN doctors d ON d.id = i.tutor_id
       LEFT JOIN users u ON u.id = d.user_id
       WHERE ${whereClause}
       ORDER BY i.start_date DESC`,
      params
    );

    res.json({
      success: true,
      data: internships
    });
  } catch (error) {
    next(error);
  }
};

// Get student's applications
const getStudentApplications = async (req, res, next) => {
  try {
    const studentId = req.params.id;
    const { status } = req.query;

    let whereClause = 'a.student_id = ?';
    const params = [studentId];

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    const [applications] = await db.query(
      `SELECT a.*, o.title as offer_title, o.department, o.start_date, o.end_date,
              h.name as hospital_name, h.city as hospital_city
       FROM applications a
       JOIN stage_offers o ON o.id = a.offer_id
       JOIN hospitals h ON h.id = o.hospital_id
       WHERE ${whereClause}
       ORDER BY a.created_at DESC`,
      params
    );

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// Get student dashboard stats
const getStudentDashboard = async (req, res, next) => {
  try {
    // Get student ID from user
    const [students] = await db.query('SELECT * FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    const student = students[0];
    const studentId = student.id;

    // Get stats
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM applications WHERE student_id = ?) as total_applications,
        (SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = 'pending') as pending_applications,
        (SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = 'accepted') as accepted_applications,
        (SELECT COUNT(*) FROM internships WHERE student_id = ? AND status = 'active') as active_internships,
        (SELECT COUNT(*) FROM internships WHERE student_id = ? AND status = 'completed') as completed_internships,
        (SELECT AVG(overall_score) FROM evaluations WHERE student_id = ?) as average_score
    `, [studentId, studentId, studentId, studentId, studentId, studentId]);

    // Profile completion calculation
    const fields = ['first_name', 'last_name', 'student_number', 'faculty', 'academic_year', 'department'];
    const userData = { ...req.user, ...student };
    const filledFields = fields.filter(f => userData[f]).length;
    const profileCompletion = Math.round((filledFields / fields.length) * 100);

    // Get upcoming deadlines
    const [deadlines] = await db.query(`
      SELECT o.id, o.title, o.application_deadline, h.name as hospital_name
      FROM stage_offers o
      JOIN hospitals h ON h.id = o.hospital_id
      WHERE o.status = 'published' 
        AND o.application_deadline >= CURDATE()
        AND o.id NOT IN (SELECT offer_id FROM applications WHERE student_id = ?)
      ORDER BY o.application_deadline ASC
      LIMIT 5
    `, [studentId]);

    // Get recent activity
    const [activities] = await db.query(`
      SELECT 'application' as type, a.status, a.created_at, o.title as description
      FROM applications a
      JOIN stage_offers o ON o.id = a.offer_id
      WHERE a.student_id = ?
      UNION ALL
      SELECT 'evaluation' as type, e.type as status, e.created_at, 
             CONCAT('Evaluation from ', u.first_name, ' ', u.last_name) as description
      FROM evaluations e
      JOIN users u ON u.id = e.evaluator_id
      WHERE e.student_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [studentId, studentId]);

    // Current internship
    const [currentInternship] = await db.query(`
      SELECT i.*, h.name as hospital_name, sv.name as service_name,
             CONCAT(tu.first_name, ' ', tu.last_name) as tutor_name,
             DATEDIFF(i.end_date, CURDATE()) as days_remaining,
             DATEDIFF(CURDATE(), i.start_date) as days_completed,
             DATEDIFF(i.end_date, i.start_date) as total_days
      FROM internships i
      JOIN hospitals h ON h.id = i.hospital_id
      LEFT JOIN services sv ON sv.id = i.service_id
      LEFT JOIN doctors d ON d.id = i.tutor_id
      LEFT JOIN users tu ON tu.id = d.user_id
      WHERE i.student_id = ? AND i.status = 'active'
      LIMIT 1
    `, [studentId]);

    res.json({
      success: true,
      data: {
        stats: { ...stats[0], profile_completion: profileCompletion },
        deadlines,
        activities,
        currentInternship: currentInternship[0] || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get my internships (for logged-in student)
const getMyInternships = async (req, res, next) => {
  try {
    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    const studentId = students[0].id;

    const { status } = req.query;

    let whereClause = 'i.student_id = ?';
    const params = [studentId];

    if (status) {
      whereClause += ' AND i.status = ?';
      params.push(status);
    }

    const [internships] = await db.query(
      `SELECT i.*, h.name as hospital_name, h.city as hospital_city, h.logo as hospital_logo,
              sv.name as service_name, sv.department,
              CONCAT(tu.first_name, ' ', tu.last_name) as tutor_name,
              DATEDIFF(i.end_date, i.start_date) as total_days,
              DATEDIFF(LEAST(CURDATE(), i.end_date), i.start_date) as days_completed
       FROM internships i
       JOIN hospitals h ON h.id = i.hospital_id
       LEFT JOIN services sv ON sv.id = i.service_id
       LEFT JOIN doctors d ON d.id = i.tutor_id
       LEFT JOIN users tu ON tu.id = d.user_id
       WHERE ${whereClause}
       ORDER BY i.start_date DESC`,
      params
    );

    res.json({
      success: true,
      data: internships
    });
  } catch (error) {
    next(error);
  }
};

// Get my internship by ID
const getMyInternshipById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const [internships] = await db.query(
      `SELECT i.*, h.name as hospital_name, h.city as hospital_city, h.address as hospital_address,
              h.phone as hospital_phone, h.logo as hospital_logo,
              sv.name as service_name, sv.department, sv.floor,
              CONCAT(tu.first_name, ' ', tu.last_name) as tutor_name,
              tu.email as tutor_email, tu.phone as tutor_phone
       FROM internships i
       JOIN hospitals h ON h.id = i.hospital_id
       LEFT JOIN services sv ON sv.id = i.service_id
       LEFT JOIN doctors d ON d.id = i.tutor_id
       LEFT JOIN users tu ON tu.id = d.user_id
       WHERE i.id = ? AND i.student_id = ?`,
      [id, students[0].id]
    );

    if (internships.length === 0) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    // Get attendance summary
    const [attendanceSummary] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('approved', 'present') THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM attendance WHERE internship_id = ?
    `, [id]);

    // Get evaluations
    const [evaluations] = await db.query(
      `SELECT e.*, CONCAT(u.first_name, ' ', u.last_name) as evaluator_name
       FROM evaluations e
       JOIN users u ON u.id = e.evaluator_id
       WHERE e.internship_id = ?
       ORDER BY e.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...internships[0],
        attendanceSummary: attendanceSummary[0],
        evaluations
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get departments
const getDepartments = async (req, res, next) => {
  try {
    const [departments] = await db.query(
      'SELECT DISTINCT faculty FROM students WHERE faculty IS NOT NULL'
    );

    res.json({
      success: true,
      data: departments.map(d => d.faculty)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentInternships,
  getStudentApplications,
  getStudentDashboard,
  getMyInternships,
  getMyInternshipById,
  getDepartments
};
