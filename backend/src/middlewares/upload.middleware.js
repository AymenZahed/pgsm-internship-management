const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/documents', 'uploads/avatars', 'uploads/attachments'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '../../', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    if (file.fieldname === 'avatar') {
      folder = 'uploads/avatars/';
    } else if (file.fieldname === 'document' || file.fieldname === 'cv' || file.fieldname === 'cover_letter') {
      folder = 'uploads/documents/';
    } else if (file.fieldname === 'attachment') {
      folder = 'uploads/attachments/';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    document: ['application/pdf'],
    cv: ['application/pdf'],
    cover_letter: ['application/pdf'],
    avatar: ['image/jpeg', 'image/png', 'image/webp'],
    attachment: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 
                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  const allowed = allowedTypes[file.fieldname] || allowedTypes.attachment;
  
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowed.join(', ')}`), false);
  }
};

// Max file size: 5MB
const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize }
});

// Single file upload
const uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple files upload
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Mixed upload
const uploadFields = (fields) => upload.fields(fields);

// Error handler for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleUploadError
};
