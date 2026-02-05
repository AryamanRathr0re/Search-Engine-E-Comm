const catalog = require('../services/catalog.service');
const Product = require('../models/Product');

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

async function addProduct(req, res, next) {
  try {
    const b = req.body || {};
    const requiredString = ['name', 'brand', 'category', 'currency', 'sku'];
    for (const k of requiredString) {
      if (!isNonEmptyString(b[k])) {
        const err = new Error(`Invalid ${k}`);
        err.status = 400;
        throw err;
      }
    }
    if (!isNumber(b.listPrice)) {
      const err = new Error('Invalid listPrice');
      err.status = 400;
      throw err;
    }
    if (b.discountPercent !== undefined && !isNumber(b.discountPercent)) {
      const err = new Error('Invalid discountPercent');
      err.status = 400;
      throw err;
    }
    if (!isNumber(b.stock)) {
      const err = new Error('Invalid stock');
      err.status = 400;
      throw err;
    }
    const product = new Product(b);
    const created = catalog.addProduct(product);
    res.status(201).json({ data: created });
  } catch (e) {
    next(e);
  }
}

async function updateProductMetaData(req, res, next) {
  try {
    const b = req.body || {};
    if (!isNonEmptyString(b.id)) {
      const err = new Error('Invalid id');
      err.status = 400;
      throw err;
    }
    const meta = b.metadata || {};
    const updated = catalog.updateProductMetadata(b.id, meta);
    res.status(200).json({ data: updated });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  addProduct,
  updateProductMetaData
};
