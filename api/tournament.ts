import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // GET - Fetch tournament data
    if (req.method === 'GET') {
      const data = await kv.get('tournament-data');
      
      if (data) {
        return res.status(200).json(JSON.parse(data as string));
      }
      
      // Return null if no data (client will use initial data)
      return res.status(200).json({ players: null, matches: null });
    }

    // POST/PUT - Save tournament data
    if (req.method === 'POST' || req.method === 'PUT') {
      const { players, matches } = req.body;
      
      if (!players || !matches) {
        return res.status(400).json({ error: 'Missing players or matches' });
      }

      await kv.set('tournament-data', JSON.stringify({ players, matches }));
      
      return res.status(200).json({ success: true });
    }

    // DELETE - Reset tournament
    if (req.method === 'DELETE') {
      await kv.del('tournament-data');
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('KV Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
