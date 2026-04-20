export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET'
    });
  }

  // Return demo data
  res.status(200).json({
    success: true,
    partners: [
      {
        id: 'partner_demo_1',
        telegram: '@demo_partner',
        email: 'demo@example.com',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ],
    total: 1,
    message: 'Partners list (demo data - use POST /api/partner/register to create real partners)'
  });
}
