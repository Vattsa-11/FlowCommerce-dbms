-- FlowCommerce Review 2 + Lab (Experiments 4-6)
-- Covers:
-- 1) DML, constraints, aggregate functions, set operations
-- 2) Subqueries, joins, views
-- 3) Functions, procedures, triggers, cursors, exception handling

-- =========================================================
-- TASK 1: DML + CONSTRAINTS + AGGREGATES + SET OPERATIONS
-- =========================================================

-- 1A) Add business constraints safely (only if they do not exist)
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