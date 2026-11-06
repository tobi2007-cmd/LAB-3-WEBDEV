require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  { name: 'Wireless Mouse', sku: 'ELEC-MS-101', category: 'Electronics', price: 799, quantity: 45, reorderLevel: 10, supplier: 'Logitech India' },
  { name: 'Bluetooth Speaker', sku: 'ELEC-SP-204', category: 'Electronics', price: 2499, quantity: 25, reorderLevel: 8, supplier: 'boAt Lifestyle' },
  { name: 'Mechanical Keyboard', sku: 'ELEC-KB-318', category: 'Electronics', price: 4299, quantity: 6, reorderLevel: 8, supplier: 'Redragon' },
  { name: '27-inch Monitor', sku: 'ELEC-MN-427', category: 'Electronics', price: 14999, quantity: 20, reorderLevel: 5, supplier: 'Dell India' },
  { name: 'Cotton T-Shirt', sku: 'APRL-TS-501', category: 'Apparel', price: 799, quantity: 67, reorderLevel: 20, supplier: 'Jockey' },
  { name: 'Denim Jacket', sku: 'APRL-JK-512', category: 'Apparel', price: 1999, quantity: 11, reorderLevel: 5, supplier: "Levi's" },
  { name: 'Study Table', sku: 'FURN-TB-812', category: 'Furniture', price: 3999, quantity: 2, reorderLevel: 4, supplier: 'IKEA India' },
  { name: 'Ergonomic Chair', sku: 'FURN-CH-815', category: 'Furniture', price: 6499, quantity: 9, reorderLevel: 3, supplier: 'Green Soul' },
  { name: 'A4 Notebook (Pack of 5)', sku: 'STNY-NB-701', category: 'Stationery', price: 250, quantity: 120, reorderLevel: 30, supplier: 'Classmate' },
  { name: 'Whiteboard Markers', sku: 'STNY-MK-709', category: 'Stationery', price: 180, quantity: 12, reorderLevel: 15, supplier: 'Camlin' },
  { name: 'Yoga Mat', sku: 'SPRT-YM-901', category: 'Sports', price: 899, quantity: 30, reorderLevel: 10, supplier: 'Decathlon' },
  { name: 'Cricket Bat', sku: 'SPRT-CB-906', category: 'Sports', price: 2199, quantity: 4, reorderLevel: 5, supplier: 'SG Sports' },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.syncIndexes();
    const created = await Product.insertMany(products);
    console.log(`Seeded ${created.length} products`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
