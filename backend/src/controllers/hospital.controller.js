const db = require('../config/database');
const { paginate, paginationResponse } = require('../utils/helpers');

// Get all hospitals
const getAllHospitals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, city, type } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (h.name LIKE ? OR h.city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (city) {
      whereClause += ' AND h.city = ?';
      params.push(city);
    }

    if (type) {
      whereClause += ' AND h.type = ?';
      params.push(type);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM hospitals h WHERE ${whereClause}`,
      params
    );

    const [hospitals] = await db.query(
      `SELECT h.*, 
              (SELECT COUNT(*) FROM services s WHERE s.hospital_id = h.id AND s.is_active = TRUE) as services_count,
              (SELECT COUNT(*) FROM stage_offers o WHERE o.hospital_id = h.id AND o.status = 'published') as active_offers,
              (SELECT COUNT(*) FROM internships i WHERE i.hospital_id = h.id AND i.status = 'active') as current_interns
       FROM hospitals h
       WHERE ${whereClause}
       ORDER BY h.name ASC
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
      `SELECT h.*, u.email, u.first_name, u.last_name
       FROM hospitals h
       JOIN users u ON u.id = h.user_id
       WHERE h.id = ?`,
      [id]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Get services
    const [services] = await db.query(
      'SELECT * FROM services WHERE hospital_id = ? AND is_active = TRUE',
      [id]
    );

    // Get active offers
    const [offers] = await db.query(
      `SELECT * FROM stage_offers WHERE hospital_id = ? AND status = 'published' ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...hospitals[0],
        services,
        offers
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital dashboard
const getHospitalDashboard = async (req, res, next) => {
  try {
    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }
    const hospitalId = hospitals[0].id;

    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM stage_offers WHERE hospital_id = ? AND status = 'published') as active_offers,
        (SELECT COUNT(*) FROM applications a JOIN stage_offers o ON o.id = a.offer_id WHERE o.hospital_id = ? AND a.status = 'pending') as pending_applications,
        (SELECT COUNT(*) FROM internships WHERE hospital_id = ? AND status = 'active') as current_interns,
        (SELECT COUNT(*) FROM services WHERE hospital_id = ? AND is_active = TRUE) as total_services,
        (SELECT COUNT(*) FROM doctors WHERE hospital_id = ?) as total_tutors,
        (SELECT COUNT(*) FROM internships WHERE hospital_id = ? AND status = 'completed') as completed_internships
    `, [hospitalId, hospitalId, hospitalId, hospitalId, hospitalId, hospitalId]);

    // Recent applications
    const [recentApplications] = await db.query(`
      SELECT a.*, o.title as offer_title, 
             u.first_name, u.last_name, u.avatar
      FROM applications a
      JOIN stage_offers o ON o.id = a.offer_id
      JOIN students s ON s.id = a.student_id
      JOIN users u ON u.id = s.user_id
      WHERE o.hospital_id = ?
      ORDER BY a.created_at DESC
      LIMIT 5
    `, [hospitalId]);

    // Current interns
    const [currentInterns] = await db.query(`
      SELECT i.*, u.first_name, u.last_name, u.avatar, sv.name as service_name
      FROM internships i
      JOIN students s ON s.id = i.student_id
      JOIN users u ON u.id = s.user_id
      LEFT JOIN services sv ON sv.id = i.service_id
      WHERE i.hospital_id = ? AND i.status = 'active'
      ORDER BY i.start_date DESC
      LIMIT 5
    `, [hospitalId]);

    // Recent activities
    const [activities] = await db.query(`
      SELECT 'application' as type, a.status, a.created_at, o.title as description,
             CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM applications a
      JOIN stage_offers o ON o.id = a.offer_id
      JOIN students s ON s.id = a.student_id
      JOIN users u ON u.id = s.user_id
      WHERE o.hospital_id = ?
      ORDER BY a.created_at DESC
      LIMIT 10
    `, [hospitalId]);

    res.json({
      success: true,
      data: {
        stats: stats[0],
        recentApplications,
        currentInterns,
        activities
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital profile
const getHospitalProfile = async (req, res, next) => {
  try {
    const [hospitals] = await db.query(
      `SELECT h.*, u.email, u.phone as user_phone, u.avatar
       FROM hospitals h
       JOIN users u ON u.id = h.user_id
       WHERE h.user_id = ?`,
      [req.user.id]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }

    res.json({
      success: true,
      data: hospitals[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update hospital profile
const updateHospitalProfile = async (req, res, next) => {
  try {
    const updates = req.body;

    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }

    // Update hospital fields
    await db.query(
      `UPDATE hospitals SET 
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        description = COALESCE(?, description),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        website = COALESCE(?, website),
        logo = COALESCE(?, logo)
       WHERE user_id = ?`,
      [updates.name, updates.type, updates.description, updates.address, updates.city,
      updates.phone, updates.email, updates.website, updates.logo, req.user.id]
    );

    // Update user phone if provided
    if (updates.contact_phone) {
      await db.query('UPDATE users SET phone = ? WHERE id = ?', [updates.contact_phone, req.user.id]);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital's current students
const getHospitalStudents = async (req, res, next) => {
  try {
    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }
    const hospitalId = hospitals[0].id;

    const { status, search, department } = req.query;

    let whereClause = 'i.hospital_id = ?';
    const params = [hospitalId];

    if (status && status !== 'all') {
      whereClause += ' AND i.status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (u.first_name LIKE ? OR u.last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (department) {
      whereClause += ' AND sv.department = ?';
      params.push(department);
    }

    const [students] = await db.query(`
      SELECT i.*, s.student_number, s.faculty, s.academic_year,
             u.id as user_id, u.first_name, u.last_name, u.email, u.phone, u.avatar,
             sv.name as service_name, sv.department,
             CONCAT(tu.first_name, ' ', tu.last_name) as tutor_name
      FROM internships i
      JOIN students s ON s.id = i.student_id
      JOIN users u ON u.id = s.user_id
      LEFT JOIN services sv ON sv.id = i.service_id
      LEFT JOIN doctors d ON d.id = i.tutor_id
      LEFT JOIN users tu ON tu.id = d.user_id
      WHERE ${whereClause}
      ORDER BY i.start_date DESC
    `, params);

    // Get departments for filtering
    const [departments] = await db.query(
      'SELECT DISTINCT department FROM services WHERE hospital_id = ? AND department IS NOT NULL',
      [hospitalId]
    );

    res.json({
      success: true,
      data: students,
      departments: departments.map(d => d.department)
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital statistics
const getHospitalStatistics = async (req, res, next) => {
  try {
    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }
    const hospitalId = hospitals[0].id;

    const { period, start_date, end_date } = req.query;

    let dateFilter = '';
    if (period === 'last_month') {
      dateFilter = 'AND a.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
    } else if (period === 'last_year') {
      dateFilter = 'AND a.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
    } else if (start_date && end_date) {
      dateFilter = `AND a.created_at BETWEEN '${start_date}' AND '${end_date}'`;
    }

    // Monthly applications
    const [monthlyApplications] = await db.query(`
      SELECT 
        DATE_FORMAT(a.created_at, '%Y-%m') as month,
        COUNT(*) as total,
        SUM(CASE WHEN a.status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM applications a
      JOIN stage_offers o ON o.id = a.offer_id
      WHERE o.hospital_id = ? ${dateFilter}
      GROUP BY DATE_FORMAT(a.created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, [hospitalId]);

    // Service utilization
    const [serviceStats] = await db.query(`
      SELECT sv.name, sv.department,
             COUNT(i.id) as intern_count,
             sv.capacity,
             ROUND((COUNT(i.id) / sv.capacity) * 100, 1) as utilization_rate
      FROM services sv
      LEFT JOIN internships i ON i.service_id = sv.id AND i.status = 'active'
      WHERE sv.hospital_id = ?
      GROUP BY sv.id
    `, [hospitalId]);

    // Tutor performance
    const [tutorStats] = await db.query(`
      SELECT CONCAT(u.first_name, ' ', u.last_name) as tutor_name,
             COUNT(i.id) as students_count,
             AVG(e.overall_score) as avg_evaluation
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      LEFT JOIN internships i ON i.tutor_id = d.id
      LEFT JOIN evaluations e ON e.evaluator_id = u.id
      WHERE d.hospital_id = ?
      GROUP BY d.id
    `, [hospitalId]);

    // Department distribution
    const [departmentStats] = await db.query(`
      SELECT sv.department, COUNT(i.id) as intern_count
      FROM services sv
      LEFT JOIN internships i ON i.service_id = sv.id AND i.status = 'active'
      WHERE sv.hospital_id = ? AND sv.department IS NOT NULL
      GROUP BY sv.department
    `, [hospitalId]);

    // Overall stats
    const [overallStats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM applications a JOIN stage_offers o ON o.id = a.offer_id WHERE o.hospital_id = ?) as total_applications,
        (SELECT COUNT(*) FROM internships WHERE hospital_id = ?) as total_internships,
        (SELECT COUNT(*) FROM internships WHERE hospital_id = ? AND status = 'completed') as completed_internships,
        (SELECT AVG(overall_score) FROM evaluations e JOIN internships i ON i.id = e.internship_id WHERE i.hospital_id = ?) as avg_evaluation
    `, [hospitalId, hospitalId, hospitalId, hospitalId]);

    res.json({
      success: true,
      data: {
        monthlyApplications,
        serviceStats,
        tutorStats,
        departmentStats,
        overallStats: overallStats[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHospitals,
  getHospitalById,
  getHospitalDashboard,
  getHospitalProfile,
  updateHospitalProfile,
  getHospitalStudents,
  getHospitalStatistics
};
