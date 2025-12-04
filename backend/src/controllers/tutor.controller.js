const db = require('../config/database');
const { generateId, hashPassword } = require('../utils/helpers');

// Get hospital's tutors
const getHospitalTutors = async (req, res, next) => {
  try {
    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }
    const hospitalId = hospitals[0].id;

    const { search, department } = req.query;

    let whereClause = 'd.hospital_id = ?';
    const params = [hospitalId];

    if (search) {
      whereClause += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (department) {
      whereClause += ' AND d.department = ?';
      params.push(department);
    }

    const [tutors] = await db.query(
      `SELECT d.*, u.first_name, u.last_name, u.email, u.phone, u.avatar, u.is_active,
              (SELECT COUNT(*) FROM internships WHERE tutor_id = d.id AND status = 'active') as active_students
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       WHERE ${whereClause}
       ORDER BY u.last_name, u.first_name`,
      params
    );

    // Get departments for filtering
    const [departments] = await db.query(
      'SELECT DISTINCT department FROM doctors WHERE hospital_id = ? AND department IS NOT NULL',
      [hospitalId]
    );

    res.json({
      success: true,
      data: tutors,
      departments: departments.map(d => d.department)
    });
  } catch (error) {
    next(error);
  }
};

// Get tutor by ID
const getTutorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [tutors] = await db.query(
      `SELECT d.*, u.first_name, u.last_name, u.email, u.phone, u.avatar, u.is_active,
              h.name as hospital_name
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN hospitals h ON h.id = d.hospital_id
       WHERE d.id = ?`,
      [id]
    );

    if (tutors.length === 0) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    // Get assigned students
    const [students] = await db.query(
      `SELECT i.*, su.first_name, su.last_name, su.avatar, sv.name as service_name
       FROM internships i
       JOIN students s ON s.id = i.student_id
       JOIN users su ON su.id = s.user_id
       LEFT JOIN services sv ON sv.id = i.service_id
       WHERE i.tutor_id = ? AND i.status = 'active'`,
      [id]
    );

    res.json({
      success: true,
      data: { ...tutors[0], students }
    });
  } catch (error) {
    next(error);
  }
};

// Add tutor to hospital
const addTutor = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, phone, specialization, 
            department, title, license_number, years_experience, max_students } = req.body;

    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }
    const hospitalId = hospitals[0].id;

    // Check if email exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const userId = generateId();
    const doctorId = generateId();

    // Create user
    await db.query(
      `INSERT INTO users (id, email, password, role, first_name, last_name, phone)
       VALUES (?, ?, ?, 'doctor', ?, ?, ?)`,
      [userId, email, hashedPassword, first_name, last_name, phone]
    );

    // Create doctor profile
    await db.query(
      `INSERT INTO doctors (id, user_id, hospital_id, specialization, department, title, 
       license_number, years_experience, max_students)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [doctorId, userId, hospitalId, specialization, department, title, 
       license_number, years_experience, max_students || 5]
    );

    // Create settings
    await db.query('INSERT INTO settings (id, user_id) VALUES (?, ?)', [generateId(), userId]);

    res.status(201).json({
      success: true,
      message: 'Tutor added successfully',
      data: { id: doctorId }
    });
  } catch (error) {
    next(error);
  }
};

// Update tutor
const updateTutor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, specialization, department, 
            title, license_number, years_experience, max_students, is_available } = req.body;

    // Verify ownership
    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    const [tutor] = await db.query('SELECT hospital_id, user_id FROM doctors WHERE id = ?', [id]);

    if (tutor.length === 0) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    if (req.user.role === 'hospital' && tutor[0].hospital_id !== hospitals[0]?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Update user info
    if (first_name || last_name || phone) {
      await db.query(
        'UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone) WHERE id = ?',
        [first_name, last_name, phone, tutor[0].user_id]
      );
    }

    // Update doctor profile
    await db.query(
      `UPDATE doctors SET specialization = COALESCE(?, specialization), 
       department = COALESCE(?, department), title = COALESCE(?, title),
       license_number = COALESCE(?, license_number), years_experience = COALESCE(?, years_experience),
       max_students = COALESCE(?, max_students), is_available = COALESCE(?, is_available)
       WHERE id = ?`,
      [specialization, department, title, license_number, years_experience, max_students, is_available, id]
    );

    res.json({
      success: true,
      message: 'Tutor updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Remove tutor from hospital
const removeTutor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    const [tutor] = await db.query('SELECT hospital_id FROM doctors WHERE id = ?', [id]);

    if (tutor.length === 0) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    if (tutor[0].hospital_id !== hospitals[0]?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check for active students
    const [activeStudents] = await db.query(
      'SELECT COUNT(*) as count FROM internships WHERE tutor_id = ? AND status = "active"',
      [id]
    );

    if (activeStudents[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove tutor with active students'
      });
    }

    // Remove hospital association (don't delete the doctor account)
    await db.query('UPDATE doctors SET hospital_id = NULL WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Tutor removed from hospital'
    });
  } catch (error) {
    next(error);
  }
};

// Assign student to tutor
const assignStudent = async (req, res, next) => {
  try {
    const { tutor_id, internship_id } = req.body;

    // Verify tutor capacity
    const [tutor] = await db.query(
      `SELECT d.max_students, 
              (SELECT COUNT(*) FROM internships WHERE tutor_id = d.id AND status = 'active') as current_students
       FROM doctors d WHERE d.id = ?`,
      [tutor_id]
    );

    if (tutor.length === 0) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    if (tutor[0].current_students >= tutor[0].max_students) {
      return res.status(400).json({ success: false, message: 'Tutor has reached maximum student capacity' });
    }

    await db.query('UPDATE internships SET tutor_id = ? WHERE id = ?', [tutor_id, internship_id]);

    res.json({
      success: true,
      message: 'Student assigned to tutor successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get doctor dashboard (for logged-in doctor)
const getDoctorDashboard = async (req, res, next) => {
  try {
    const [doctors] = await db.query('SELECT id, hospital_id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (doctors.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    const doctorId = doctors[0].id;

    // Get stats
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM internships WHERE tutor_id = ? AND status = 'active') as active_students,
        (SELECT COUNT(*) FROM attendance WHERE validated_by = ?) as validated_attendance,
        (SELECT COUNT(*) FROM evaluations WHERE evaluator_id = ?) as completed_evaluations,
        (SELECT COUNT(*) FROM logbook_entries l JOIN internships i ON i.id = l.internship_id WHERE i.tutor_id = ? AND l.status = 'pending') as pending_reviews,
        (SELECT COUNT(*) FROM attendance a JOIN internships i ON i.id = a.internship_id WHERE i.tutor_id = ? AND a.status = 'pending') as pending_attendance
    `, [doctorId, req.user.id, req.user.id, doctorId, doctorId]);

    // Get students
    const [students] = await db.query(`
      SELECT i.*, u.first_name, u.last_name, u.avatar, u.email,
             s.student_number, s.faculty, sv.name as service_name,
             h.name as hospital_name,
             DATEDIFF(i.end_date, CURDATE()) as days_remaining,
             (SELECT COUNT(*) FROM attendance WHERE internship_id = i.id AND status = 'pending') as pending_attendance
      FROM internships i
      JOIN students s ON s.id = i.student_id
      JOIN users u ON u.id = s.user_id
      JOIN hospitals h ON h.id = i.hospital_id
      LEFT JOIN services sv ON sv.id = i.service_id
      WHERE i.tutor_id = ? AND i.status = 'active'
      ORDER BY i.start_date DESC
    `, [doctorId]);

    // Pending tasks
    const [pendingTasks] = await db.query(`
      SELECT 'attendance' as type, a.id, u.first_name, u.last_name, a.date as created_at
      FROM attendance a
      JOIN internships i ON i.id = a.internship_id
      JOIN students s ON s.id = i.student_id
      JOIN users u ON u.id = s.user_id
      WHERE i.tutor_id = ? AND a.status = 'pending'
      UNION ALL
      SELECT 'logbook' as type, l.id, u.first_name, u.last_name, l.date as created_at
      FROM logbook_entries l
      JOIN internships i ON i.id = l.internship_id
      JOIN students s ON s.id = i.student_id
      JOIN users u ON u.id = s.user_id
      WHERE i.tutor_id = ? AND l.status = 'pending'
      ORDER BY created_at DESC
      LIMIT 10
    `, [doctorId, doctorId]);

    // Recent activities
    const [activities] = await db.query(`
      SELECT 'evaluation' as type, e.type as status, e.created_at, 
             CONCAT(u.first_name, ' ', u.last_name) as description
      FROM evaluations e
      JOIN students s ON s.id = e.student_id
      JOIN users u ON u.id = s.user_id
      WHERE e.evaluator_id = ?
      ORDER BY e.created_at DESC
      LIMIT 5
    `, [req.user.id]);

    res.json({
      success: true,
      data: {
        stats: stats[0],
        students,
        pending_tasks: pendingTasks,
        activities
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get doctor's students
const getDoctorStudents = async (req, res, next) => {
  try {
    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (doctors.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    const doctorId = doctors[0].id;

    const { status = 'active', search } = req.query;

    let whereClause = 'i.tutor_id = ?';
    const params = [doctorId];

    if (status) {
      whereClause += ' AND i.status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (u.first_name LIKE ? OR u.last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [students] = await db.query(`
      SELECT i.*, u.first_name, u.last_name, u.avatar, u.email, u.phone,
             s.student_number, s.faculty, s.academic_year,
             sv.name as service_name, h.name as hospital_name,
             (SELECT AVG(overall_score) FROM evaluations WHERE student_id = s.id) as avg_evaluation,
             (SELECT COUNT(*) FROM attendance WHERE internship_id = i.id AND status IN ('approved', 'present')) as attendance_count
      FROM internships i
      JOIN students s ON s.id = i.student_id
      JOIN users u ON u.id = s.user_id
      JOIN hospitals h ON h.id = i.hospital_id
      LEFT JOIN services sv ON sv.id = i.service_id
      WHERE ${whereClause}
      ORDER BY i.start_date DESC
    `, params);

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// Get doctor's student by ID
const getDoctorStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (doctors.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const [internships] = await db.query(`
      SELECT i.*, u.first_name, u.last_name, u.avatar, u.email, u.phone,
             s.student_number, s.faculty, s.academic_year, s.id as student_id,
             sv.name as service_name, h.name as hospital_name
      FROM internships i
      JOIN students s ON s.id = i.student_id
      JOIN users u ON u.id = s.user_id
      JOIN hospitals h ON h.id = i.hospital_id
      LEFT JOIN services sv ON sv.id = i.service_id
      WHERE i.id = ? AND i.tutor_id = ?
    `, [id, doctors[0].id]);

    if (internships.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found or not assigned to you' });
    }

    // Get attendance
    const [attendance] = await db.query(
      'SELECT * FROM attendance WHERE internship_id = ? ORDER BY date DESC LIMIT 30',
      [id]
    );

    // Get logbook entries
    const [logbookEntries] = await db.query(
      'SELECT * FROM logbook_entries WHERE internship_id = ? ORDER BY date DESC LIMIT 10',
      [id]
    );

    // Get evaluations
    const [evaluations] = await db.query(
      'SELECT * FROM evaluations WHERE internship_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...internships[0],
        attendance,
        logbookEntries,
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
      'SELECT DISTINCT department FROM doctors WHERE department IS NOT NULL'
    );

    res.json({
      success: true,
      data: departments.map(d => d.department)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHospitalTutors,
  getTutorById,
  addTutor,
  updateTutor,
  removeTutor,
  assignStudent,
  getDoctorDashboard,
  getDoctorStudents,
  getDoctorStudentById,
  getDepartments
};
