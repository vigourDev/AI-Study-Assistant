const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const MAX_CONTENT_LENGTH = 12000;

function truncateContent(content) {
  if (content.length > MAX_CONTENT_LENGTH) {
    return content.substring(0, MAX_CONTENT_LENGTH) + '\n...[content truncated]';
  }
  return content;
}

async function generateSummary(content) {
  const truncated = truncateContent(content);
  const prompt = `You are an expert academic tutor. Summarize the following study material in a clear, concise, and well-structured format. Use bullet points and headings where appropriate. Focus on key concepts, definitions, and important details that would help a student study effectively.\n\nStudy material:\n${truncated}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateFlashcards(content, count = 10) {
  const truncated = truncateContent(content);
  const prompt = `You are an expert academic tutor. Generate exactly ${count} flashcards from the study material below. Return ONLY valid JSON with no other text. The JSON must be: { "flashcards": [{ "front": "question", "back": "answer", "difficulty": "easy|medium|hard" }] }\n\nStudy material:\n${truncated}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON from the response (handle markdown code blocks)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  const parsed = JSON.parse(jsonMatch[1].trim());
  return parsed.flashcards || parsed.cards || parsed;
}

async function generateQuiz(content, count = 5) {
  const truncated = truncateContent(content);
  const prompt = `You are an expert academic tutor. Generate exactly ${count} multiple choice questions from the study material. Each question should have 4 options (A, B, C, D) with one correct answer. Return ONLY valid JSON with no other text. The JSON must be: { "questions": [{ "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct_answer": "A", "explanation": "..." }] }\n\nStudy material:\n${truncated}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  const parsed = JSON.parse(jsonMatch[1].trim());
  return parsed.questions || parsed;
}

async function generateExamPredictions(content, count = 5) {
  const truncated = truncateContent(content);
  const prompt = `You are an expert academic tutor and exam predictor. Based on the study material, predict ${count} likely exam questions. Include a mix of short answer and essay questions. Return ONLY valid JSON with no other text. The JSON must be: { "predictions": [{ "question": "...", "type": "short_answer|essay", "key_points": ["..."], "difficulty": "easy|medium|hard" }] }\n\nStudy material:\n${truncated}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  const parsed = JSON.parse(jsonMatch[1].trim());
  return parsed.predictions || parsed;
}

module.exports = {
  generateSummary,
  generateFlashcards,
  generateQuiz,
  generateExamPredictions,
};
