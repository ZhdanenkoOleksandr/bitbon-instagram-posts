module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const slug = req.query.slug || [];
  const path = `/${slug.join('/')}`;

  // Health check
  if (path === '/health' || path === '') {
    return res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  }

  // Partner register
  if (path === '/partner/register' && req.method === 'POST') {
    const { telegram, phone, email } = req.body || {};

    if (!telegram || !phone || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    return res.status(201).json({
      success: true,
      partner_id: 'partner_' + Date.now(),
      message: 'Partner registered'
    });
  }

  // Partner list
  if (path === '/partner/list' && req.method === 'GET') {
    return res.status(200).json({
      success: true,
      partners: [],
      total: 0
    });
  }

  // Key generate
  if (path === '/key/generate' && req.method === 'POST') {
    const { partner_id } = req.body || {};

    if (!partner_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing partner_id'
      });
    }

    return res.status(201).json({
      success: true,
      api_key: 'sk_' + Math.random().toString(36).substr(2, 15),
      partner_id: partner_id
    });
  }

  // Default 404
  res.status(404).json({
    success: false,
    error: 'Not found',
    path: path,
    method: req.method
  });
};
