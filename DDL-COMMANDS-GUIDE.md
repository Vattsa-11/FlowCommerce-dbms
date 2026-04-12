# Admin Dashboard SQL Query Tool - DDL Commands

## Issue
The admin dashboard SQL query tool was not able to execute DDL commands (CREATE, ALTER, DROP, TRUNCATE, RENAME).

## Why This Happens
The admin dashboard uses Supabase's PostgREST API, which is designed for data operations (SELECT, INSERT, UPDATE, DELETE) but doesn't support executing raw DDL commands directly. This is by design for security reasons.

## Solution Implemented

### What Now Happens
When you try to execute a DDL command in the admin dashboard, you'll see:

1. ⚠️ **Warning** that DDL commands cannot be executed through the admin panel
2. 📝 **Step-by-step instructions** on how to execute your DDL command properly
3. **Your SQL query displayed** in a code block for easy copying

### How to Execute DDL Commands

**Method 1: Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard
2. Select your project: **iyddgoxxvygfavgoxzrf**
3. Click on **SQL Editor** in the left sidebar
4. Paste your DDL command
5. Click **Run**

**Method 2: Use the provided SQL file**
- For the DOB/Gender issue, use: `add-dob-gender-columns.sql`
- Just copy the contents and run in Supabase SQL Editor

### What Works in Admin Dashboard
✅ **SELECT queries** - All SELECT statements with WHERE, JOIN, ORDER BY, GROUP BY, etc.
✅ **SHOW TABLES** - Lists all available tables with record counts
✅ **DESCRIBE table_name** - Shows table schema/columns
✅ **Aggregate functions** - COUNT(*), SUM(), AVG(), etc.

### What Requires Supabase SQL Editor
⚠️ **CREATE TABLE** - Creating new tables
⚠️ **ALTER TABLE** - Modifying table structure (adding/removing columns)
⚠️ **DROP TABLE** - Deleting tables
⚠️ **TRUNCATE** - Clearing table data
⚠️ **RENAME** - Renaming tables or columns

## Files Modified
- `config.js` - Added executeRawSQL() function with helpful error messages
- `admin.js` - Modified parseAndExecuteSQL() to detect DDL commands and show instructions
- `admin.js` - Updated DESCRIBE command to include 'dob' and 'gender' columns for customers table

## Examples

### Query That Works (in Admin Dashboard)
```sql
SELECT * FROM customers WHERE dob IS NOT NULL;
```

### Query That Needs Supabase SQL Editor
```sql
ALTER TABLE customers ADD COLUMN dob DATE;
```

When you try the ALTER command in admin dashboard, you'll see helpful instructions with a direct link to Supabase SQL Editor.

## Benefits
1. ✅ Clear error messages instead of cryptic API errors
2. ✅ Step-by-step instructions for executing DDL commands
3. ✅ Your SQL query is displayed for easy copying
4. ✅ Direct link to Supabase dashboard
5. ✅ Maintains security by not allowing unrestricted SQL execution
