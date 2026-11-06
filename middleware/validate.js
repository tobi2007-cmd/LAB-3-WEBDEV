const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ApiError(400, `Invalid product id: ${req.params.id}`));
  }
  next();
};

const validateProductBody = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length === 0) {
    return next(new ApiError(400, 'Request body must be a non-empty JSON object'));
  }
  const numeric = ['price', 'quantity', 'reorderLevel'];
  const bad = numeric.filter((f) => f in req.body && typeof req.body[f] !== 'number');
  if (bad.length) {
    return next(new ApiError(400, `These fields must be numbers: ${bad.join(', ')}`));
  }
  next();
};

const validateStockChange = (req, res, next) => {
  const { change } = req.body || {};
  if (typeof change !== 'number' || !Number.isInteger(change) || change === 0) {
    return next(new ApiError(400, '"change" must be a non-zero integer (positive = restock, negative = sale)'));
  }
  next();
};

module.exports = { validateObjectId, validateProductBody, validateStockChange };
