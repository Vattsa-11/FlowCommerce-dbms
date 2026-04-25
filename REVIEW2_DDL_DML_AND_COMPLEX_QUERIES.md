# Review 2 - SQL Compilation (PBL II + Lab Experiments 4-6)

## Coverage Checklist
- DML, constraints, aggregate functions, and set operations
- Complex queries using subqueries, joins, and views
- Functions, procedures, triggers, cursors, and exception handling

---

## 1) DDL Queries (Schema/Constraint-Level)

```sql
-- Add business constraints (safe execution)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_price_non_negative'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT chk_products_price_non_negative CHECK (price >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_stock_non_negative'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT chk_products_stock_non_negative CHECK (stock >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_customers_gender'
    ) THEN
        ALTER TABLE customers
        ADD CONSTRAINT chk_customers_gender CHECK (gender IN ('Male', 'Female', 'Other') OR gender IS NULL);
    END IF;
END;
$$;

-- View creation
CREATE OR REPLACE VIEW vw_customer_order_summary AS
SELECT
    c.id AS customer_id,
    c.full_name,
    c.email,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total), 0) AS total_spent,
    COALESCE(AVG(o.total), 0) AS avg_order_value
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.full_name, c.email;

-- Function creation
CREATE OR REPLACE FUNCTION fn_calculate_order_total(p_order_id VARCHAR)
RETURNS NUMERIC(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total NUMERIC(10,2);
BEGIN
    SELECT COALESCE(SUM(total), 0)
    INTO v_total
    FROM order_items
    WHERE order_id = p_order_id;

    IF v_total = 0 THEN
        RAISE EXCEPTION 'No order items found for order id: %', p_order_id;
    END IF;

    RETURN v_total;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in fn_calculate_order_total(%): %', p_order_id, SQLERRM;
        RAISE;
END;
$$;

-- Procedure creation
CREATE OR REPLACE PROCEDURE sp_apply_category_discount(
    p_category VARCHAR,
    p_discount_percent NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_discount_percent < 0 OR p_discount_percent > 100 THEN
        RAISE EXCEPTION 'Discount percent must be between 0 and 100. Received: %', p_discount_percent;
    END IF;

    UPDATE products
    SET price = ROUND(price * (1 - p_discount_percent / 100.0), 2)
    WHERE category = p_category;

    IF NOT FOUND THEN
        RAISE NOTICE 'No products found for category %', p_category;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Procedure sp_apply_category_discount failed: %', SQLERRM;
        RAISE;
END;
$$;

-- Trigger function + trigger
CREATE OR REPLACE FUNCTION fn_validate_and_reduce_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_stock INTEGER;
BEGIN
    SELECT stock
    INTO v_current_stock
    FROM products
    WHERE id = NEW.product_id
    FOR UPDATE;

    IF v_current_stock IS NULL THEN
        RAISE EXCEPTION 'Product id % does not exist', NEW.product_id;
    END IF;

    IF v_current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product id %, available %, requested %',
            NEW.product_id, v_current_stock, NEW.quantity;
    END IF;

    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reduce_stock_after_order_item ON order_items;

CREATE TRIGGER trg_reduce_stock_after_order_item
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION fn_validate_and_reduce_stock();

-- Cursor function
CREATE OR REPLACE FUNCTION fn_cleanup_stale_cart_items(p_days INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_cart_id INTEGER;
    v_deleted_count INTEGER := 0;
    cur_stale_cart CURSOR FOR
        SELECT id
        FROM cart_items
        WHERE created_at < NOW() - (p_days || ' days')::INTERVAL;
BEGIN
    OPEN cur_stale_cart;

    LOOP
        FETCH cur_stale_cart INTO v_cart_id;
        EXIT WHEN NOT FOUND;

        DELETE FROM cart_items WHERE id = v_cart_id;
        v_deleted_count := v_deleted_count + 1;
    END LOOP;

    CLOSE cur_stale_cart;
    RETURN v_deleted_count;
EXCEPTION
    WHEN OTHERS THEN
        IF cur_stale_cart IS OPEN THEN
            CLOSE cur_stale_cart;
        END IF;
        RAISE NOTICE 'Cursor cleanup failed: %', SQLERRM;
        RAISE;
END;
$$;
```

---

## 2) DML Queries (Data Operations)

```sql
-- INSERT
INSERT INTO products (name, description, price, category, stock, brand, rating, discount_percentage)
VALUES
('Boat Airdopes 441', 'Wireless earbuds with deep bass', 2499.00, 'Electronics', 120, 'Boat', 4.2, 20.00),
('Pigeon Non-Stick Pan', '24cm non-stick frying pan', 899.00, 'Home & Kitchen', 80, 'Pigeon', 4.1, 10.00)
ON CONFLICT DO NOTHING;

-- UPDATE
UPDATE products
SET price = price * 0.95
WHERE category = 'Books' AND stock > 50;

-- DELETE
DELETE FROM wishlist_items
WHERE customer_id IN (
    SELECT c.id
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id
    WHERE o.id IS NULL
);
```

---

## 3) Asked Query Set - Task 1
### (DML + Constraints + Aggregate Functions + Set Operations)

```sql
-- UNION
SELECT customer_id FROM orders
UNION
SELECT customer_id FROM cart_items;

-- INTERSECT
SELECT customer_id FROM orders
INTERSECT
SELECT customer_id FROM wishlist_items;

-- EXCEPT
SELECT customer_id FROM cart_items
EXCEPT
SELECT customer_id FROM orders;

-- Aggregate + HAVING
SELECT
    category,
    COUNT(*) AS product_count,
    ROUND(AVG(price), 2) AS avg_price
FROM products
GROUP BY category
HAVING COUNT(*) >= 2
ORDER BY product_count DESC, avg_price DESC;
```

---

## 4) Asked Query Set - Task 2
### (Subqueries + Joins + Views)

```sql
-- Join query
SELECT
    c.id AS customer_id,
    c.full_name,
    o.id AS order_id,
    o.status,
    p.name AS product_name,
    oi.quantity,
    oi.total
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
ORDER BY o.created_at DESC;

-- Subquery: products above category average price
SELECT p.id, p.name, p.category, p.price
FROM products p
WHERE p.price > (
    SELECT AVG(p2.price)
    FROM products p2
    WHERE p2.category = p.category
)
ORDER BY p.category, p.price DESC;

-- Correlated subquery: customers with above-average order spend
SELECT c.id, c.full_name
FROM customers c
WHERE (
    SELECT AVG(o.total)
    FROM orders o
    WHERE o.customer_id = c.id
) > (
    SELECT AVG(total)
    FROM orders
);

-- View usage
SELECT *
FROM vw_customer_order_summary
ORDER BY total_spent DESC;
```

---

## 5) Asked Query Set - Task 3
### (Functions + Procedures + Triggers + Cursors + Exception Handling)

```sql
-- Function call
SELECT fn_calculate_order_total('ORD-1738950123-ABC12');

-- Procedure call
CALL sp_apply_category_discount('Books', 5);

-- Trigger test: inserting into order_items should reduce stock automatically
INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total)
VALUES ('ORD-TEST-001', 1, 'Samsung Galaxy S23', 79999.00, 1, 79999.00);

-- Cursor function call
SELECT fn_cleanup_stale_cart_items(45);

-- Exception handling demo
DO $$
BEGIN
    PERFORM fn_calculate_order_total('INVALID-ORDER-ID');
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Handled exception for reviewer demo: %', SQLERRM;
END;
$$;
```

---

## 6) Execution Order for Reviewer Demo
1. Run DDL block (constraints, view, function, procedure, trigger, cursor function)
2. Run DML block (insert/update/delete)
3. Run Task 1 aggregate + set operation queries
4. Run Task 2 join/subquery/view queries
5. Run Task 3 function/procedure/trigger/cursor/exception queries

---

## 7) Implementation File
The same executable script is also available in:
- `review2_lab4_6_implementation.sql`

---

## 8) Review 3 - Phase 1 (Normalization)

```sql
-- New normalized master table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add FK column to products and backfill
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER;
INSERT INTO categories (name)
SELECT DISTINCT TRIM(category)
FROM products
WHERE category IS NOT NULL AND TRIM(category) <> ''
ON CONFLICT (name) DO NOTHING;

UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.category_id IS NULL
  AND TRIM(p.category) = c.name;

-- Shipping details normalized
CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    full_address TEXT NOT NULL,
    city VARCHAR(100),
    pincode VARCHAR(10),
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

Normalization proof points:
- Category rename now updates one row in `categories` instead of many rows in `products`
- Category creation without product insertion is now possible
- Shipping data is fetched through `orders` + `shipments` join

---

## 9) Review 3 - Phase 2 (Transaction Control)

```sql
-- Single-call transactional checkout routine
SELECT fn_checkout_transaction(
    'ORD-R3-001',
    1,
    'demo@example.com',
    '[{"id":1,"name":"Demo","price":100,"quantity":1}]'::jsonb,
    100,
    5,
    10,
    0,
    115,
    'Cash on Delivery',
    'Demo User',
    'demo@example.com',
    '9000000000',
    'No.1 Demo Street',
    'Chennai',
    '600001'
);
```

Transaction guarantees demonstrated:
- Atomicity: order, order_items, stock reduction, shipment insert, cart clear happen together
- Consistency: stock validation trigger prevents invalid inventory states
- Isolation: row-level locks block conflicting concurrent stock updates
- Durability: committed order persisted in DB

---

## 10) Review 3 - Phase 3 (Concurrency Control)

```sql
-- Lost update prevention for cart
CREATE UNIQUE INDEX IF NOT EXISTS uq_cart_customer_product
ON cart_items(customer_id, product_id);

-- Atomic cart upsert
SELECT * FROM fn_cart_add_item(1, 10, 2);
```

Concurrent checkout test pattern (2 sessions):
1. Session A inserts order_items and keeps transaction open
2. Session B inserts same product concurrently
3. Expected outcome: Session B waits or fails with insufficient stock after Session A commit

---

## 11) Updated Demo Order
1. Run base Review 2 script
2. Run Review 3 normalization section
3. Validate normalized data with join queries
4. Run transactional checkout function
5. Run cart upsert and two-session concurrency tests
