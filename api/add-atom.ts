import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to normalize tag names
const normalizeTagName = (name: string): string => {
  return name.trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Handle CORS
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
    const {
      title,
      description,
      media_source_link,
      link,
      content_type = 'image',
      tags = [],
      creator_name,
    } = request.body;

    if (!media_source_link) {
      return response.status(400).json({ error: 'media_source_link is required' });
    }

    // Normalize tags
    const normalizedTags = tags.map(normalizeTagName).filter(Boolean);

    // Auto-tag ideas with a tag based on the idea title
    let finalTags = normalizedTags;
    if (content_type === 'idea' && title) {
      const ideaTag = normalizeTagName(title);
      if (!finalTags.includes(ideaTag)) {
        finalTags = [...finalTags, ideaTag];
      }
    }

    // Insert atom
    const { data: atomData, error: atomError } = await supabase
      .from('atoms')
      .insert([{
        title: title || 'Untitled',
        description: description || null,
        media_source_link,
        link: link || null,
        content_type,
        tags: finalTags,
        creator_name: creator_name || null,
        store_in_database: true,
      }])
      .select()
      .single();

    if (atomError) {
      console.error('Error adding atom:', atomError);
      return response.status(500).json({ error: atomError.message });
    }

    // Handle creators if provided
    if (creator_name && atomData) {
      const creatorNames = creator_name.split(',').map(s => s.trim()).filter(Boolean);
      const { data: allCreators } = await supabase.from('creators').select('*');
      const creatorIds = [];

      for (const name of creatorNames) {
        let creator = allCreators?.find((c: any) => c.name === name);
        if (!creator) {
          const { data: newCreator } = await supabase
            .from('creators')
            .insert([{ name, count: 1 }])
            .select()
            .single();
          creator = newCreator;
        }
        if (creator) creatorIds.push(creator.id);
      }

      // Add creator links
      for (const creator_id of creatorIds) {
        await supabase
          .from('atom_creators')
          .insert([{ atom_id: atomData.id, creator_id }]);
      }
    }

    return response.status(200).json({
      success: true,
      atom: atomData,
    });
  } catch (error: any) {
    console.error('Error in add-atom API:', error);
    return response.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}

