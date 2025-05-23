/*
  # Add default category setting
  
  1. Changes
    - Create settings table to store user preferences
    - Add default category setting
*/

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Settings are viewable by everyone"
ON settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can manage settings"
ON settings FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();