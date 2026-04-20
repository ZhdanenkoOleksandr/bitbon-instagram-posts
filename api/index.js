module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/api/health' || req.url === '/health') {
    return res.status(200).json({
      success: true,
      status: 'healthy',
      message: 'API is working'
    });
  }

  res.status(404).json({
    success: false,
    error: 'Not found',
    path: req.url,
    method: req.method
  });
};
