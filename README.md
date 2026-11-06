# LAB-3-WEBDEV

Inventory and Data Management System - Assignment 3 (Web Dev III)

Built with Node.js, Express, MongoDB, Mongoose and dotenv.

## How to run

```
npm install
cp .env.example .env
npm run seed
npm run dev
```

Server runs on http://localhost:5000

## API

| Method | Route | Description |
|---|---|---|
| POST | /api/products | add a product |
| GET | /api/products | get all products (filter, sort, pagination) |
| GET | /api/products/:id | get one product |
| PUT | /api/products/:id | update product |
| PATCH | /api/products/:id/stock | restock or sell, body `{ "change": 10 }` |
| DELETE | /api/products/:id | delete product |
| GET | /api/products/low-stock | products with quantity <= reorderLevel |
| GET | /api/products/summary | category wise summary (aggregation) |

Query params for GET /api/products: `category`, `supplier`, `search`, `minPrice`, `maxPrice`, `minQty`, `maxQty`, `inStock`, `sort` (eg `-price`), `page`, `limit`

Example: `/api/products?category=Electronics&sort=-price&page=1&limit=5`

### Sample body for POST

```json
{
  "name": "Gel Pen Pack of 15",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 40,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```
