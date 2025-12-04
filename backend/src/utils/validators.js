const { body, param, query } = require('express-validator');

// Auth validators
const registerValidator = [
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email must be less than 255 characters'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 100 }).withMessage('First name must be less than 100 characters'),
  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 100 }).withMessage('Last name must be less than 100 characters'),
  body('role')
    .isIn(['student', 'doctor', 'hospital']).withMessage('Invalid role')
];

const loginValidator = [
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Application validators
const applicationValidator = [
  body('offer_id')
    .notEmpty().withMessage('Offer ID is required')
    .isUUID().withMessage('Invalid offer ID'),
  body('cover_letter')
    .optional()
    .isLength({ max: 5000 }).withMessage('Cover letter must be less than 5000 characters'),
  body('motivation')
    .optional()
    .isLength({ max: 2000 }).withMessage('Motivation must be less than 2000 characters')
];

// Offer validators
const offerValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 5000 }).withMessage('Description must be less than 5000 characters'),
  body('duration_weeks')
    .isInt({ min: 1, max: 52 }).withMessage('Duration must be between 1 and 52 weeks'),
  body('positions')
    .optional()
    .isInt({ min: 1 }).withMessage('Positions must be at least 1'),
  body('start_date')
    .isISO8601().withMessage('Invalid start date'),
  body('end_date')
    .isISO8601().withMessage('Invalid end date')
];

// Service validators
const serviceValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Service name is required')
    .isLength({ max: 255 }).withMessage('Name must be less than 255 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 0 }).withMessage('Capacity must be a positive number')
];

// Evaluation validators
const evaluationValidator = [
  body('internship_id')
    .notEmpty().withMessage('Internship ID is required')
    .isUUID().withMessage('Invalid internship ID'),
  body('type')
    .isIn(['mid-term', 'final', 'monthly']).withMessage('Invalid evaluation type'),
  body('technical_skills_score')
    .isFloat({ min: 0, max: 100 }).withMessage('Technical skills score must be between 0 and 100'),
  body('patient_relations_score')
    .isFloat({ min: 0, max: 100 }).withMessage('Patient relations score must be between 0 and 100'),
  body('teamwork_score')
    .isFloat({ min: 0, max: 100 }).withMessage('Teamwork score must be between 0 and 100'),
  body('professionalism_score')
    .isFloat({ min: 0, max: 100 }).withMessage('Professionalism score must be between 0 and 100')
];

// Logbook validators
const logbookValidator = [
  body('date')
    .isISO8601().withMessage('Invalid date'),
  body('activities')
    .trim()
    .notEmpty().withMessage('Activities are required')
    .isLength({ max: 5000 }).withMessage('Activities must be less than 5000 characters'),
  body('skills_learned')
    .optional()
    .isLength({ max: 2000 }).withMessage('Skills learned must be less than 2000 characters')
];

// Attendance validators
const attendanceValidator = [
  body('date')
    .isISO8601().withMessage('Invalid date'),
  body('check_in')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid check-in time format (HH:MM)'),
  body('check_out')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid check-out time format (HH:MM)')
];

// Message validators
const messageValidator = [
  body('conversation_id')
    .notEmpty().withMessage('Conversation ID is required')
    .isUUID().withMessage('Invalid conversation ID'),
  body('content')
    .trim()
    .notEmpty().withMessage('Message content is required')
    .isLength({ max: 5000 }).withMessage('Message must be less than 5000 characters')
];

// ID param validator
const idParamValidator = [
  param('id')
    .isUUID().withMessage('Invalid ID format')
];

// Pagination validators
const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

module.exports = {
  registerValidator,
  loginValidator,
  applicationValidator,
  offerValidator,
  serviceValidator,
  evaluationValidator,
  logbookValidator,
  attendanceValidator,
  messageValidator,
  idParamValidator,
  paginationValidator
};
