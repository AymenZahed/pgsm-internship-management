const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Upload document
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { type, application_id } = req.body;

    const id = uuidv4();
    await db.query(
      `INSERT INTO documents (id, user_id, application_id, type, name, file_path, file_size, mime_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, application_id || null, type, req.file.originalname, 
       req.file.path, req.file.size, req.file.mimetype]
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { 
        id, 
        name: req.file.originalname,
        path: req.file.path 
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's documents
const getMyDocuments = async (req, res, next) => {
  try {
    const { type } = req.query;

    let whereClause = 'user_id = ?';
    const params = [req.user.id];

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    const [documents] = await db.query(
      `SELECT * FROM documents WHERE ${whereClause} ORDER BY created_at DESC`,
      params
    );

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

// Get document by ID
const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [documents] = await db.query(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Check access (owner, admin, or related hospital)
    if (documents[0].user_id !== req.user.id && req.user.role !== 'admin') {
      // Check if hospital staff for related application
      if (req.user.role === 'hospital' && documents[0].application_id) {
        const [access] = await db.query(
          `SELECT 1 FROM applications a
           JOIN stage_offers o ON o.id = a.offer_id
           JOIN hospitals h ON h.id = o.hospital_id
           WHERE a.id = ? AND h.user_id = ?`,
          [documents[0].application_id, req.user.id]
        );
        if (access.length === 0) {
          return res.status(403).json({ success: false, message: 'Access denied' });
        }
      } else {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.json({
      success: true,
      data: documents[0]
    });
  } catch (error) {
    next(error);
  }
};

// Download document
const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [documents] = await db.query(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const doc = documents[0];
    const filePath = path.resolve(doc.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.download(filePath, doc.name);
  } catch (error) {
    next(error);
  }
};

// Delete document
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [documents] = await db.query(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (documents[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Delete file from filesystem
    const filePath = path.resolve(documents[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM documents WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Verify document (admin/hospital)
const verifyDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['verified', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await db.query(
      `UPDATE documents SET status = ?, verified_by = ?, verified_at = NOW() WHERE id = ?`,
      [status, req.user.id, id]
    );

    res.json({
      success: true,
      message: `Document ${status}`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument,
  verifyDocument
};
