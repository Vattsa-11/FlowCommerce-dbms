-- =========================================================
-- TCL Demo: Transaction + Error + Rollback (PostgreSQL)
-- =========================================================
-- This version is robust for SQL editors that stop on first error.
-- It still demonstrates: BEGIN -> error occurs -> ROLLBACK.

-- 0) Setup outside the demo transaction
DROP TABLE IF EXISTS tcl_rollback_demo;

CREATE TABLE tcl_rollback_demo (
	id INTEGER PRIMARY KEY,
	note TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT NOW()
);

-- 1) Start transaction
BEGIN;

-- 2) Valid operation
INSERT INTO tcl_rollback_demo (id, note)
VALUES (1, 'Inserted before intentional error');

-- 3) Intentional error, but caught so script can continue
DO $$
BEGIN
	BEGIN
		INSERT INTO tcl_rollback_demo (id, note)
		VALUES (1, 'Duplicate key to trigger error');
	EXCEPTION
		WHEN unique_violation THEN
			RAISE NOTICE 'Expected error captured: duplicate key for id=1';
	END;
END;
$$;

-- 4) Roll back entire transaction
ROLLBACK;

-- 5) Verify rollback result
-- Expected: table exists, but row count is 0.
SELECT COUNT(*) AS rows_after_rollback
FROM tcl_rollback_demo;

-- Optional: show rows (expected empty)
SELECT *
FROM tcl_rollback_demo;

-- Optional cleanup
-- DROP TABLE tcl_rollback_demo;
