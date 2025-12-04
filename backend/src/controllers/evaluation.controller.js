const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { calculateOverallScore } = require('../utils/helpers');

// Create evaluation
const createEvaluation = async (req, res, next) => {
  try {
    const { internship_id, type, technical_skills_score, patient_relations_score,
            teamwork_score, professionalism_score, strengths, weaknesses, 
            recommendations, feedback } = req.body;

    // Get internship details
    const [internships] = await db.query(
      'SELECT student_id FROM internships WHERE id = ?',
      [internship_id]
    );

    if (internships.length === 0) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    const scores = { 
      technical_skills_score, 
      patient_relations_score, 
      teamwork_score, 
      professionalism_score 
    };
    const overallScore = calculateOverallScore(scores);

    const id = uuidv4();
    await db.query(
      `INSERT INTO evaluations (id, internship_id, student_id, evaluator_id, type,
       overall_score, technical_skills_score, patient_relations_score, teamwork_score,
       professionalism_score, strengths, weaknesses, recommendations, feedback, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')`,
      [id, internship_id, internships[0].student_id, req.user.id, type,
       overallScore, technical_skills_score, patient_relations_score, teamwork_score,
       professionalism_score, strengths, weaknesses, recommendations, feedback]
    );

    res.status(201).json({
      success: true,
      message: 'Evaluation created successfully',
      data: { id, overall_score: overallScore }
    });
  } catch (error) {
    next(error);
  }
};

// Get evaluations for doctor
const getDoctorEvaluations = async (req, res, next) => {
  try {
    const { status } = req.query;

    let whereClause = 'e.evaluator_id = ?';
    const params = [req.user.id];

    if (status) {
      whereClause += ' AND e.status = ?';
      params.push(status);
    }

    const [evaluations] = await db.query(
      `SELECT e.*, u.first_name, u.last_name, u.avatar,
              i.start_date, i.end_date, h.name as hospital_name
       FROM evaluations e
       JOIN students s ON s.id = e.student_id
       JOIN users u ON u.id = s.user_id
       JOIN internships i ON i.id = e.internship_id
       JOIN hospitals h ON h.id = i.hospital_id
       WHERE ${whereClause}
       ORDER BY e.created_at DESC`,
      params
    );

    res.json({
      success: true,
      data: evaluations
    });
  } catch (error) {
    next(error);
  }
};

// Get student's evaluations
const getStudentEvaluations = async (req, res, next) => {
  try {
    const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    const studentId = students[0].id;

    const [evaluations] = await db.query(
      `SELECT e.*, u.first_name as evaluator_first_name, u.last_name as evaluator_last_name,
              i.start_date, i.end_date, h.name as hospital_name
       FROM evaluations e
       JOIN users u ON u.id = e.evaluator_id
       JOIN internships i ON i.id = e.internship_id
       JOIN hospitals h ON h.id = i.hospital_id
       WHERE e.student_id = ?
       ORDER BY e.created_at DESC`,
      [studentId]
    );

    // Calculate stats
    const stats = {
      total: evaluations.length,
      average_score: evaluations.length > 0 
        ? (evaluations.reduce((sum, e) => sum + parseFloat(e.overall_score || 0), 0) / evaluations.length).toFixed(2)
        : 0,
      highest_score: evaluations.length > 0
        ? Math.max(...evaluations.map(e => parseFloat(e.overall_score || 0)))
        : 0
    };

    res.json({
      success: true,
      data: { evaluations, stats }
    });
  } catch (error) {
    next(error);
  }
};

// Get evaluation by ID
const getEvaluationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [evaluations] = await db.query(
      `SELECT e.*, 
              u.first_name as evaluator_first_name, u.last_name as evaluator_last_name,
              su.first_name as student_first_name, su.last_name as student_last_name,
              i.start_date, i.end_date, h.name as hospital_name
       FROM evaluations e
       JOIN users u ON u.id = e.evaluator_id
       JOIN students s ON s.id = e.student_id
       JOIN users su ON su.id = s.user_id
       JOIN internships i ON i.id = e.internship_id
       JOIN hospitals h ON h.id = i.hospital_id
       WHERE e.id = ?`,
      [id]
    );

    if (evaluations.length === 0) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }

    res.json({
      success: true,
      data: evaluations[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update evaluation
const updateEvaluation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [evaluation] = await db.query('SELECT evaluator_id FROM evaluations WHERE id = ?', [id]);
    if (evaluation.length === 0) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }

    if (evaluation[0].evaluator_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const scores = { 
      technical_skills_score: updates.technical_skills_score, 
      patient_relations_score: updates.patient_relations_score, 
      teamwork_score: updates.teamwork_score, 
      professionalism_score: updates.professionalism_score 
    };
    const overallScore = calculateOverallScore(scores);

    await db.query(
      `UPDATE evaluations SET technical_skills_score = ?, patient_relations_score = ?,
       teamwork_score = ?, professionalism_score = ?, overall_score = ?,
       strengths = ?, weaknesses = ?, recommendations = ?, feedback = ?
       WHERE id = ?`,
      [updates.technical_skills_score, updates.patient_relations_score,
       updates.teamwork_score, updates.professionalism_score, overallScore,
       updates.strengths, updates.weaknesses, updates.recommendations, updates.feedback, id]
    );

    res.json({
      success: true,
      message: 'Evaluation updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get pending evaluations for doctor
const getPendingEvaluations = async (req, res, next) => {
  try {
    // Get students assigned to this doctor who need evaluation
    const [doctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (doctors.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const [pending] = await db.query(
      `SELECT i.*, u.first_name, u.last_name, u.avatar,
              h.name as hospital_name, sv.name as service_name,
              (SELECT COUNT(*) FROM evaluations WHERE internship_id = i.id) as evaluation_count
       FROM internships i
       JOIN students s ON s.id = i.student_id
       JOIN users u ON u.id = s.user_id
       JOIN hospitals h ON h.id = i.hospital_id
       LEFT JOIN services sv ON sv.id = i.service_id
       WHERE i.tutor_id = ? AND i.status = 'active'
       HAVING evaluation_count = 0 OR 
              (evaluation_count = 1 AND DATEDIFF(i.end_date, CURDATE()) <= 7)`,
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

module.exports = {
  createEvaluation,
  getDoctorEvaluations,
  getStudentEvaluations,
  getEvaluationById,
  updateEvaluation,
  getPendingEvaluations
};
