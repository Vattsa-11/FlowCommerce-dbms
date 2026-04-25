-- FlowCommerce Review 3 
-- Covers:
-- Normalization, Transaction Control, Concurrency Control


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'customers'
          AND column_name = 'dob'
    ) THEN
        ALTER TABLE customers
        ADD COLUMN dob DATE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'customers'
          AND column_name = 'gender'
    ) THEN
        ALTER TABLE customers
        ADD COLUMN gender VARCHAR(20);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_products_price_non_negative'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT chk_products_price_non_negative CHECK (price >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_products_stock_non_negative'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT chk_products_stock_non_negative CHECK (stock >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_customers_gender'
    ) THEN
        ALTER TABLE customers
        ADD CONSTRAINT chk_customers_gender CHECK (gender IN ('Male', 'Female', 'Other') OR gender IS NULL);
    END IF;
END;
$$;

-- 1B) DML operations (INSERT, UPDATE, DELETE)
INSERT INTO products (name, description, price, category, stock, brand, rating, discount_percentage)
VALUES
('Boat Airdopes 441', 'Wireless earbuds with deep bass', 2499.00, 'Electronics', 120, 'Boat', 4.2, 20.00),
('Pigeon Non-Stick Pan', '24cm non-stick frying pan', 899.00, 'Home & Kitchen', 80, 'Pigeon', 4.1, 10.00)
ON CONFLICT DO NOTHING;

UPDATE products
SET price = price * 0.95
WHERE category = 'Books' AND stock > 50;

DELETE FROM wishlist_items
WHERE customer_id IN (
    SELECT c.id
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id
    WHERE o.id IS NULL
);

-- 1D) Reviewer-safe seed data for orders/order_items (only if missing)
DO $$
DECLARE
    v_customer_id INTEGER;
    v_customer_name VARCHAR(255);
    v_customer_email VARCHAR(255);
    v_product_id INTEGER;
    v_product_name VARCHAR(255);
    v_product_price NUMERIC(10,2);
BEGIN
    SELECT id, full_name, email
    INTO v_customer_id, v_customer_name, v_customer_email
    FROM customers
    ORDER BY id
    LIMIT 1;

    SELECT id, name, price
    INTO v_product_id, v_product_name, v_product_price
    FROM products
    ORDER BY id
    LIMIT 1;

    IF v_customer_id IS NOT NULL
       AND v_product_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ORD-REVIEW2-DEMO-001') THEN

        INSERT INTO orders (
            id, customer_id, customer_email, subtotal, shipping, tax, discount, total,
            status, payment_method, payment_status, shipping_name, shipping_email,
            shipping_phone, shipping_address, shipping_city, shipping_pincode
        )
        VALUES (
            'ORD-REVIEW2-DEMO-001', v_customer_id, v_customer_email,
            v_product_price, 50.00, ROUND(v_product_price * 0.18, 2), 0.00,
            v_product_price + 50.00 + ROUND(v_product_price * 0.18, 2),
            'Delivered', 'UPI', 'Paid',
            COALESCE(v_customer_name, 'Demo Customer'), v_customer_email,
            '9000000000', 'Demo Address', 'Chennai', '600001'
        );

        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total)
        VALUES (
            'ORD-REVIEW2-DEMO-001', v_product_id, v_product_name,
            v_product_price, 1, v_product_price
        );
    END IF;
END;
$$;

-- 1C) Set operations (UNION, INTERSECT, EXCEPT)
-- Customers who either ordered or have cart activity
SELECT customer_id FROM orders
UNION
SELECT customer_id FROM cart_items;

-- Customers who ordered and also maintain wishlist
SELECT customer_id FROM orders
INTERSECT
SELECT customer_id FROM wishlist_items;

-- Customers with carts but no orders yet
SELECT customer_id FROM cart_items
EXCEPT
SELECT customer_id FROM orders;

-- 1E) Aggregate + GROUP BY + HAVING (strict rubric coverage)
SELECT
    category,
    COUNT(*) AS product_count,
    ROUND(AVG(price), 2) AS avg_price
FROM products
GROUP BY category
HAVING COUNT(*) >= 2
ORDER BY product_count DESC, avg_price DESC;


-- =========================================================
-- TASK 2: SUBQUERIES + JOINS + VIEWS
-- =========================================================

-- 2A) Join query: customer + order + items + product
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

-- 2B) Subquery: products priced above category average
SELECT p.id, p.name, p.category, p.price
FROM products p
WHERE p.price > (
    SELECT AVG(p2.price)
    FROM products p2
    WHERE p2.category = p.category
)
ORDER BY p.category, p.price DESC;

-- 2C) Correlated subquery: customers with above-average order spend
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

-- 2D) View for reviewer demonstration
CREATE OR REPLACE VIEW vw_customer_order_summary AS
SELECT
    c.id AS customer_id,
    c.full_name,
    c.email,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total), 0) AS total_spent,
    COALESCE(AVG(o.total), 0) AS avg_order_value
FROM customers c
LEFT JOIN orders o
    ON o.customer_id = c.id
    OR (o.customer_id IS NULL AND LOWER(o.customer_email) = LOWER(c.email))
GROUP BY c.id, c.full_name, c.email;

-- Query the view
SELECT *
FROM vw_customer_order_summary
ORDER BY total_spent DESC;


-- =========================================================
-- TASK 3: FUNCTIONS + TRIGGERS + CURSORS + EXCEPTION HANDLING
-- =========================================================

-- 3A) Function: calculate order grand total from order_items
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

-- Example call
-- SELECT fn_calculate_order_total('ORD-1738950123-ABC12');

-- 3A2) Procedure: category-wise discount with validation and exception handling
CREATE OR REPLACE PROCEDURE sp_apply_category_discount(
    p_category VARCHAR,
    p_discount_percent NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_category_id INTEGER;
BEGIN
    IF p_discount_percent < 0 OR p_discount_percent > 100 THEN
        RAISE EXCEPTION 'Discount percent must be between 0 and 100. Received: %', p_discount_percent;
    END IF;

    SELECT id
    INTO v_category_id
    FROM categories
    WHERE LOWER(name) = LOWER(TRIM(p_category))
    LIMIT 1;

    UPDATE products
    SET price = ROUND(price * (1 - p_discount_percent / 100.0), 2)
    WHERE category = p_category
       OR (v_category_id IS NOT NULL AND category_id = v_category_id);

    IF NOT FOUND THEN
        RAISE NOTICE 'No products found for category %', p_category;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Procedure sp_apply_category_discount failed: %', SQLERRM;
        RAISE;
END;
$$;

-- Example call
-- CALL sp_apply_category_discount('Books', 5);

-- 3B) Trigger function: prevent negative stock and auto-decrement stock
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
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Stock trigger failed for product %: %', NEW.product_id, SQLERRM;
        RAISE;
END;
$$;

DROP TRIGGER IF EXISTS trg_reduce_stock_after_order_item ON order_items;

CREATE TRIGGER trg_reduce_stock_after_order_item
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION fn_validate_and_reduce_stock();

-- 3C) Cursor + exception handling: clean stale cart rows
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

        DELETE FROM cart_items
        WHERE id = v_cart_id;

        v_deleted_count := v_deleted_count + 1;
    END LOOP;

    CLOSE cur_stale_cart;

    RETURN v_deleted_count;
EXCEPTION
    WHEN OTHERS THEN
        BEGIN
            CLOSE cur_stale_cart;
        EXCEPTION
            WHEN invalid_cursor_name THEN
                NULL;
        END;
        RAISE NOTICE 'Cursor cleanup failed: %', SQLERRM;
        RAISE;
END;
$$;

-- Example call
-- SELECT fn_cleanup_stale_cart_items(45);

-- 3D) Explicit exception handling demo block
DO $$
BEGIN
    PERFORM fn_calculate_order_total('INVALID-ORDER-ID');
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Handled exception for reviewer demo: %', SQLERRM;
END;
$$;


-- =========================================================
-- REVIEW 3 - PHASE 1: NORMALIZATION IMPLEMENTATION
-- =========================================================

-- 4A) Normalize product categories into separate master table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'category_id'
    ) THEN
        ALTER TABLE products
        ADD COLUMN category_id INTEGER;
    END IF;
END;
$$;

INSERT INTO categories (name)
SELECT DISTINCT TRIM(category)
FROM products
WHERE category IS NOT NULL
  AND TRIM(category) <> ''
ON CONFLICT (name) DO NOTHING;

UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.category_id IS NULL
  AND p.category IS NOT NULL
  AND TRIM(p.category) = c.name;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_products_category_id'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT fk_products_category_id
        FOREIGN KEY (category_id) REFERENCES categories(id);
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Keep products.category temporarily for compatibility during rollout.

-- 4B) Normalize shipping details into shipments table
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

INSERT INTO shipments (
    order_id,
    recipient_name,
    recipient_email,
    recipient_phone,
    full_address,
    city,
    pincode,
    status
)
SELECT
    o.id,
    COALESCE(NULLIF(o.shipping_name, ''), 'Unknown Recipient'),
    NULLIF(o.shipping_email, ''),
    NULLIF(o.shipping_phone, ''),
    COALESCE(NULLIF(o.shipping_address, ''), 'Address unavailable'),
    NULLIF(o.shipping_city, ''),
    NULLIF(o.shipping_pincode, ''),
    CASE
        WHEN o.status IN ('Delivered', 'Cancelled') THEN o.status
        ELSE 'Pending'
    END
FROM orders o
ON CONFLICT (order_id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);

-- 4C) Normalization proof queries
-- Single-row category rename without touching products table rows.
-- UPDATE categories SET name = 'Electronics & Gadgets' WHERE name = 'Electronics';

-- Category can exist without products (insertion anomaly removed).
-- INSERT INTO categories (name) VALUES ('Office Supplies') ON CONFLICT (name) DO NOTHING;

-- Shipping details now retrieved by join between orders and shipments.
-- SELECT o.id, s.recipient_name, s.full_address FROM orders o JOIN shipments s ON s.order_id = o.id;


-- =========================================================
-- REVIEW 3 - PHASE 2: TRANSACTION CONTROL IMPLEMENTATION
-- =========================================================

CREATE OR REPLACE FUNCTION fn_checkout_transaction(
    p_order_id VARCHAR,
    p_customer_id INTEGER,
    p_customer_email VARCHAR,
    p_items JSONB,
    p_subtotal NUMERIC,
    p_shipping NUMERIC,
    p_tax NUMERIC,
    p_discount NUMERIC,
    p_total NUMERIC,
    p_payment_method VARCHAR,
    p_shipping_name VARCHAR,
    p_shipping_email VARCHAR,
    p_shipping_phone VARCHAR,
    p_shipping_address TEXT,
    p_shipping_city VARCHAR,
    p_shipping_pincode VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_item JSONB;
    v_product_id INTEGER;
    v_quantity INTEGER;
    v_price NUMERIC(10,2);
    v_name VARCHAR(255);
BEGIN
    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Checkout requires at least one item';
    END IF;

    IF p_total <= 0 THEN
        RAISE EXCEPTION 'Invalid order total: %', p_total;
    END IF;

    INSERT INTO orders (
        id,
        customer_id,
        customer_email,
        items,
        subtotal,
        shipping,
        tax,
        discount,
        total,
        status,
        payment_method,
        payment_status,
        shipping_name,
        shipping_email,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_pincode
    ) VALUES (
        p_order_id,
        p_customer_id,
        p_customer_email,
        p_items,
        p_subtotal,
        p_shipping,
        p_tax,
        p_discount,
        p_total,
        'Processing',
        p_payment_method,
        'Pending',
        p_shipping_name,
        p_shipping_email,
        p_shipping_phone,
        p_shipping_address,
        p_shipping_city,
        p_shipping_pincode
    );

    BEGIN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            v_product_id := COALESCE((v_item->>'id')::INTEGER, (v_item->>'product_id')::INTEGER);
            v_quantity := COALESCE((v_item->>'quantity')::INTEGER, 0);
            v_price := COALESCE((v_item->>'price')::NUMERIC, 0);
            v_name := COALESCE(v_item->>'name', 'Unknown Product');

            IF v_product_id IS NULL OR v_quantity <= 0 THEN
                RAISE EXCEPTION 'Invalid item payload in checkout: %', v_item;
            END IF;

            INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total)
            VALUES (
                p_order_id,
                v_product_id,
                v_name,
                v_price,
                v_quantity,
                ROUND(v_price * v_quantity, 2)
            );
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Order item insertion failed: %', SQLERRM;
    END;

    INSERT INTO shipments (
        order_id,
        recipient_name,
        recipient_email,
        recipient_phone,
        full_address,
        city,
        pincode,
        status
    )
    VALUES (
        p_order_id,
        COALESCE(NULLIF(p_shipping_name, ''), 'Unknown Recipient'),
        NULLIF(p_shipping_email, ''),
        NULLIF(p_shipping_phone, ''),
        COALESCE(NULLIF(p_shipping_address, ''), 'Address unavailable'),
        NULLIF(p_shipping_city, ''),
        NULLIF(p_shipping_pincode, ''),
        'Pending'
    )
    ON CONFLICT (order_id)
    DO UPDATE SET
        recipient_name = EXCLUDED.recipient_name,
        recipient_email = EXCLUDED.recipient_email,
        recipient_phone = EXCLUDED.recipient_phone,
        full_address = EXCLUDED.full_address,
        city = EXCLUDED.city,
        pincode = EXCLUDED.pincode,
        updated_at = NOW();

    DELETE FROM cart_items
    WHERE customer_id = p_customer_id
      AND p_customer_id IS NOT NULL;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'message', 'Order placed successfully with transactional integrity'
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- Savepoint and rollback demo for manual execution in SQL editor
-- BEGIN;
-- INSERT INTO categories (name) VALUES ('ROLLBACK-DEMO-CATEGORY') ON CONFLICT (name) DO NOTHING;
-- SAVEPOINT sp_discount_validation;
-- UPDATE products
-- SET price = ROUND(price * 0.10, 2)
-- WHERE category = 'Books';
-- -- Validation fails here in review demonstration
-- ROLLBACK TO SAVEPOINT sp_discount_validation;
-- DELETE FROM categories WHERE name = 'ROLLBACK-DEMO-CATEGORY';
-- COMMIT;


-- =========================================================
-- REVIEW 3 - PHASE 3: CONCURRENCY CONTROL IMPLEMENTATION
-- =========================================================

-- 6A) Prevent cart lost updates with uniqueness + UPSERT function
WITH grouped AS (
        SELECT customer_id, product_id, SUM(quantity) AS total_quantity
        FROM cart_items
        GROUP BY customer_id, product_id
)
UPDATE cart_items ci
SET quantity = g.total_quantity
FROM grouped g
WHERE ci.customer_id = g.customer_id
    AND ci.product_id = g.product_id;

DELETE FROM cart_items a
USING cart_items b
WHERE a.ctid < b.ctid
    AND a.customer_id = b.customer_id
    AND a.product_id = b.product_id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_cart_customer_product
ON cart_items(customer_id, product_id);

CREATE OR REPLACE FUNCTION fn_cart_add_item(
    p_customer_id INTEGER,
    p_product_id INTEGER,
    p_quantity INTEGER
)
RETURNS TABLE (id INTEGER, customer_id INTEGER, product_id INTEGER, quantity INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be positive. Received: %', p_quantity;
    END IF;

    INSERT INTO cart_items (customer_id, product_id, quantity)
    VALUES (p_customer_id, p_product_id, p_quantity)
    ON CONFLICT (customer_id, product_id)
    DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
    RETURNING cart_items.id, cart_items.customer_id, cart_items.product_id, cart_items.quantity;
END;
$$;

-- 6B) Two-session concurrency test steps for stock locking
-- Session A:
-- BEGIN;
-- INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total)
-- VALUES ('ORD-CONC-A', 1, 'Concurrency Demo Item', 100.00, 1, 100.00);
-- -- Keep transaction open for a few seconds before COMMIT.

-- Session B (run before Session A commits):
-- BEGIN;
-- INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total)
-- VALUES ('ORD-CONC-B', 1, 'Concurrency Demo Item', 100.00, 999999, 99999900.00);
-- -- Expected: waits for lock or fails with insufficient stock after Session A commit.

-- 6C) Atomic discount transaction demo with rollback conditions
CREATE OR REPLACE PROCEDURE sp_apply_category_discount_safe(
    p_category_name VARCHAR,
    p_discount_percent NUMERIC,
    p_min_avg_price NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_before_avg NUMERIC(10,2);
    v_after_avg NUMERIC(10,2);
    v_category_id INTEGER;
BEGIN
    IF p_discount_percent <= 0 OR p_discount_percent > 90 THEN
        RAISE EXCEPTION 'Discount percent out of allowed range: %', p_discount_percent;
    END IF;

    SELECT id
    INTO v_category_id
    FROM categories
    WHERE LOWER(name) = LOWER(TRIM(p_category_name))
    LIMIT 1;

    SELECT ROUND(AVG(price), 2)
    INTO v_before_avg
    FROM products
    WHERE category = p_category_name
       OR (v_category_id IS NOT NULL AND category_id = v_category_id);

    IF v_before_avg IS NULL THEN
        RAISE EXCEPTION 'No products found in category %', p_category_name;
    END IF;

    UPDATE products
    SET price = ROUND(price * (1 - p_discount_percent / 100.0), 2)
     WHERE category = p_category_name
         OR (v_category_id IS NOT NULL AND category_id = v_category_id);

    SELECT ROUND(AVG(price), 2)
    INTO v_after_avg
    FROM products
     WHERE category = p_category_name
         OR (v_category_id IS NOT NULL AND category_id = v_category_id);

    IF v_after_avg < p_min_avg_price THEN
        RAISE EXCEPTION 'Rollback applied. Avg price % is below threshold %', v_after_avg, p_min_avg_price;
    END IF;

    RAISE NOTICE 'Discount applied successfully. Before avg %, After avg %', v_before_avg, v_after_avg;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;