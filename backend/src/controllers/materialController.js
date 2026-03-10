const StudyMaterial = require('../models/StudyMaterial');
const { extractText } = require('../services/fileProcessor');
const { generateSummary } = require('../services/aiService');
const fs = require('fs');

async function uploadMaterial(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title } = req.body;
    const file = req.file;

    // Extract text from file
    let parsedContent = '';
    try {
      parsedContent = await extractText(file.path, file.mimetype);
    } catch (err) {
      console.error('Text extraction error:', err.message);
      return res.status(422).json({ error: 'Could not extract text from file' });
    }

    if (!parsedContent || parsedContent.trim().length === 0) {
      return res.status(422).json({ error: 'No readable text found in the file' });
    }

    const material = StudyMaterial.create({
      userId: req.user.id,
      title: title || file.originalname,
      originalFilename: file.originalname,
      fileType: file.mimetype,
      filePath: file.path,
      parsedContent,
      fileSize: file.size,
    });

    res.status(201).json({ material });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload material' });
  }
}

function getMaterials(req, res) {
  const materials = StudyMaterial.findByUserId(req.user.id);
  res.json({ materials });
}

function getMaterial(req, res) {
  const material = StudyMaterial.findById(req.params.id);
  if (!material || material.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Material not found' });
  }
  res.json({ material });
}

async function summarizeMaterial(req, res) {
  try {
    const material = StudyMaterial.findById(req.params.id);
    if (!material || material.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (!material.parsed_content) {
      return res.status(422).json({ error: 'No content to summarize' });
    }

    if (material.summary) {
      return res.json({ summary: material.summary });
    }

    const summary = await generateSummary(material.parsed_content);
    StudyMaterial.updateSummary(material.id, summary);

    res.json({ summary });
  } catch (err) {
    console.error('Summarize error:', err?.message || err);
    const msg = err?.message || '';
    const message = msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')
      ? 'Invalid Gemini API key. Check your .env file.'
      : msg.includes('RATE_LIMIT') || msg.includes('429')
      ? 'Rate limit reached. Please wait and try again.'
      : msg.includes('quota')
      ? 'API quota exceeded. Check your Google AI billing.'
      : 'Failed to generate summary';
    res.status(500).json({ error: message });
  }
}

function searchMaterials(req, res) {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  const materials = StudyMaterial.search(req.user.id, q.trim());
  res.json({ materials });
}

function deleteMaterial(req, res) {
  const material = StudyMaterial.findById(req.params.id);
  if (!material || material.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Material not found' });
  }

  // Delete the file from disk
  try {
    if (fs.existsSync(material.file_path)) {
      fs.unlinkSync(material.file_path);
    }
  } catch {
    // File might already be deleted
  }

  StudyMaterial.delete(material.id);
  res.json({ message: 'Material deleted' });
}

module.exports = {
  uploadMaterial,
  getMaterials,
  getMaterial,
  summarizeMaterial,
  searchMaterials,
  deleteMaterial,
};
