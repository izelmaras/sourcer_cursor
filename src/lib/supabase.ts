import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create the Supabase client with retry configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Test database connection with retries
export const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.from('atoms').select('count');
      if (error) {
        console.error(`Database connection attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) return false;
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error);
      if (i === retries - 1) return false;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return false;
};

// Initialize data fetching with better error handling
export const initializeData = async () => {
  try {
    // Test connection first
    const connectionTest = await testConnection();
    if (!connectionTest) {
      throw new Error('Database connection failed after multiple attempts');
    }

    // Fetch data with individual error handling
    const results = await Promise.all([
      supabase.from('atoms').select('*').order('created_at', { ascending: false })
        .then(response => {
          if (response.error) throw new Error(`Atoms fetch failed: ${response.error.message}`);
          return response.data || [];
        }),
      supabase.from('tags').select('*').order('count', { ascending: false })
        .then(response => {
          if (response.error) throw new Error(`Tags fetch failed: ${response.error.message}`);
          return response.data || [];
        }),
      supabase.from('categories').select('*').order('name')
        .then(response => {
          if (response.error) throw new Error(`Categories fetch failed: ${response.error.message}`);
          return response.data || [];
        }),
      supabase.from('creators').select('*').order('count', { ascending: false })
        .then(response => {
          if (response.error) throw new Error(`Creators fetch failed: ${response.error.message}`);
          return response.data || [];
        })
    ]);

    return {
      atoms: results[0],
      tags: results[1],
      categories: results[2],
      creators: results[3]
    };
  } catch (error) {
    console.error('Error initializing data:', error);
    // Re-throw with more context
    throw new Error(`Failed to initialize data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Initialize connection test
testConnection().then(success => {
  if (!success) {
    console.error('Initial database connection test failed - please check your Supabase configuration and network connection');
  } else {
    console.log('Initial database connection test successful');
  }
});