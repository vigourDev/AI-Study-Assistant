function errorHandler(err, _req, res, _next) {
  console.error('Error:', err.message);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds the limit (10MB)' });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err.message && err.message.includes('File type')) {
    return res.status(400).json({ error: err.message });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : err.message,
  });
}

module.exports = errorHandler;
