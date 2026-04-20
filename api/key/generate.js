export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    const { partner_id } = req.body;

    if (!partner_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing partner_id',
        example: { partner_id: 'partner_1234567890_abc' }
      });
    }

    const apiKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    res.status(201).json({
      success: true,
      message: 'API key generated',
      api_key: apiKey,
      partner_id: partner_id,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}
