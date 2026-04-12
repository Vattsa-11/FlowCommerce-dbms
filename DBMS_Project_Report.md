# FLOWCOMMERCE - MODERN eCOMMERCE PLATFORM

## 21CSC205P Database Management Systems
### A MINI PROJECT REPORT

---

**Submitted by**

*STUDENT1 NAME [REG NUM]*  
*STUDENT2 NAME [REG NUM]*

---

**Under the Guidance of**

*(GUIDE NAME)*  
*(Designation, Department)*

---

in partial fulfillment of the requirements for the degree of

**BACHELOR OF TECHNOLOGY**  
in  
**COMPUTER SCIENCE ENGINEERING**  
with specialization in *(SPECIALIZATION NAME)*

---

**DEPARTMENT OF NETWORKING AND COMMUNICATIONS**  
**SCHOOL OF COMPUTING**  
**COLLEGE OF ENGINEERING AND TECHNOLOGY**  
**SRM INSTITUTE OF SCIENCE AND TECHNOLOGY**  
**KATTANKULATHUR - 603 203**

**MAY 2026**

---

<div style="page-break-after: always;"></div>


# SRM INSTITUTE OF SCIENCE AND TECHNOLOGY
## KATTANKULATHUR - 603 203

---

## BONAFIDE CERTIFICATE

---

Certified that Project report titled **"FLOWCOMMERCE - MODERN eCOMMERCE PLATFORM"** is the bonafide work of **"STUDENT1 NAME [REG NUM], STUDENT2 NAME [REG NUM]"** who carried out the 21CSC205P Database Management Systems mini project work under my supervision.

<br><br><br><br><br>

**COURSE FACULTY**  
DESIGNATION  
Department

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**HEAD OF THE DEPARTMENT**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PROFESSOR AND HEAD  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Department

---

<div style="page-break-after: always;"></div>

## ABSTRACT

This project presents the design and implementation of **FlowCommerce**, a comprehensive modern eCommerce platform built using vanilla JavaScript, HTML5, CSS3, and Supabase PostgreSQL database. The system provides a complete end-to-end solution for online shopping with both customer-facing and administrative functionalities.

FlowCommerce addresses the growing need for scalable, user-friendly eCommerce platforms by implementing a robust database management system that handles complex relationships between customers, products, orders, and inventory. The platform features real-time product search, advanced filtering, shopping cart management, wishlist functionality, and comprehensive order tracking.

The database architecture consists of seven normalized relational tables: **customers**, **products**, **orders**, **order_items**, **addresses**, **cart_items**, and **wishlist_items**. The system implements proper normalization up to 5NF to eliminate data redundancy and maintain data integrity through foreign key constraints and referential integrity. Product categories are stored as attributes within the products table for simplicity and flexibility.

Key features include a professional dark/light mode theme switching mechanism, responsive design for mobile and desktop devices, secure user authentication using Supabase Auth, real-time inventory management, and an advanced admin dashboard with analytics, order management, and database query capabilities. The platform supports INR currency with proper tax calculations and multiple payment methods.

The implementation demonstrates advanced database concepts including complex SQL queries with joins, subqueries, aggregate functions, views, stored procedures, triggers, and cursors. Transaction management ensures ACID properties with proper concurrency control using locking mechanisms and recovery procedures with savepoints and rollbacks.

This project successfully demonstrates a production-ready eCommerce solution with scalable architecture, efficient database design, and modern web technologies, providing valuable insights into real-world database management systems and full-stack application development.

**Keywords:** eCommerce, Database Management System, PostgreSQL, Supabase, Normalization, ACID Properties, Transaction Management, Web Application, Full-Stack Development

---

<div style="page-break-after: always;"></div>

## TABLE OF CONTENTS

| Chapter No. | Title | Page No. |
|-------------|-------|----------|
| | **ABSTRACT** | |
| **1** | **Problem Understanding and ER Model** | |
| **2** | **Relational Schema and Database Creation** | |
| **3** | **Complex Queries** | |
| **4** | **Normalization** | |
| **5** | **Concurrency Control and Recovery** | |
| **6** | **Front-End and Back-End Implementation** | |
| **7** | **Results and Discussions** | |
| | **REFERENCES** | |

---

<div style="page-break-after: always;"></div>

## LIST OF FIGURES

| Figure No. | Name | Page No. |
|------------|------|----------|
| 1.1 | ER Diagram of FlowCommerce System | |
| 2.1 | Relational Schema for FlowCommerce | |
| 3.1 | Query Execution Results | |
| 4.1 | Normalization Process | |
| 5.1 | Transaction and Locking Examples | |
| 7.1 | Application Screenshots | |

---

<div style="page-break-after: always;"></div>

## LIST OF TABLES

| Table No. | Name | Page No. |
|-----------|------|----------|
| 2.1 | Database Tables Schema | |
| 4.1 | Functional Dependencies | |
| 5.1 | Lock Modes Description | |

---

<div style="page-break-after: always;"></div>

# CHAPTER 1

## PROBLEM UNDERSTANDING, IDENTIFICATION OF ENTITY AND RELATIONSHIPS, CONSTRUCTION OF DB USING ER MODEL FOR FLOWCOMMERCE

---

### 1.1 Introduction

FlowCommerce is a modern eCommerce platform built with JavaScript, HTML5, CSS3, and Supabase PostgreSQL database. The system provides comprehensive online shopping features including product browsing, shopping cart, order management, and an admin dashboard for business operations. The database handles complex relationships between customers, products, orders, and inventory with a focus on data integrity and scalability.

### 1.2 Motivation

The project addresses the need for efficient eCommerce database management systems that can handle multiple concurrent users, real-time inventory tracking, and order processing. It demonstrates practical implementation of database concepts including normalization, transaction management, and concurrency control in a real-world application.

### 1.3 Scope

**Database Features:**
- 7 normalized relational tables (1NF to 5NF)
- Complex SQL queries with joins, subqueries, and aggregate functions
- Views, triggers, and stored procedures
- Transaction management with ACID properties
- Concurrency control and recovery mechanisms

**Application Features:**
- Customer: Product browsing, cart management, wishlist, order tracking, dark/light mode
- Admin: Dashboard with analytics, product/order/customer management, inventory tracking

### 1.4 Problem Statement

Design and implement a comprehensive database management system for an eCommerce platform that efficiently handles customer management, product catalog, order processing, inventory tracking, and maintains ACID properties while supporting concurrent access and ensuring data integrity through proper normalization and constraints.

### 1.5 Project Requirements

**Functional Requirements:**
- User authentication and authorization
- Product management with search and filtering
- Shopping cart and wishlist
- Order placement and tracking
- Admin dashboard with CRUD operations
- Real-time inventory management

**Non-Functional Requirements:**
- Performance: Query execution < 500ms
- Security: Password encryption, SQL injection prevention
- Scalability: Support 10,000+ products, 5,000+ customers
- Reliability: Data backup and recovery mechanisms

### 1.6 Identification of Entity and Relationships

**Entities:**

1. **CUSTOMERS** - Registered users (PK: id)
2. **PRODUCTS** - Items for sale (PK: id)
3. **ORDERS** - Purchase transactions (PK: id, FK: customer_id)
4. **ORDER_ITEMS** - Order line items (PK: id, FK: order_id, product_id)
5. **ADDRESSES** - Customer addresses (PK: id, FK: customer_id)
6. **CART_ITEMS** - Shopping cart (PK: id, FK: customer_id, product_id)
7. **WISHLIST_ITEMS** - Saved items (PK: id, FK: customer_id, product_id)

**Relationships (All 1:N):**
- CUSTOMERS â†’ ORDERS, ADDRESSES, CART_ITEMS, WISHLIST_ITEMS
- ORDERS â†’ ORDER_ITEMS
- PRODUCTS â†’ ORDER_ITEMS, CART_ITEMS, WISHLIST_ITEMS

### 1.7 Construction of DB Using ER Model for FlowCommerce

The ER diagram follows Chen notation with rectangles for entities, ellipses for attributes, diamonds for relationships, and cardinality notations (1:N).

```
    CUSTOMERS (1) â”€â”€placesâ”€â”€ (N) ORDERS
    ORDERS (1) â”€â”€containsâ”€â”€ (N) ORDER_ITEMS
    PRODUCTS (1) â”€â”€referenced_inâ”€â”€ (N) ORDER_ITEMS
    CUSTOMERS (1) â”€â”€hasâ”€â”€ (N) ADDRESSES
    CUSTOMERS (1) â”€â”€hasâ”€â”€ (N) CART_ITEMS
    CUSTOMERS (1) â”€â”€hasâ”€â”€ (N) WISHLIST_ITEMS
    PRODUCTS (1) â”€â”€appears_inâ”€â”€ (N) CART_ITEMS
    PRODUCTS (1) â”€â”€appears_inâ”€â”€ (N) WISHLIST_ITEMS
```

**Figure 1.1: ER Diagram of FlowCommerce System**

The ER diagram depicts seven entities with one-to-many relationships. Primary keys (â¬¤) ensure unique identification, while foreign keys (â—†) maintain referential integrity. The ORDER_ITEMS table resolves the many-to-many relationship between ORDERS and PRODUCTS. Design includes separate cart/wishlist tables, JSONB for order snapshots, and intentional denormalization in ORDERS for data consistency. Product categories are stored as VARCHAR attributes within products table.

---

<div style="page-break-after: always;"></div>

# CHAPTER 2

## DESIGN OF RELATIONAL SCHEMAS, CREATION OF DATABASE AND TABLES FOR FLOWCOMMERCE

---

### 2.1 Relational Schema for FlowCommerce

The relational schema is derived from the ER model and represents the logical structure of the database in tabular format. Each table corresponds to an entity with appropriate primary keys, foreign keys, and constraints to maintain data integrity.

**Relational Schema Notation:**

```
CUSTOMERS(id, full_name, email*, password_hash, phone, dob, gender, address, city, state, 
          pincode, country, avatar, is_admin, created_at, updated_at)
Primary Key: id
Unique: email

PRODUCTS(id, name, description, price, category, stock, image, rating, discount_percentage, 
         brand, created_at)
Primary Key: id
Note: category is a VARCHAR field, not a foreign key

ORDERS(id, customer_id, customer_email, items, subtotal, shipping, tax, discount, total, 
       status, payment_method, payment_status, shipping_name, shipping_email, shipping_phone, 
       shipping_address, shipping_city, shipping_pincode, notes, created_at, updated_at)
Primary Key: id
Foreign Key: customer_id â†’ CUSTOMERS(id)

ORDER_ITEMS(id, order_id, product_id, product_name, product_image, price, quantity, total, 
            created_at)
Primary Key: id
Foreign Key: order_id â†’ ORDERS(id), product_id â†’ PRODUCTS(id)

ADDRESSES(id, customer_id, label, full_address, city, state, pincode, country, is_default, 
          created_at)
Primary Key: id
Foreign Key: customer_id â†’ CUSTOMERS(id)

CART_ITEMS(id, customer_id, product_id, quantity, created_at)
Primary Key: id
Foreign Key: customer_id â†’ CUSTOMERS(id), product_id â†’ PRODUCTS(id)

WISHLIST_ITEMS(id, customer_id, product_id, created_at)
Primary Key: id
Foreign Key: customer_id â†’ CUSTOMERS(id), product_id â†’ PRODUCTS(id)
```

**Note:** * denotes unique constraints

**Figure 2.1: Relational Schema for FlowCommerce**

The relational schema shows seven tables with defined primary and foreign keys. Foreign key constraints ensure referential integrity across related tables. Unique constraints on email prevent duplicate entries. The schema supports all functional requirements while maintaining normalized structure. Product categories are simple VARCHAR fields for flexibility.

### 2.2 Description of Tables

**Table 2.1: Database Tables Schema**

| Table Name | Attribute | Data Type | Size | Constraints/Description |
|------------|-----------|-----------|------|-------------------------|
| **CUSTOMERS** | id | INTEGER | - | PRIMARY KEY, AUTO_INCREMENT |
| | full_name | VARCHAR | 255 | Full name of customer |
| | email | VARCHAR | 255 | UNIQUE, NOT NULL, Email address |
| | password_hash | VARCHAR | 255 | Encrypted password |
| | phone | VARCHAR | 20 | Contact number |
| | dob | DATE | - | Date of birth |
| | gender | VARCHAR | 20 | Gender (Male/Female/Other) |
| | address | TEXT | - | Street address |
| | city | VARCHAR | 100 | City name |
| | state | VARCHAR | 100 | State/Province |
| | pincode | VARCHAR | 10 | Postal code |
| | country | VARCHAR | 100 | DEFAULT 'India' |
| | avatar | VARCHAR | 255 | Profile picture URL |
| | is_admin | BOOLEAN | - | DEFAULT FALSE, Admin flag |
| | created_at | TIMESTAMP | - | DEFAULT NOW() |
| | updated_at | TIMESTAMP | - | DEFAULT NOW() |
| **PRODUCTS** | id | INTEGER | - | PRIMARY KEY, AUTO_INCREMENT |
| | name | VARCHAR | 255 | NOT NULL, Product name |
| | description | TEXT | - | Product description |
| | price | NUMERIC | 10,2 | NOT NULL, Product price |
| | category | VARCHAR | 100 | Category name |
| | stock | INTEGER | - | DEFAULT 0, Available quantity |
| | image | VARCHAR | 500 | Product image URL |
| | rating | NUMERIC | 3,2 | DEFAULT 0, Rating (0-5) |
| | discount_percentage | NUMERIC | 5,2 | DEFAULT 0, Discount % |
| | brand | VARCHAR | 100 | Brand name |
| | created_at | TIMESTAMP | - | DEFAULT NOW() |
| **ORDERS** | id | VARCHAR | 50 | PRIMARY KEY, Order ID |
| | customer_id | INTEGER | - | FOREIGN KEY â†’ CUSTOMERS(id) |
| | customer_email | VARCHAR | 255 | Customer email |
| | items | JSONB | - | Order items snapshot |
| | subtotal | NUMERIC | 10,2 | Items total |
| | shipping | NUMERIC | 10,2 | DEFAULT 0, Shipping cost |
| | tax | NUMERIC | 10,2 | DEFAULT 0, Tax amount |
| | discount | NUMERIC | 10,2 | DEFAULT 0, Discount amount |
| | total | NUMERIC | 10,2 | NOT NULL, Final total |
| | status | VARCHAR | 50 | DEFAULT 'Processing' |
| | payment_method | VARCHAR | 50 | Payment method |
| | payment_status | VARCHAR | 50 | DEFAULT 'Pending' |
| | shipping_name | VARCHAR | 255 | Recipient name |
| | shipping_email | VARCHAR | 255 | Recipient email |
| | shipping_phone | VARCHAR | 20 | Recipient phone |
| | shipping_address | TEXT | - | Delivery address |
| | shipping_city | VARCHAR | 100 | Delivery city |
| | shipping_pincode | VARCHAR | 10 | Delivery pincode |
| | notes | TEXT | - | Order notes |
| | created_at | TIMESTAMP | - | DEFAULT NOW() |
| | updated_at | TIMESTAMP | - | DEFAULT NOW() |
| **ORDER_ITEMS** | id | INTEGER | - | PRIMARY KEY, AUTO_INCREMENT |
| | order_id | VARCHAR | 50 | FOREIGN KEY â†’ ORDERS(id) |
| | product_id | INTEGER | - | FOREIGN KEY â†’ PRODUCTS(id) |
| | product_name | VARCHAR | 255 | Product name snapshot |
| | product_image | VARCHAR | 500 | Product image URL |
| | price | NUMERIC | 10,2 | Price at purchase |
| | quantity | INTEGER | - | DEFAULT 1, Quantity ordered |
| | total | NUMERIC | 10,2 | Line item total |
| | created_at | TIMESTAMP | - | DEFAULT NOW() |
| **ADDRESSES** | id | INTEGER | - | PRIMARY KEY, AUTO_INCREMENT |
| | customer_id | INTEGER | - | FOREIGN KEY â†’ CUSTOMERS(id) |
| | label | VARCHAR | 50 | DEFAULT 'Home', Label |
| | full_address | TEXT | - | NOT NULL, Complete address |
| | city | VARCHAR | 100 | City name |
| | state | VARCHAR | 100 | State name |
| | pincode | VARCHAR | 10 | Postal code |
| | country | VARCHAR | 100 | DEFAULT 'India' |
| | is_default | BOOLEAN | - | DEFAULT FALSE |
| | created_at | TIMESTAMP | - | DEFAULT NOW() |
| **CART_ITEMS** | id | INTEGER | - | PRIMARY KEY, AUTO_INCREMENT |
| | customer_id | INTEGER | - | FOREIGN KEY â†’ CUSTOMERS(id) |
| | product_id | INTEGER | - | FOREIGN KEY â†’ PRODUCTS(id) |
| | quantity | INTEGER | - | DEFAULT 1, Item quantity |
| | created_at | TIMESTAMP | - | DEFAULT NOW() |
| **WISHLIST_ITEMS** | id | INTEGER | - | PRIMARY KEY, AUTO_INCREMENT |
| | customer_id | INTEGER | - | FOREIGN KEY â†’ CUSTOMERS(id) |
| | product_id | INTEGER | - | FOREIGN KEY â†’ PRODUCTS(id) |
| | created_at | TIMESTAMP | - | DEFAULT NOW() |

### 2.3 Creation of Database and Tables - DDL Commands

DDL (Data Definition Language) commands are used to create the database schema. Below are the SQL statements to create all tables in the FlowCommerce database.

**Creating CUSTOMERS Table:**

```sql
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(20),
    dob DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    avatar VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Creating PRODUCTS Table:**

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    category VARCHAR(100),
    stock INTEGER DEFAULT 0,
    image VARCHAR(500),
    rating NUMERIC(3,2) DEFAULT 0,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    brand VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Creating ORDERS Table:**

```sql
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    customer_email VARCHAR(255),
    items JSONB,
    subtotal NUMERIC(10,2),
    shipping NUMERIC(10,2) DEFAULT 0,
    tax NUMERIC(10,2) DEFAULT 0,
    discount NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Processing',
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'Pending',
    shipping_name VARCHAR(255),
    shipping_email VARCHAR(255),
    shipping_phone VARCHAR(20),
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_pincode VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Creating ORDER_ITEMS Table:**

```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255),
    product_image VARCHAR(500),
    price NUMERIC(10,2),
    quantity INTEGER DEFAULT 1,
    total NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Creating ADDRESSES Table:**

```sql
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    label VARCHAR(50) DEFAULT 'Home',
    full_address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Creating CART_ITEMS Table:**

```sql
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Creating WISHLIST_ITEMS Table:**

```sql
CREATE TABLE wishlist_items (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    product_id INTEGER REFERENCES products(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.4 Insertion of Tuples into the Table - DML Commands

DML (Data Manipulation Language) commands are used to insert, update, and delete data. Below are sample INSERT statements for all tables with representative data.

**Inserting into CUSTOMERS Table:**

```sql
INSERT INTO customers (full_name, email, password_hash, phone, dob, gender, city, state, country) 
VALUES 
('Rajesh Kumar', 'rajesh.kumar@email.com', 'hashed_pwd_123', '9876543210', '1990-05-15', 'Male', 'Mumbai', 'Maharashtra', 'India'),
('Priya Sharma', 'priya.sharma@email.com', 'hashed_pwd_456', '9876543211', '1992-08-20', 'Female', 'Delhi', 'Delhi', 'India'),
('Admin User', 'admin@flowcommerce.com', 'admin_hashed', '9999999999', NULL, NULL, 'Bangalore', 'Karnataka', 'India');

UPDATE customers SET is_admin = TRUE WHERE email = 'admin@flowcommerce.com';
```

**Output:**
| id | full_name | email | phone | city | state | is_admin |
|----|-----------|-------|-------|------|-------|----------|
| 1 | Rajesh Kumar | rajesh.kumar@email.com | 9876543210 | Mumbai | Maharashtra | FALSE |
| 2 | Priya Sharma | priya.sharma@email.com | 9876543211 | Delhi | Delhi | FALSE |
| 3 | Admin User | admin@flowcommerce.com | 9999999999 | Bangalore | Karnataka | TRUE |

**Inserting into PRODUCTS Table:**

```sql
INSERT INTO products (name, description, price, category, stock, brand, rating, discount_percentage) 
VALUES 
('Samsung Galaxy S23', 'Latest flagship smartphone with 256GB storage', 79999.00, 'Electronics', 50, 'Samsung', 4.5, 10.0),
('Levi''s Jeans', 'Classic fit denim jeans', 2999.00, 'Clothing', 100, 'Levis', 4.3, 15.0),
('Prestige Pressure Cooker', '5L stainless steel pressure cooker', 1899.00, 'Home & Kitchen', 75, 'Prestige', 4.6, 5.0),
('The Alchemist', 'Bestselling novel by Paulo Coelho', 350.00, 'Books', 200, 'HarperCollins', 4.8, 0.0);
```

**Output:**
| id | name | price | category | stock | brand | rating |
|----|------|-------|----------|-------|-------|--------|
| 1 | Samsung Galaxy S23 | â‚¹79,999.00 | Electronics | 50 | Samsung | 4.5 |
| 2 | Levi's Jeans | â‚¹2,999.00 | Clothing | 100 | Levis | 4.3 |
| 3 | Prestige Pressure Cooker | â‚¹1,899.00 | Home & Kitchen | 75 | Prestige | 4.6 |
| 4 | The Alchemist | â‚¹350.00 | Books | 200 | HarperCollins | 4.8 |

**Inserting into ORDERS Table:**

```sql
INSERT INTO orders (id, customer_id, customer_email, subtotal, shipping, tax, total, status, payment_method, shipping_name, shipping_address, shipping_city, shipping_pincode) 
VALUES 
('ORD-1738950123-ABC12', 1, 'rajesh.kumar@email.com', 79999.00, 100.00, 7199.90, 87298.90, 'Delivered', 'UPI', 'Rajesh Kumar', '123 MG Road, Andheri', 'Mumbai', '400058'),
('ORD-1738950456-XYZ34', 2, 'priya.sharma@email.com', 2999.00, 100.00, 309.90, 3408.90, 'Processing', 'Credit Card', 'Priya Sharma', '45 Connaught Place', 'Delhi', '110001');
```

**Output:**
| id | customer_email | total | status | payment_method | shipping_city |
|----|---------------|-------|--------|----------------|---------------|
| ORD-1738950123-ABC12 | rajesh.kumar@email.com | â‚¹87,298.90 | Delivered | UPI | Mumbai |
| ORD-1738950456-XYZ34 | priya.sharma@email.com | â‚¹3,408.90 | Processing | Credit Card | Delhi |

**Inserting into ORDER_ITEMS Table:**

```sql
INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total) 
VALUES 
('ORD-1738950123-ABC12', 1, 'Samsung Galaxy S23', 79999.00, 1, 79999.00),
('ORD-1738950456-XYZ34', 2, 'Levi''s Jeans', 2999.00, 1, 2999.00);
```

**Output:**
| id | order_id | product_name | quantity | price | total |
|----|----------|--------------|----------|-------|-------|
| 1 | ORD-1738950123-ABC12 | Samsung Galaxy S23 | 1 | â‚¹79,999.00 | â‚¹79,999.00 |
| 2 | ORD-1738950456-XYZ34 | Levi's Jeans | 1 | â‚¹2,999.00 | â‚¹2,999.00 |

**Inserting into ADDRESSES Table:**

```sql
INSERT INTO addresses (customer_id, label, full_address, city, state, pincode, is_default) 
VALUES 
(1, 'Home', '123 MG Road, Andheri West', 'Mumbai', 'Maharashtra', '400058', TRUE),
(1, 'Office', '456 Business Park, BKC', 'Mumbai', 'Maharashtra', '400051', FALSE),
(2, 'Home', '45 Connaught Place, Central Delhi', 'Delhi', 'Delhi', '110001', TRUE);
```

**Output:**
| id | customer_id | label | city | state | is_default |
|----|-------------|-------|------|-------|------------|
| 1 | 1 | Home | Mumbai | Maharashtra | TRUE |
| 2 | 1 | Office | Mumbai | Maharashtra | FALSE |
| 3 | 2 | Home | Delhi | Delhi | TRUE |

**Inserting into CART_ITEMS Table:**

```sql
INSERT INTO cart_items (customer_id, product_id, quantity) 
VALUES 
(1, 3, 2),
(2, 4, 1);
```

**Output:**
| id | customer_id | product_id | quantity |
|----|-------------|------------|----------|
| 1 | 1 | 3 | 2 |
| 2 | 2 | 4 | 1 |

**Inserting into WISHLIST_ITEMS Table:**

```sql
INSERT INTO wishlist_items (customer_id, product_id) 
VALUES 
(1, 2),
(2, 1);
```

**Output:**
| id | customer_id | product_id |
|----|-------------|------------|
| 1 | 1 | 2 |
| 2 | 2 | 1 |

---

<div style="page-break-after: always;"></div>

# CHAPTER 3

## Complex queries based on the concepts of constraints, sets, joins, views, triggers and cursors

---

### 3.1 Adding Constraints and queries based on constraints

**Question 1:** Add a check constraint so product price cannot be negative.

**SQL Statement:**

```sql
ALTER TABLE products
ADD CONSTRAINT chk_products_price_non_negative
CHECK (price >= 0);
```

**Output:**
- Constraint created successfully.
- Any insert/update with price < 0 will be rejected.

**Question 2:** Add a check constraint so stock cannot be negative.

**SQL Statement:**

```sql
ALTER TABLE products
ADD CONSTRAINT chk_products_stock_non_negative
CHECK (stock >= 0);
```

**Output:**
- Constraint created successfully.
- Any insert/update with stock < 0 will fail.

**Question 3:** Add a valid-domain constraint for customer gender.

**SQL Statement:**

```sql
ALTER TABLE customers
ADD CONSTRAINT chk_customers_gender
CHECK (gender IN ('Male', 'Female', 'Other') OR gender IS NULL);
```

**Output:**
- Constraint created successfully.
- Invalid values such as 'UnknownValue' are blocked.

### 3.2 Queries based on Aggregate Functions

**Question 1:** Find total orders and total spending for each customer.

**SQL Statement:**

```sql
SELECT
    c.id,
    c.full_name,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.full_name
ORDER BY total_spent DESC;
```

**Output:**
- Displays customer-wise order count and spending.
- Customers without orders show 0 total_spent.

**Question 2:** Find average, minimum, and maximum product price category-wise.

**SQL Statement:**

```sql
SELECT
    category,
    ROUND(AVG(price), 2) AS avg_price,
    MIN(price) AS min_price,
    MAX(price) AS max_price
FROM products
GROUP BY category
ORDER BY avg_price DESC;
```

**Output:**
- One row per category with price distribution metrics.

**Question 3:** Show categories with at least 2 products using HAVING.

**SQL Statement:**

```sql
SELECT
    category,
    COUNT(*) AS product_count
FROM products
GROUP BY category
HAVING COUNT(*) >= 2
ORDER BY product_count DESC;
```

**Output:**
- Returns only categories satisfying the threshold.

### 3.3 Complex queries based on Sets

**Question 1:** List customers who either placed orders or have items in cart.

**SQL Statement:**

```sql
SELECT customer_id FROM orders
UNION
SELECT customer_id FROM cart_items;
```

**Output:**
- Unique customer IDs involved in either table.

**Question 2:** List customers who have both orders and wishlist entries.

**SQL Statement:**

```sql
SELECT customer_id FROM orders
INTERSECT
SELECT customer_id FROM wishlist_items;
```

**Output:**
- Customer IDs present in both result sets.

**Question 3:** List customers who have cart activity but no orders.

**SQL Statement:**

```sql
SELECT customer_id FROM cart_items
EXCEPT
SELECT customer_id FROM orders;
```

**Output:**
- Customer IDs requiring conversion follow-up.

### 3.4 Complex queries based on Subqueries

**Question 1:** Find products priced above their category average.

**SQL Statement:**

```sql
SELECT p.id, p.name, p.category, p.price
FROM products p
WHERE p.price > (
    SELECT AVG(p2.price)
    FROM products p2
    WHERE p2.category = p.category
)
ORDER BY p.category, p.price DESC;
```

**Output:**
- Returns premium-priced products category-wise.

**Question 2:** Find customers whose average order value is above overall average.

**SQL Statement:**

```sql
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
```

**Output:**
- Returns high-value customers relative to platform average.

**Question 3:** Find products never ordered.

**SQL Statement:**

```sql
SELECT p.id, p.name, p.category
FROM products p
WHERE p.id NOT IN (
    SELECT DISTINCT oi.product_id
    FROM order_items oi
    WHERE oi.product_id IS NOT NULL
);
```

**Output:**
- Returns inventory candidates for promotions.

### 3.5 Complex queries based on Joins

**Question 1:** Display customer, order, product, quantity, and line total.

**SQL Statement:**

```sql
SELECT
    c.full_name,
    o.id AS order_id,
    p.name AS product_name,
    oi.quantity,
    oi.total
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
ORDER BY o.created_at DESC;
```

**Output:**
- Detailed transactional join output for order analysis.

**Question 2:** Show each customer with default address details (if available).

**SQL Statement:**

```sql
SELECT
    c.id,
    c.full_name,
    a.label,
    a.city,
    a.state,
    a.pincode
FROM customers c
LEFT JOIN addresses a
    ON a.customer_id = c.id
   AND a.is_default = TRUE
ORDER BY c.id;
```

**Output:**
- Includes all customers; address columns are NULL when unavailable.

**Question 3:** Show cart item details with product information.

**SQL Statement:**

```sql
SELECT
    ci.customer_id,
    p.name AS product_name,
    p.category,
    ci.quantity,
    p.price,
    (ci.quantity * p.price) AS cart_line_value
FROM cart_items ci
JOIN products p ON p.id = ci.product_id
ORDER BY cart_line_value DESC;
```

**Output:**
- Returns enriched cart rows for cart value analysis.

### 3.6 Complex queries based on views

**Question 1:** Create a customer order summary view.

**SQL Statement:**

```sql
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
```

**Output:**
- View created successfully in schema.

**Question 2:** Display top spenders from the view.

**SQL Statement:**

```sql
SELECT *
FROM vw_customer_order_summary
ORDER BY total_spent DESC
LIMIT 5;
```

**Output:**
- Returns top 5 customers by total_spent.

**Question 3:** Show customers from the view with zero orders.

**SQL Statement:**

```sql
SELECT customer_id, full_name, email
FROM vw_customer_order_summary
WHERE total_orders = 0
ORDER BY full_name;
```

**Output:**
- Returns customer list for re-engagement campaigns.

### 3.7 Complex queries based on Triggers

**Question 1:** Create trigger function to validate and reduce stock before order item insert.

**SQL Statement:**

```sql
CREATE OR REPLACE FUNCTION fn_validate_and_reduce_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_stock INTEGER;
BEGIN
    SELECT stock INTO v_current_stock
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
```

**Output:**
- Trigger created successfully.

**Question 2:** Insert a valid order item and verify stock reduction.

**SQL Statement:**

```sql
INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total)
VALUES ('ORD-REVIEW2-DEMO-002', 1, 'Samsung Galaxy S23', 79999.00, 1, 79999.00);

SELECT id, name, stock
FROM products
WHERE id = 1;
```

**Output:**
- One row inserted in order_items.
- Product stock decreases by 1.

**Question 3:** Insert an invalid order item with quantity greater than stock.

**SQL Statement:**

```sql
INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total)
VALUES ('ORD-REVIEW2-DEMO-003', 1, 'Samsung Galaxy S23', 79999.00, 99999, 79999.00);
```

**Output:**
- Insert rejected with "Insufficient stock" exception.

### 3.7A Complex queries based on Procedures

**Question 1:** Create a procedure to apply category-wise discount with input validation.

**SQL Statement:**

```sql
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
```

**Output:**
- Procedure created successfully.

**Question 2:** Execute the procedure for Books category with 5% discount.

**SQL Statement:**

```sql
CALL sp_apply_category_discount('Books', 5);
```

**Output:**
- Matching products are updated with revised prices.

**Question 3:** Validate exception handling for invalid discount input.

**SQL Statement:**

```sql
CALL sp_apply_category_discount('Books', 150);
```

**Output:**
- Execution fails with validation exception for invalid percentage.

### 3.8 Complex queries based on Cursors

**Question 1:** Create cursor-based function to delete stale cart items.

**SQL Statement:**

```sql
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
        RAISE;
END;
$$;
```

**Output:**
- Function created successfully.

**Question 2:** Execute cursor function to remove stale rows older than 45 days.

**SQL Statement:**

```sql
SELECT fn_cleanup_stale_cart_items(45) AS deleted_rows;
```

**Output:**
- Returns integer count of deleted rows.

**Question 3:** Verify remaining cart rows.

**SQL Statement:**

```sql
SELECT COUNT(*) AS active_cart_rows
FROM cart_items;
```

**Output:**
- Displays current cart row count after cleanup.

### 3.9 Summary

Chapter 3 includes complex SQL implementation for all required sub-topics with minimum three question-query-output entries per section. The implementation covers constraints, aggregate functions, set operations, subqueries, joins, views, functions, procedures, triggers, cursors, and exception handling, and is aligned with Review 2 evaluation expectations.

