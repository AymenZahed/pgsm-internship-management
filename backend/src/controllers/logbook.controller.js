const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Create logbook entry
const createEntry = async (req, res, next) => {
  try {
    const { internship_id, date, title, activities, skills_learned, reflections, challenges } = req.body;

    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Verify internship
    const [internships] = await db.query(
      'SELECT id FROM internships WHERE id = ? AND student_id = ?',
      [internship_id, students[0].id]
    );

    if (internships.length === 0) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    const id = uuidv4();
    await db.query(
      `INSERT INTO logbook_entries (id, internship_id, student_id, date, title, activities, 
       skills_learned, reflections, challenges, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, internship_id, students[0].id, date, title, activities, skills_learned, reflections, challenges]
    );

    res.status(201).json({
      success: true,
      message: 'Logbook entry created successfully',
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

// Get student's logbook entries
const getMyEntries = async (req, res, next) => {
  try {
    const { internship_id, status } = req.query;

    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    let whereClause = 'l.student_id = ?';
    const params = [students[0].id];

    if (internship_id) {
      whereClause += ' AND l.internship_id = ?';
      params.push(internship_id);
    }

    if (status) {
      whereClause += ' AND l.status = ?';
      params.push(status);
    }

    const [entries] = await db.query(
      `SELECT l.*, h.name as hospital_name
       FROM logbook_entries l
       JOIN internships i ON i.id = l.internship_id
       JOIN hospitals h ON h.id = i.hospital_id
       WHERE ${whereClause}
       ORDER BY l.date DESC`,
      params
    );

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

// Get entry by ID
const getEntryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [entries] = await db.query(
      `SELECT l.*, h.name as hospital_name,
              u.first_name as reviewer_first_name, u.last_name as reviewer_last_name
       FROM logbook_entries l
       JOIN internships i ON i.id = l.internship_id
       JOIN hospitals h ON h.id = i.hospital_id
       LEFT JOIN users u ON u.id = l.reviewed_by
       WHERE l.id = ?`,
      [id]
    );

    if (entries.length === 0) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    res.json({
      success: true,
      data: entries[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update logbook entry
const updateEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, activities, skills_learned, reflections, challenges } = req.body;

    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    const [entry] = await db.query('SELECT student_id, status FROM logbook_entries WHERE id = ?', [id]);

    if (entry.length === 0) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    if (entry[0].student_id !== students[0]?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (entry[0].status === 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot edit approved entry' });
    }

    await db.query(
      `UPDATE logbook_entries SET title = ?, activities = ?, skills_learned = ?, 
       reflections = ?, challenges = ?, status = 'pending' WHERE id = ?`,
      [title, activities, skills_learned, reflections, challenges, id]
    );

    res.json({
      success: true,
      message: 'Entry updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete logbook entry
const deleteEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    const [entry] = await db.query('SELECT student_id, status FROM logbook_entries WHERE id = ?', [id]);

    if (entry.length === 0) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    if (entry[0].student_id !== students[0]?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (entry[0].status === 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot delete approved entry' });
    }

    await db.query('DELETE FROM logbook_entries WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get pending entries for review (doctor)
const getPendingEntries = async (req, res, next) => {
  try {
    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (doctors.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const [entries] = await db.query(
      `SELECT l.*, u.first_name, u.last_name, u.avatar,
              h.name as hospital_name
       FROM logbook_entries l
       JOIN internships i ON i.id = l.internship_id
       JOIN students s ON s.id = l.student_id
       JOIN users u ON u.id = s.user_id
       JOIN hospitals h ON h.id = i.hospital_id
       WHERE i.tutor_id = ? AND l.status = 'pending'
       ORDER BY l.date DESC`,
      [doctors[0].id]
    );

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

// Review logbook entry (doctor)
const reviewEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, supervisor_comments } = req.body;

    const validStatuses = ['approved', 'revision_requested'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [entry] = await db.query(
      `SELECT l.*, i.tutor_id FROM logbook_entries l
       JOIN internships i ON i.id = l.internship_id
       WHERE l.id = ?`,
      [id]
    );

    if (entry.length === 0) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (entry[0].tutor_id !== doctors[0]?.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await db.query(
      `UPDATE logbook_entries SET status = ?, supervisor_comments = ?,
       reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
      [status, supervisor_comments, req.user.id, id]
    );

    res.json({
      success: true,
      message: `Entry ${status === 'approved' ? 'approved' : 'sent back for revision'}`
    });
  } catch (error) {
    next(error);
  }
};

// Get reviewed entries (doctor)
const getReviewedEntries = async (req, res, next) => {
  try {
    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (doctors.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const [entries] = await db.query(
      `SELECT l.*, u.first_name, u.last_name, u.avatar
       FROM logbook_entries l
       JOIN internships i ON i.id = l.internship_id
       JOIN students s ON s.id = l.student_id
       JOIN users u ON u.id = s.user_id
       WHERE i.tutor_id = ? AND l.status != 'pending'
       ORDER BY l.reviewed_at DESC`,
      [doctors[0].id]
    );

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEntry,
  getMyEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  getPendingEntries,
  reviewEntry,
  getReviewedEntries
};
