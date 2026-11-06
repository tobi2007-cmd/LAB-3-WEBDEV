const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SORTABLE = ['name', 'sku', 'category', 'price', 'quantity', 'reorderLevel', 'supplier', 'createdAt', 'updatedAt'];
const UPDATABLE = ['name', 'sku', 'category', 'price', 'quantity', 'reorderLevel', 'supplier'];

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

const getProducts = asyncHandler(async (req, res) => {
  const { category, supplier, search, minPrice, maxPrice, minQty, maxQty, inStock, sort } = req.query;

  const filter = {};
  if (category) filter.category = { $in: category.split(',').map((c) => c.trim()) };
  if (supplier) filter.supplier = new RegExp(escapeRegex(supplier), 'i');
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { sku: rx }];
  }

  const range = (min, max, label) => {
    const r = {};
    if (min !== undefined) {
      if (isNaN(min)) throw new ApiError(400, `min${label} must be a number`);
      r.$gte = Number(min);
    }
    if (max !== undefined) {
      if (isNaN(max)) throw new ApiError(400, `max${label} must be a number`);
      r.$lte = Number(max);
    }
    return Object.keys(r).length ? r : null;
  };
  const priceRange = range(minPrice, maxPrice, 'Price');
  if (priceRange) filter.price = priceRange;
  const qtyRange = range(minQty, maxQty, 'Qty');
  if (qtyRange) filter.quantity = qtyRange;
  if (inStock === 'true') filter.quantity = { ...(filter.quantity || {}), $gt: 0 };
  if (inStock === 'false') filter.quantity = 0;

  let sortBy = { createdAt: -1 };
  if (sort) {
    sortBy = {};
    for (const raw of sort.split(',')) {
      const field = raw.trim().replace(/^-/, '');
      if (!SORTABLE.includes(field)) throw new ApiError(400, `Cannot sort by "${field}". Allowed: ${SORTABLE.join(', ')}`);
      sortBy[field] = raw.trim().startsWith('-') ? -1 : 1;
    }
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort(sortBy).skip(skip).limit(limit),
  ]);

  res.json({
    total,
    page,
    totalPages: Math.ceil(total / limit),
    count: products.length,
    products,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const updates = {};
  for (const key of UPDATABLE) if (key in req.body) updates[key] = req.body[key];
  if (!Object.keys(updates).length) throw new ApiError(400, `Provide at least one of: ${UPDATABLE.join(', ')}`);

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
    context: 'query',
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json(product);
});

const adjustStock = asyncHandler(async (req, res) => {
  const { change } = req.body;
  const query = { _id: req.params.id };
  if (change < 0) query.quantity = { $gte: -change };

  const product = await Product.findOneAndUpdate(query, { $inc: { quantity: change } }, { new: true });

  if (!product) {
    const existing = await Product.findById(req.params.id);
    if (!existing) throw new ApiError(404, 'Product not found');
    throw new ApiError(400, `Insufficient stock: only ${existing.quantity} unit(s) available, cannot remove ${-change}`);
  }

  res.json({ message: 'Stock updated', product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ message: 'Product deleted', id: product.id });
});

const getLowStock = asyncHandler(async (req, res) => {
  const lowStockItems = await Product.find({ $expr: { $lte: ['$quantity', '$reorderLevel'] } }).sort({ quantity: 1 });
  res.json({ count: lowStockItems.length, lowStockItems });
});

const getCategorySummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        avgPrice: { $avg: '$price' },
      },
    },
    { $addFields: { avgPrice: { $round: ['$avgPrice', 2] } } },
    { $sort: { totalStockValue: -1 } },
  ]);

  res.json({ categories: summary.length, summary });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  adjustStock,
  deleteProduct,
  getLowStock,
  getCategorySummary,
};
