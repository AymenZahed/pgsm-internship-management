const db = require('../config/database');
const { generateId, paginate, paginationResponse } = require('../utils/helpers');

// Get all offers (public listing)
const getAllOffers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, city, department, type, hospital_id } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    let whereClause = "o.status = 'published'";
    const params = [];

    if (search) {
      whereClause += ' AND (o.title LIKE ? OR o.description LIKE ? OR h.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (city) {
      whereClause += ' AND h.city = ?';
      params.push(city);
    }

    if (department) {
      whereClause += ' AND o.department = ?';
      params.push(department);
    }

    if (type) {
      whereClause += ' AND o.type = ?';
      params.push(type);
    }

    if (hospital_id) {
      whereClause += ' AND o.hospital_id = ?';
      params.push(hospital_id);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM stage_offers o JOIN hospitals h ON h.id = o.hospital_id WHERE ${whereClause}`,
      params
    );

    const [offers] = await db.query(
      `SELECT o.*, h.name as hospital_name, h.city as hospital_city, h.logo as hospital_logo,
              sv.name as service_name,
              (o.positions - COALESCE(o.filled_positions, 0)) as available_positions,
              (SELECT COUNT(*) FROM applications WHERE offer_id = o.id) as applicants
       FROM stage_offers o
       JOIN hospitals h ON h.id = o.hospital_id
       LEFT JOIN services sv ON sv.id = o.service_id
       WHERE ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageLimit, offset]
    );

    res.json({
      success: true,
      ...paginationResponse(offers, countResult[0].total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// Publish offer (set status to 'published')
const publishOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    const [offer] = await db.query('SELECT hospital_id FROM stage_offers WHERE id = ?', [id]);

    if (offer.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (req.user.role === 'hospital' && offer[0].hospital_id !== hospitals[0]?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await db.query('UPDATE stage_offers SET status = "published" WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Offer published successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Close offer (set status to 'closed')
const closeOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    const [offer] = await db.query('SELECT hospital_id FROM stage_offers WHERE id = ?', [id]);

    if (offer.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (req.user.role === 'hospital' && offer[0].hospital_id !== hospitals[0]?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await db.query('UPDATE stage_offers SET status = "closed" WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Offer closed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Cancel offer (set status to 'cancelled')
const cancelOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    const [offer] = await db.query('SELECT hospital_id FROM stage_offers WHERE id = ?', [id]);

    if (offer.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (req.user.role === 'hospital' && offer[0].hospital_id !== hospitals[0]?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await db.query('UPDATE stage_offers SET status = "cancelled" WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Offer cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get offer by ID
const getOfferById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [offers] = await db.query(
      `SELECT o.*, h.name as hospital_name, h.city as hospital_city, h.address as hospital_address,
              h.description as hospital_description, h.logo as hospital_logo,
              sv.name as service_name,
              (SELECT COUNT(*) FROM applications WHERE offer_id = o.id) as applicants
       FROM stage_offers o
       JOIN hospitals h ON h.id = o.hospital_id
       LEFT JOIN services sv ON sv.id = o.service_id
       WHERE o.id = ?`,
      [id]
    );

    if (offers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Check if user has already applied (if authenticated student)
    let hasApplied = false;
    if (req.user && req.user.role === 'student') {
      const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (students.length > 0) {
        const [applications] = await db.query(
          'SELECT id FROM applications WHERE student_id = ? AND offer_id = ?',
          [students[0].id, id]
        );
        hasApplied = applications.length > 0;
      }
    }

    res.json({
      success: true,
      data: {
        ...offers[0],
        hasApplied
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital's offers
const getHospitalOffers = async (req, res, next) => {
  try {
    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }
    const hospitalId = hospitals[0].id;

    const { status, search } = req.query;

    let whereClause = 'o.hospital_id = ?';
    const params = [hospitalId];

    if (status) {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (o.title LIKE ? OR o.department LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [offers] = await db.query(
      `SELECT o.*, sv.name as service_name,
              (SELECT COUNT(*) FROM applications WHERE offer_id = o.id) as applicants,
              (SELECT COUNT(*) FROM applications WHERE offer_id = o.id AND status = 'pending') as pending_count
       FROM stage_offers o
       LEFT JOIN services sv ON sv.id = o.service_id
       WHERE ${whereClause}
       ORDER BY o.created_at DESC`,
      params
    );

    res.json({
      success: true,
      data: offers
    });
  } catch (error) {
    next(error);
  }
};

// Create offer
const createOffer = async (req, res, next) => {
  try {
    const { title, description, requirements, responsibilities, department, type,
      duration_weeks, positions, start_date, end_date, application_deadline,
      service_id, tutor_id, skills_required, benefits, status } = req.body;

    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }
    const hospitalId = hospitals[0].id;

    const id = generateId();
    await db.query(
      `INSERT INTO stage_offers (id, hospital_id, service_id, title, description, requirements, 
       responsibilities, department, type, duration_weeks, positions, start_date, end_date, 
       application_deadline, skills_required, benefits, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, hospitalId, service_id, title, description, requirements, responsibilities,
        department, type || 'required', duration_weeks, positions || 1, start_date, end_date,
        application_deadline, JSON.stringify(skills_required || []), benefits, status || 'draft']
    );

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

// Update offer
const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    const [offer] = await db.query('SELECT hospital_id FROM stage_offers WHERE id = ?', [id]);

    if (offer.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (req.user.role === 'hospital' && offer[0].hospital_id !== hospitals[0]?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const fields = [];
    const values = [];

    ['title', 'description', 'requirements', 'responsibilities', 'department', 'type',
      'duration_weeks', 'positions', 'start_date', 'end_date', 'application_deadline',
      'service_id', 'tutor_id', 'benefits', 'status'].forEach(field => {
        if (updates[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(updates[field]);
        }
      });

    if (updates.skills_required !== undefined) {
      fields.push('skills_required = ?');
      values.push(JSON.stringify(updates.skills_required));
    }

    if (fields.length > 0) {
      values.push(id);
      await db.query(`UPDATE stage_offers SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    res.json({
      success: true,
      message: 'Offer updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete offer
const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    const [offer] = await db.query('SELECT hospital_id FROM stage_offers WHERE id = ?', [id]);

    if (offer.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (req.user.role === 'hospital' && offer[0].hospital_id !== hospitals[0]?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check for applications
    const [applications] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE offer_id = ? AND status NOT IN ("rejected", "withdrawn")',
      [id]
    );

    if (applications[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete offer with active applications'
      });
    }

    await db.query('DELETE FROM stage_offers WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Copy offer
const copyOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [offers] = await db.query('SELECT * FROM stage_offers WHERE id = ?', [id]);
    if (offers.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const original = offers[0];
    const newId = generateId();

    await db.query(
      `INSERT INTO stage_offers (id, hospital_id, service_id, tutor_id, title, description, requirements, 
       responsibilities, department, type, duration_weeks, positions, start_date, end_date, 
       application_deadline, skills_required, benefits, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [newId, original.hospital_id, original.service_id, original.tutor_id, `${original.title} (Copy)`,
        original.description, original.requirements, original.responsibilities,
        original.department, original.type, original.duration_weeks, original.positions,
        original.start_date, original.end_date, original.application_deadline,
        original.skills_required, original.benefits]
    );

    res.status(201).json({
      success: true,
      message: 'Offer copied successfully',
      data: { id: newId }
    });
  } catch (error) {
    next(error);
  }
};

// Get filter options (cities and departments)
const getFilterOptions = async (req, res, next) => {
  try {
    const [cities] = await db.query(
      `SELECT DISTINCT h.city FROM stage_offers o 
       JOIN hospitals h ON h.id = o.hospital_id 
       WHERE o.status = 'published' AND h.city IS NOT NULL`
    );

    const [departments] = await db.query(
      `SELECT DISTINCT department FROM stage_offers 
       WHERE status = 'published' AND department IS NOT NULL`
    );

    res.json({
      success: true,
      data: {
        cities: cities.map(c => c.city),
        departments: departments.map(d => d.department)
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
      `SELECT DISTINCT department FROM stage_offers WHERE department IS NOT NULL`
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
  getAllOffers,
  getOfferById,
  getHospitalOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  copyOffer,
  publishOffer,
  closeOffer,
  cancelOffer,
  getFilterOptions,
  getDepartments
};
