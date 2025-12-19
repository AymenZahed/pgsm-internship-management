const db = require('../config/database');
const { generateId } = require('../utils/helpers');

// Record attendance (student check-in/out)
const recordAttendance = async (req, res, next) => {
  try {
    const { internship_id, date, check_in, check_out, notes } = req.body;

    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Verify internship belongs to student
    const [internships] = await db.query(
      'SELECT id FROM internships WHERE id = ? AND student_id = ?',
      [internship_id, students[0].id]
    );

    if (internships.length === 0) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    // Check if attendance already exists for this date
    const [existing] = await db.query(
      'SELECT id FROM attendance WHERE internship_id = ? AND date = ?',
      [internship_id, date]
    );

    if (existing.length > 0) {
      // Update existing record
      await db.query(
        `UPDATE attendance SET check_in = COALESCE(?, check_in), 
         check_out = COALESCE(?, check_out), notes = ? WHERE id = ?`,
        [check_in, check_out, notes, existing[0].id]
      );

      return res.json({
        success: true,
        message: 'Attendance updated successfully'
      });
    }

    // Create new record
    const id = generateId();
    await db.query(
      `INSERT INTO attendance (id, internship_id, student_id, date, check_in, check_out, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, internship_id, students[0].id, date, check_in, check_out, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

// Get student's attendance
const getMyAttendance = async (req, res, next) => {
  try {
    const { internship_id, month, year } = req.query;

    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    let whereClause = 'a.student_id = ?';
    const params = [students[0].id];

    if (internship_id) {
      whereClause += ' AND a.internship_id = ?';
      params.push(internship_id);
    }

    if (month && year) {
      whereClause += ' AND MONTH(a.date) = ? AND YEAR(a.date) = ?';
      params.push(month, year);
    }

    const [attendance] = await db.query(
      `SELECT a.*, h.name as hospital_name
       FROM attendance a
       JOIN internships i ON i.id = a.internship_id
       JOIN hospitals h ON h.id = i.hospital_id
       WHERE ${whereClause}
       ORDER BY a.date DESC`,
      params
    );

    // Calculate stats
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present' || a.status === 'approved').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      pending: attendance.filter(a => a.status === 'pending').length,
      late: attendance.filter(a => a.status === 'late').length
    };

    res.json({
      success: true,
      data: { attendance, stats }
    });
  } catch (error) {
    next(error);
  }
};

// Get pending attendance for validation (doctor)
const getPendingAttendance = async (req, res, next) => {
  try {
    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (doctors.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const [pending] = await db.query(
      `SELECT a.*, u.first_name, u.last_name, u.avatar,
              i.start_date as internship_start, i.end_date as internship_end,
              h.name as hospital_name, sv.name as service_name
       FROM attendance a
       JOIN internships i ON i.id = a.internship_id
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       JOIN hospitals h ON h.id = i.hospital_id
       LEFT JOIN services sv ON sv.id = i.service_id
       WHERE i.tutor_id = ? AND a.status = 'pending'
       ORDER BY a.date DESC`,
      [doctors[0].id]
    );

    res.json({
      success: true,
      data: pending
    });
  } catch (error) {
    next(error);
  }
};

// Validate attendance (doctor)
const validateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['approved', 'rejected', 'present', 'absent', 'late', 'excused'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [attendance] = await db.query(
      `SELECT a.*, i.tutor_id, sv.head_doctor_id FROM attendance a
       JOIN internships i ON i.id = a.internship_id
       LEFT JOIN services sv ON sv.id = i.service_id
       WHERE a.id = ?`,
      [id]
    );

    if (attendance.length === 0) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    // Verify doctor is tutor or service head
    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (attendance[0].tutor_id !== doctors[0]?.id && attendance[0].head_doctor_id !== doctors[0]?.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Calculate hours if check_in and check_out exist
    let hoursWorked = null;
    if (attendance[0].check_in && attendance[0].check_out) {
      const checkIn = new Date(`1970-01-01T${attendance[0].check_in}`);
      const checkOut = new Date(`1970-01-01T${attendance[0].check_out}`);
      hoursWorked = ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2);
    }

    await db.query(
      `UPDATE attendance SET status = ?, notes = CONCAT(COALESCE(notes, ''), '\n', ?),
       hours_worked = ?, validated_by = ?, validated_at = NOW() WHERE id = ?`,
      [status, notes || '', hoursWorked, req.user.id, id]
    );

    // Update internship completed hours
    if (hoursWorked && (status === 'approved' || status === 'present')) {
      await db.query(
        'UPDATE internships SET completed_hours = COALESCE(completed_hours, 0) + ? WHERE id = ?',
        [parseFloat(hoursWorked), attendance[0].internship_id]
      );
    }

    res.json({
      success: true,
      message: 'Attendance validated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get attendance history (doctor)
const getAttendanceHistory = async (req, res, next) => {
  try {
    const { student_id, date_from, date_to } = req.query;

    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (doctors.length === 0) {
      return res.json({ success: true, data: [] });
    }

    let whereClause = 'i.tutor_id = ? AND a.status != "pending"';
    const params = [doctors[0].id];

    if (student_id) {
      whereClause += ' AND a.student_id = ?';
      params.push(student_id);
    }

    if (date_from) {
      whereClause += ' AND a.date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND a.date <= ?';
      params.push(date_to);
    }

    const [history] = await db.query(
      `SELECT a.*, u.first_name, u.last_name, u.avatar
       FROM attendance a
       JOIN internships i ON i.id = a.internship_id
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       WHERE ${whereClause}
       ORDER BY a.date DESC`,
      params
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// Get attendance by specific date (doctor)
const getAttendanceByDate = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (doctors.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const [attendance] = await db.query(
      `SELECT a.*, u.first_name, u.last_name, u.avatar, u.email,
              sv.name as service_name, h.name as hospital_name
       FROM attendance a
       JOIN internships i ON i.id = a.internship_id
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       JOIN hospitals h ON h.id = i.hospital_id
       LEFT JOIN services sv ON sv.id = i.service_id
       WHERE i.tutor_id = ? AND a.date = ?
       ORDER BY a.check_in ASC`,
      [doctors[0].id, date]
    );

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// Get tutor's students' attendance (for validation)
const getTutorAttendance = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;

    // Get doctor ID
    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (doctors.length === 0) {
      return res.json({ success: true, data: [] });
    }

    let whereClause = '(i.tutor_id = ? OR sv.head_doctor_id = ?)';
    const params = [doctors[0].id, doctors[0].id];

    if (status) {
      // Handle comma-separated statuses
      const statuses = status.split(',').map(s => s.trim());
      if (statuses.length > 1) {
        const placeholders = statuses.map(() => '?').join(',');
        whereClause += ` AND a.status IN (${placeholders})`;
        params.push(...statuses);
      } else {
        whereClause += ' AND a.status = ?';
        params.push(status);
      }
    }

    const [attendance] = await db.query(
      `SELECT a.*, u.first_name, u.last_name, u.avatar,
              i.id as internship_id, h.name as hospital_name, sv.name as service_name
       FROM attendance a
       JOIN internships i ON i.id = a.internship_id
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       JOIN hospitals h ON h.id = i.hospital_id
       LEFT JOIN services sv ON sv.id = i.service_id
       WHERE ${whereClause}
       ORDER BY a.date DESC, a.created_at DESC`,
      params
    );

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordAttendance,
  getMyAttendance,
  getPendingAttendance,
  validateAttendance,
  getAttendanceHistory,
  getAttendanceByDate,
  getTutorAttendance
};
