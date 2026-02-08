# FlowCommerce Database - Entity Relationship Diagram

## Database Schema Overview

This document contains the complete Entity Relationship Diagram (ERD) for the FlowCommerce eCommerce platform database in **Chen Notation** (traditional ER diagram style).

## Traditional ER Diagram (Chen Notation)

### How to Create in Draw.io (Recommended - Free)

1. **Open Draw.io**
   - Visit https://app.diagrams.net/
   - Click "Create New Diagram"

2. **Draw Entities (Rectangles)**
   - Use Rectangle tool for each entity:
     - CUSTOMERS
     - PRODUCTS
     - CATEGORIES
     - ORDERS
     - ORDER_ITEMS
     - ADDRESSES
     - CART_ITEMS
     - WISHLIST_ITEMS

3. **Draw Attributes (Ellipses/Ovals)**
   - Use Ellipse tool for each attribute
   - Connect to entity with lines
   - **Underline primary keys**

4. **Draw Relationships (Diamonds)**
   - Use Diamond shape between entities
   - Label: "has", "places", "contains", "categorizes"

5. **Add Cardinality**
   - Mark 1, N, or M on relationship lines

### Quick Draw.io Template Structure

```
┌─────────────┐
│  CUSTOMERS  │ (Rectangle)
└─────────────┘
      │
   (  id  )  ← Primary Key (underlined ellipse)
   ( name )  ← Attribute (ellipse)
   (email )
      │
   ◇─────◇   ← "places" relationship (diamond)
      │
┌─────────────┐
│   ORDERS    │ (Rectangle)
└─────────────┘
```

## Complete Entity Details for Drawing

### 1. CUSTOMERS Entity
**Attributes (draw as ellipses):**
- **id** (Primary Key - underline)
- full_name
- email (mark as UNIQUE)
- password_hash
- phone
- address
- city
- state
- pincode
- country
- avatar
- is_admin
- created_at
- updated_at

### 2. PRODUCTS Entity
**Attributes:**
- **id** (Primary Key)
- name
- description
- price
- category
- stock
- image
- rating
- discount_percentage
- brand
- created_at

### 3. CATEGORIES Entity
**Attributes:**
- **id** (Primary Key)
- name (UNIQUE)
- slug (UNIQUE)
- image
- product_count
- created_at

### 4. ORDERS Entity
**Attributes:**
- **id** (Primary Key)
- customer_id (Foreign Key)
- customer_email
- items
- subtotal
- shipping
- tax
- discount
- total
- status
- payment_method
- payment_status
- shipping_name
- shipping_email
- shipping_phone
- shipping_address
- shipping_city
- shipping_pincode
- notes
- created_at
- updated_at

### 5. ORDER_ITEMS Entity
**Attributes:**
- **id** (Primary Key)
- order_id (Foreign Key)
- product_id (Foreign Key)
- product_name
- product_image
- price
- quantity
- total
- created_at

### 6. ADDRESSES Entity
**Attributes:**
- **id** (Primary Key)
- customer_id (Foreign Key)
- label
- full_address
- city
- state
- pincode
- country
- is_default
- created_at

### 7. CART_ITEMS Entity
**Attributes:**
- **id** (Primary Key)
- customer_id (Foreign Key)
- product_id (Foreign Key)
- quantity
- created_at

### 8. WISHLIST_ITEMS Entity
**Attributes:**
- **id** (Primary Key)
- customer_id (Foreign Key)
- product_id (Foreign Key)
- created_at

## Relationships (Draw as Diamonds)

### Relationship 1: CUSTOMERS "has" ADDRESSES
- **Diamond Label**: "has"
- **Cardinality**: 1:N (One customer has many addresses)
- Connect CUSTOMERS → "has" → ADDRESSES

### Relationship 2: CUSTOMERS "has" CART_ITEMS
- **Diamond Label**: "has_cart"
- **Cardinality**: 1:N
- Connect CUSTOMERS → "has_cart" → CART_ITEMS

### Relationship 3: CUSTOMERS "has" WISHLIST_ITEMS
- **Diamond Label**: "has_wishlist"
- **Cardinality**: 1:N
- Connect CUSTOMERS → "has_wishlist" → WISHLIST_ITEMS

### Relationship 4: CUSTOMERS "places" ORDERS
- **Diamond Label**: "places"
- **Cardinality**: 1:N (One customer places many orders)
- Connect CUSTOMERS → "places" → ORDERS

### Relationship 5: ORDERS "contains" ORDER_ITEMS
- **Diamond Label**: "contains"
- **Cardinality**: 1:N (One order contains many items)
- Connect ORDERS → "contains" → ORDER_ITEMS

### Relationship 6: PRODUCTS "in" CART_ITEMS
- **Diamond Label**: "in_cart"
- **Cardinality**: 1:N (One product in many carts)
- Connect PRODUCTS → "in_cart" → CART_ITEMS

### Relationship 7: PRODUCTS "in" WISHLIST_ITEMS
- **Diamond Label**: "in_wishlist"
- **Cardinality**: 1:N
- Connect PRODUCTS → "in_wishlist" → WISHLIST_ITEMS

### Relationship 8: PRODUCTS "in" ORDER_ITEMS
- **Diamond Label**: "ordered_as"
- **Cardinality**: 1:N
- Connect PRODUCTS → "ordered_as" → ORDER_ITEMS

### Relationship 9: CATEGORIES "categorizes" PRODUCTS
- **Diamond Label**: "categorizes"
- **Cardinality**: 1:N (One category has many products)
- Connect CATEGORIES → "categorizes" → PRODUCTS

## Alternative Tools for Chen Notation

1. **ERDPlus** (https://erdplus.com/)
   - Specifically designed for ER diagrams
   - Chen notation built-in
   - Free and easy to use

2. **Lucidchart** (https://www.lucidchart.com/)
   - Professional tool
   - ER diagram templates available
   - Free tier available

3. **Visual Paradigm Online** (https://online.visual-paradigm.com/)
   - Professional ER diagram tool
   - Chen notation support
   - Free community edition

4. **Creately** (https://creately.com/)
   - ER diagram templates
   - Chen notation shapes

## Recommended Layout

```
          CATEGORIES
              |
         [categorizes]
              |
          PRODUCTS ─────[in_cart]───── CART_ITEMS ──── CUSTOMERS
              |                             |              |
         [ordered_as]                  [has_cart]    [has_wishlist]
              |                             |              |
        ORDER_ITEMS                    WISHLIST_ITEMS ─────┘
              |                                            |
         [contains]                                   [has]
              |                                            |
           ORDERS ────────────[places]───────────────────┘
              |
        [shipped_to]
              |
          ADDRESSES
```

## Drawing Tips

1. **Keep it organized**: Place related entities close together
2. **Use colors**: Different colors for different entity types
3. **Label everything**: Clear relationship names
4. **Show cardinality**: Mark 1, N, M on relationship lines
5. **Underline PKs**: Primary keys should be underlined
6. **Use dotted lines**: For weak entities (if any)

## Export Options

- **PDF**: For printing and documentation
- **PNG/JPG**: For presentations
- **SVG**: For scalable graphics
- **Draw.io XML**: To save and edit later

## Relationships Summary

| From | To | Type | Description |
|------|-----|------|-------------|
| CUSTOMERS | ADDRESSES | One-to-Many | A customer can have multiple addresses |
| CUSTOMERS | CART_ITEMS | One-to-Many | A customer can have multiple cart items |
| CUSTOMERS | WISHLIST_ITEMS | One-to-Many | A customer can have multiple wishlist items |
| CUSTOMERS | ORDERS | One-to-Many | A customer can place multiple orders |
| ORDERS | ORDER_ITEMS | One-to-Many | An order contains multiple items |
| PRODUCTS | CART_ITEMS | One-to-Many | A product can be in multiple carts |
| PRODUCTS | WISHLIST_ITEMS | One-to-Many | A product can be in multiple wishlists |
| PRODUCTS | ORDER_ITEMS | One-to-Many | A product can appear in multiple orders |
| CATEGORIES | PRODUCTS | One-to-Many | A category contains multiple products |

## Key Features

- **Referential Integrity**: Foreign keys maintain data consistency
- **Cascade Deletes**: Deleting a customer removes their cart/wishlist
- **Unique Constraints**: Email, category names are unique
- **Timestamps**: All tables track creation time
- **Flexible Schema**: JSONB for complex order items storage

## How to View This Diagram

### Option 1: VS Code Extension
1. Install "Markdown Preview Mermaid Support" extension
2. Open this file and press `Ctrl+Shift+V` for preview

### Option 2: GitHub
- Upload this file to GitHub - diagrams render automatically

### Option 3: Online Mermaid Editor
1. Visit https://mermaid.live/
2. Copy the mermaid code block
3. Paste and view/export as PNG/SVG

### Option 4: Draw.io / Lucidchart
- Import this structure or manually recreate
- Export as professional diagram

## Database Statistics

- **Total Tables**: 8
- **Core Entities**: 3 (Customers, Products, Categories)
- **Transaction Tables**: 2 (Orders, Order_Items)
- **Association Tables**: 3 (Addresses, Cart_Items, Wishlist_Items)
- **Foreign Keys**: 9 relationships

---

**Last Updated**: February 7, 2026
**Database**: Supabase PostgreSQL
**Project**: FlowCommerce eCommerce Platform
