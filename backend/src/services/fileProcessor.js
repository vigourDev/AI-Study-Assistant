const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractTextFromDOCX(filePath) {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function extractTextFromTXT(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

async function extractTextFromImage(filePath) {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
  return text;
}

async function extractText(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();

  if (mimeType === 'application/pdf' || ext === '.pdf') {
    return extractTextFromPDF(filePath);
  }
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === '.docx'
  ) {
    return extractTextFromDOCX(filePath);
  }
  if (mimeType === 'text/plain' || ext === '.txt') {
    return extractTextFromTXT(filePath);
  }
  if (mimeType?.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
    return extractTextFromImage(filePath);
  }

  throw new Error(`Unsupported file type: ${mimeType || ext}`);
}

module.exports = { extractText };
