const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Generate unique ID for entities
const generateId = () => uuidv4();

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Format date for MySQL
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Format datetime for MySQL
const formatDateTime = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

// Calculate weighted score for evaluations
const calculateOverallScore = (scores) => {
  const weights = {
    technical_skills: 0.40,
    patient_relations: 0.25,
    teamwork: 0.20,
    professionalism: 0.15
  };

  let totalWeight = 0;
  let weightedSum = 0;

  Object.keys(weights).forEach(key => {
    const scoreKey = `${key}_score`;
    if (scores[scoreKey] !== undefined && scores[scoreKey] !== null) {
      weightedSum += scores[scoreKey] * weights[key];
      totalWeight += weights[key];
    }
  });

  return totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : null;
};

// Paginate results
const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset };
};

// Build pagination response
const paginationResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  formatDate,
  formatDateTime,
  calculateOverallScore,
  paginate,
  paginationResponse,
  generateId
};
