import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabase) {
    return response.status(500).json({ error: 'Supabase not configured' });
  }

  try {
    const { parentAtomId, childAtomId } = request.body;

    if (!parentAtomId || !childAtomId) {
      return response.status(400).json({ error: 'parentAtomId and childAtomId are required' });
    }

    if (parentAtomId === childAtomId) {
      return response.status(400).json({ error: 'Cannot add atom to itself' });
    }

    // Check if relationship already exists
    const { data: existing } = await supabase
      .from('atom_relationships')
      .select('*')
      .eq('parent_atom_id', parentAtomId)
      .eq('child_atom_id', childAtomId)
      .single();

    if (existing) {
      return response.status(200).json({ success: true, message: 'Relationship already exists' });
    }

    // Create relationship
    const { error } = await supabase
      .from('atom_relationships')
      .insert([{
        parent_atom_id: parentAtomId,
        child_atom_id: childAtomId
      }]);

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    return response.status(200).json({ success: true });
  } catch (error: any) {
    return response.status(500).json({ error: error.message || 'Internal server error' });
  }
}




