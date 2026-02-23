-- Add progress tracking to analyses table
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS progress_message TEXT;
