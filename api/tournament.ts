import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Fetch tournament data
    if (req.method === 'GET') {
      console.log('📥 GET /api/tournament - Fetching data');
      
      try {
        const data = await kv.get('tournament-data');
        console.log('Data from KV:', data ? `Found (${typeof data})` : 'Not found');
        console.log('Raw data:', data);
        
        if (data) {
          // Handle both string and object cases
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          console.log('Parsed data keys:', Object.keys(parsed));
          return res.status(200).json(parsed);
        }
      } catch (kvError) {
        console.error('❌ KV.get() error:', kvError);
        console.error('Error message:', kvError instanceof Error ? kvError.message : String(kvError));
        console.error('Error stack:', kvError instanceof Error ? kvError.stack : 'N/A');
      }
      
      // Return null if no data or error (client will use initial data)
      return res.status(200).json({ players: null, matches: null });
    }

    // POST/PUT - Save tournament data
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log('💾 POST /api/tournament - Saving data');
      const { players, matches } = req.body;
      
      console.log('Received:', { playersCount: players?.length, matchesCount: matches?.length });
      
      if (!players || !matches) {
        console.error('Missing players or matches in request body');
        return res.status(400).json({ error: 'Missing players or matches' });
      }

      await kv.set('tournament-data', JSON.stringify({ players, matches }));
      console.log('✅ Data saved to KV successfully');
      
      return res.status(200).json({ success: true });
    }

    // DELETE - Reset tournament
    if (req.method === 'DELETE') {
      console.log('🗑️ DELETE /api/tournament - Clearing data');
      await kv.del('tournament-data');
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('KV Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
