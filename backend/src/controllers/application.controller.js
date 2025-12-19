const db = require('../config/database');
const { generateId, paginate, paginationResponse } = require('../utils/helpers');
const { createNotification } = require('./notification.controller');

// Create application
const createApplication = async (req, res, next) => {
  try {
    const { offer_id, cover_letter, motivation, experience, availability_date } = req.body;

    // Get student ID
    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    const studentId = students[0].id;

    // Check if offer exists and is open
    const [offers] = await db.query(
      'SELECT * FROM stage_offers WHERE id = ? AND status = "published"',
      [offer_id]
    );
    if (offers.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found or closed' });
    }

    // Check if already applied
    const [existing] = await db.query(
      'SELECT id FROM applications WHERE student_id = ? AND offer_id = ?',
      [studentId, offer_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already applied to this offer' });
    }

    // Check available positions
    const offer = offers[0];
    if (offer.filled_positions >= offer.positions) {
      return res.status(400).json({ success: false, message: 'No positions available' });
    }

    const id = generateId();

    // Normalize availability_date: store NULL when not provided
    const dbAvailabilityDate = availability_date && availability_date.trim() !== ''
      ? availability_date
      : null;

    await db.query(
      `INSERT INTO applications (id, student_id, offer_id, cover_letter, motivation, experience, availability_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, studentId, offer_id, cover_letter, motivation, experience, dbAvailabilityDate]
    );

    // Notify hospital
    const [hospital] = await db.query('SELECT user_id FROM hospitals WHERE id = ?', [offer.hospital_id]);
    if (hospital.length > 0) {
      await createNotification(
        hospital[0].user_id,
        'application',
        'New Application',
        `A new application has been submitted for "${offer.title}"`,
        { application_id: id, offer_id }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

// Get student's applications
const getMyApplications = async (req, res, next) => {
  try {
    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    const studentId = students[0].id;

    const { status } = req.query;

    let whereClause = 'a.student_id = ?';
    const params = [studentId];

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    const [applications] = await db.query(
      `SELECT a.*, o.title as offer_title, o.department, o.start_date, o.end_date, o.type,
              h.name as hospital_name, h.city as hospital_city, h.logo as hospital_logo
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

// Get application by ID
const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [applications] = await db.query(
      `SELECT a.*, o.title as offer_title, o.description as offer_description, 
              o.department, o.start_date, o.end_date, o.requirements, o.type,
              h.name as hospital_name, h.city as hospital_city, h.address as hospital_address,
              s.student_number, s.faculty, s.academic_year, s.user_id as student_user_id,
              u.first_name, u.last_name, u.email, u.phone, u.avatar
       FROM applications a
       JOIN stage_offers o ON o.id = a.offer_id
       JOIN hospitals h ON h.id = o.hospital_id
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       WHERE a.id = ?`,
      [id]
    );

    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const application = applications[0];

    // Get attached application-specific documents
    const [applicationDocuments] = await db.query(
      'SELECT * FROM documents WHERE application_id = ?',
      [id]
    );

    // Get profile-level documents for this student (reusable profile docs)
    const [profileDocuments] = await db.query(
      `SELECT d.*
       FROM documents d
       WHERE d.user_id = ? AND d.application_id IS NULL
       ORDER BY d.created_at DESC`,
      [application.student_user_id]
    );

    res.json({
      success: true,
      data: {
        ...application,
        application_documents: applicationDocuments,
        profile_documents: profileDocuments
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital's received applications
const getHospitalApplications = async (req, res, next) => {
  try {
    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }
    const hospitalId = hospitals[0].id;

    const { page = 1, limit = 10, status, offer_id, search, department } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    let whereClause = 'o.hospital_id = ?';
    const params = [hospitalId];

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    if (offer_id) {
      whereClause += ' AND a.offer_id = ?';
      params.push(offer_id);
    }

    if (search) {
      whereClause += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR o.title LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (department) {
      whereClause += ' AND o.department = ?';
      params.push(department);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM applications a
       JOIN stage_offers o ON o.id = a.offer_id
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       WHERE ${whereClause}`,
      params
    );

    const [applications] = await db.query(
      `SELECT a.*, o.title as offer_title, o.department,
              s.student_number, s.faculty, s.academic_year,
              u.first_name, u.last_name, u.email, u.avatar
       FROM applications a
       JOIN stage_offers o ON o.id = a.offer_id
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       WHERE ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageLimit, offset]
    );

    // Get departments for filtering
    const [departments] = await db.query(
      'SELECT DISTINCT o.department FROM stage_offers o WHERE o.hospital_id = ? AND o.department IS NOT NULL',
      [hospitalId]
    );

    res.json({
      success: true,
      ...paginationResponse(applications, countResult[0].total, page, limit),
      departments: departments.map(d => d.department)
    });
  } catch (error) {
    next(error);
  }
};

// Update application status (hospital)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason, notes } = req.body;

    const validStatuses = ['reviewing', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Verify hospital owns this application
    const [applications] = await db.query(
      `SELECT a.*, o.hospital_id, o.positions, o.filled_positions, o.title, s.user_id as student_user_id
       FROM applications a
       JOIN stage_offers o ON o.id = a.offer_id
       JOIN students s ON s.id = a.student_id
       WHERE a.id = ?`,
      [id]
    );

    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const application = applications[0];

    // Verify ownership
    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    if (hospitals[0]?.id !== application.hospital_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Update application
    await db.query(
      `UPDATE applications SET status = ?, rejection_reason = ?, notes = ?, 
       reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
      [status, rejection_reason, notes, req.user.id, id]
    );

    // Notify student
    const notificationTitle = status === 'accepted' ? 'Application Accepted!' :
      status === 'rejected' ? 'Application Update' : 'Application Under Review';
    const notificationMessage = status === 'accepted' ?
      `Congratulations! Your application for "${application.title}" has been accepted.` :
      status === 'rejected' ?
        `Your application for "${application.title}" was not selected.${rejection_reason ? ' Reason: ' + rejection_reason : ''}` :
        `Your application for "${application.title}" is now under review.`;

    await createNotification(application.student_user_id, 'application', notificationTitle, notificationMessage, { application_id: id });

    // If accepted, create internship and update offer
    if (status === 'accepted') {
      const internshipId = generateId();
      const [offer] = await db.query('SELECT * FROM stage_offers WHERE id = ?', [application.offer_id]);

      const internshipStatus = new Date(offer[0].start_date) <= new Date() ? 'active' : 'upcoming';

      await db.query(
        `INSERT INTO internships (id, application_id, student_id, hospital_id, service_id, start_date, end_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [internshipId, id, application.student_id, application.hospital_id,
          offer[0].service_id, offer[0].start_date, offer[0].end_date, internshipStatus]
      );

      // Update filled positions
      await db.query(
        'UPDATE stage_offers SET filled_positions = COALESCE(filled_positions, 0) + 1 WHERE id = ?',
        [application.offer_id]
      );
    }

    res.json({
      success: true,
      message: `Application ${status} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw application (student)
const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    const [application] = await db.query('SELECT student_id, status FROM applications WHERE id = ?', [id]);

    if (application.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application[0].student_id !== students[0]?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (application[0].status === 'accepted') {
      return res.status(400).json({ success: false, message: 'Cannot withdraw accepted application' });
    }

    // Fully remove application from database
    await db.query('DELETE FROM applications WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Application withdrawn and removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get departments
const getDepartments = async (req, res, next) => {
  try {
    const [departments] = await db.query(
      'SELECT DISTINCT department FROM stage_offers WHERE department IS NOT NULL'
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
  createApplication,
  getMyApplications,
  getApplicationById,
  getHospitalApplications,
  updateApplicationStatus,
  withdrawApplication,
  getDepartments
};
