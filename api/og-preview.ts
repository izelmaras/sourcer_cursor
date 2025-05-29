import type { VercelRequest, VercelResponse } from '@vercel/node';
import ogs from 'open-graph-scraper';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid url' });
  }

  try {
    const { result } = await ogs({ url });
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(422).json({ error: 'Failed to fetch Open Graph data', details: result.error });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : error });
  }
} 