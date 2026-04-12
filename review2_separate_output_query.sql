-- Separate query for non-zero reviewer output in vw_customer_order_summary
-- Run this independently after your base schema/tables are ready

-- 1) Seed one demo order and order item only if missing
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

-- 2) Recreate summary view with customer_id + email fallback join
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

-- 3) Check output
SELECT *
FROM vw_customer_order_summary
ORDER BY total_spent DESC;