const Product = require("../models/Product");
const index = require("./index.service");
const ranking = require("./ranking.service");

const store = new Map();

function generateId() {
  return `prod_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function addProduct(data) {
  const product = data instanceof Product ? data : Product.create(data);
  if (!product.id) product.id = generateId();
  store.set(product.id, product);
  index.updateIndexForProduct(product.toJSON());
  ranking.registerProducts([product.toJSON()]);
  return product.toJSON();
}

function updateProductMetadata(id, metadata = {}) {
  const product = store.get(id);
  if (!product) throw new Error("Product not found");
  const allowed = [
    "name",
    "description",
    "brand",
    "model",
    "category",
    "ram",
    "storage",
    "color",
    "screenSize",
  ];
  const partial = {};
  for (const key of allowed) {
    if (metadata[key] !== undefined) partial[key] = metadata[key];
  }
  product.update(partial);
  store.set(id, product);
  index.updateIndexForProduct(product.toJSON());
  return product.toJSON();
}

function getAllProducts() {
  return Array.from(store.values()).map((p) => p.toJSON());
}

function getProductById(id) {
  const p = store.get(String(id));
  return p ? p.toJSON() : null;
}

module.exports = {
  addProduct,
  updateProductMetadata,
  getAllProducts,
  getProductById,
};
