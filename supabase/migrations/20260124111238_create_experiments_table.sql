/*
  # Create Experiments Table

  1. New Tables
    - `experiments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `material_name` (text)
      - `category` (text)
      - `optimization_goal` (text)
      - `co2_score` (numeric, nullable)
      - `input_json` (jsonb)
      - `result_json` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `experiments` table
    - Add policy for authenticated users to read their own experiments
    - Add policy for authenticated users to insert their own experiments
    - Add policy for authenticated users to update their own experiments
    - Add policy for authenticated users to delete their own experiments
*/

CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_name text NOT NULL,
  category text NOT NULL,
  optimization_goal text NOT NULL,
  co2_score numeric,
  input_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own experiments"
  ON experiments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiments"
  ON experiments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiments"
  ON experiments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiments"
  ON experiments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS experiments_user_id_idx ON experiments(user_id);
CREATE INDEX IF NOT EXISTS experiments_created_at_idx ON experiments(created_at DESC);
