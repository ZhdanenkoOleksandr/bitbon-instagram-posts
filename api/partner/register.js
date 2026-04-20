// In-memory database (persists during function lifecycle)
let partners = {};

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST'
    });
  }

  try {
    const { telegram, phone, email, link } = req.body;

    if (!telegram || !phone || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['telegram', 'phone', 'email']
      });
    }

    const partnerId = 'partner_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const partner = {
      id: partnerId,
      telegram,
      phone,
      email,
      link: link || null,
      status: 'active',
      created_at: new Date().toISOString()
    };

    partners[partnerId] = partner;

    res.status(201).json({
      success: true,
      message: 'Partner registered successfully',
      partner_id: partnerId,
      partner: partner
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
}
