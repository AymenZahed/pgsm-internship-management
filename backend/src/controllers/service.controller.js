const db = require('../config/database');
const { generateId } = require('../utils/helpers');

// Get all services for a hospital
const getServices = async (req, res, next) => {
  try {
    let hospitalId = req.query.hospital_id;
    const { search } = req.query;

    // If no hospital_id provided, get the logged-in hospital's ID
    if (!hospitalId && req.user.role === 'hospital') {
      const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
      if (hospitals.length > 0) hospitalId = hospitals[0].id;
    }

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required'
      });
    }

    let whereClause = 's.hospital_id = ?';
    const params = [hospitalId];

    if (search) {
      whereClause += ' AND (s.name LIKE ? OR s.department LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [services] = await db.query(
      `SELECT s.*, 
              CONCAT(u.first_name, ' ', u.last_name) as head_doctor_name,
              (SELECT COUNT(*) FROM internships i WHERE i.service_id = s.id AND i.status = 'active') as current_interns
       FROM services s
       LEFT JOIN doctors d ON d.id = s.head_doctor_id
       LEFT JOIN users u ON u.id = d.user_id
       WHERE ${whereClause}
       ORDER BY s.name ASC`,
      params
    );

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// Get service by ID
const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [services] = await db.query(
      `SELECT s.*, h.name as hospital_name,
              CONCAT(u.first_name, ' ', u.last_name) as head_doctor_name
       FROM services s
       JOIN hospitals h ON h.id = s.hospital_id
       LEFT JOIN doctors d ON d.id = s.head_doctor_id
       LEFT JOIN users u ON u.id = d.user_id
       WHERE s.id = ?`,
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Get current interns
    const [interns] = await db.query(
      `SELECT i.*, u.first_name, u.last_name, u.avatar
       FROM internships i
       JOIN students st ON st.id = i.student_id
       JOIN users u ON u.id = st.user_id
       WHERE i.service_id = ? AND i.status = 'active'`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...services[0],
        interns
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create service
const createService = async (req, res, next) => {
  try {
    const { name, department, description, capacity, floor, phone, email, head_doctor_id, accepts_interns } = req.body;

    // Get hospital ID
    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    }
    const hospitalId = hospitals[0].id;

    const id = generateId();
    await db.query(
      `INSERT INTO services (id, hospital_id, name, department, description, capacity, floor, phone, email, head_doctor_id, accepts_interns)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, hospitalId, name, department, description, capacity || 0, floor, phone, email, head_doctor_id, accepts_interns !== false]
    );

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

// Update service
const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, department, description, capacity, floor, phone, email, head_doctor_id, is_active, accepts_interns } = req.body;

    // Verify ownership
    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    const [service] = await db.query('SELECT hospital_id FROM services WHERE id = ?', [id]);
    
    if (service.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (req.user.role === 'hospital' && service[0].hospital_id !== hospitals[0]?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await db.query(
      `UPDATE services SET name = COALESCE(?, name), department = COALESCE(?, department), 
       description = COALESCE(?, description), capacity = COALESCE(?, capacity), 
       floor = COALESCE(?, floor), phone = COALESCE(?, phone), email = COALESCE(?, email), 
       head_doctor_id = COALESCE(?, head_doctor_id), is_active = COALESCE(?, is_active), 
       accepts_interns = COALESCE(?, accepts_interns)
       WHERE id = ?`,
      [name, department, description, capacity, floor, phone, email, head_doctor_id, is_active, accepts_interns, id]
    );

    res.json({
      success: true,
      message: 'Service updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete service
const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
    const [service] = await db.query('SELECT hospital_id FROM services WHERE id = ?', [id]);
    
    if (service.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (req.user.role === 'hospital' && service[0].hospital_id !== hospitals[0]?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check for active internships
    const [activeInternships] = await db.query(
      'SELECT COUNT(*) as count FROM internships WHERE service_id = ? AND status = "active"',
      [id]
    );

    if (activeInternships[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete service with active internships'
      });
    }

    await db.query('DELETE FROM services WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get departments
const getDepartments = async (req, res, next) => {
  try {
    let hospitalId = req.query.hospital_id;

    if (!hospitalId && req.user.role === 'hospital') {
      const [hospitals] = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
      if (hospitals.length > 0) hospitalId = hospitals[0].id;
    }

    let query = 'SELECT DISTINCT department FROM services WHERE department IS NOT NULL';
    const params = [];

    if (hospitalId) {
      query += ' AND hospital_id = ?';
      params.push(hospitalId);
    }

    const [departments] = await db.query(query, params);

    res.json({
      success: true,
      data: departments.map(d => d.department)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getDepartments
};
