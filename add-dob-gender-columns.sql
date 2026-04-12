-- Add DOB and Gender columns to customers table
-- Run this SQL in Supabase SQL Editor

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- Optional: Add a comment to describe the columns
COMMENT ON COLUMN customers.dob IS 'Customer date of birth';
COMMENT ON COLUMN customers.gender IS 'Customer gender (Male, Female, Other)';
