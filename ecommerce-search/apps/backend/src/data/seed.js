const catalog = require('../services/catalog.service');
const Product = require('../models/Product');

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}

function genRating() {
  const base = Math.random() * 1.5 + 3.2;
  return Math.min(4.9, Math.max(3.0, Number(base.toFixed(1))));
}

function genCount(scale = 5000) {
  return Math.floor(Math.pow(Math.random(), 0.3) * scale);
}

function genINR(min, max) {
  const step = 100;
  const val = rand(Math.floor(min / step), Math.floor(max / step)) * step;
  return val;
}

function genDates() {
  const now = Date.now();
  const days = rand(0, 180);
  const created = new Date(now - days * 86400000);
  const updated = new Date(created.getTime() + rand(0, 30) * 86400000);
  return { createdAt: created, updatedAt: updated };
}

function makePhone({ brand, model, variant, storage, color, basePrice }) {
  const listPrice = genINR(basePrice * 0.9, basePrice * 1.1);
  const discountPercent = rand(0, 20);
  const stock = rand(0, 120);
  const rating = genRating();
  const ratingCount = genCount(3000);
  const salesCount = genCount(15000);
  const sku = `${brand.slice(0,3).toUpperCase()}-${model.replace(/\\s+/g,'').toUpperCase()}-${(variant||'BASE').replace(/\\s+/g,'').toUpperCase()}-${storage}-${color.substring(0,3).toUpperCase()}`;
  const { createdAt, updatedAt } = genDates();
  return new Product({
    name: `${brand} ${model}${variant ? ' ' + variant : ''} ${storage}`,
    brand,
    model,
    description: `${brand} ${model} ${variant || ''} with ${storage} storage, ${color} color`,
    category: 'electronics',
    currency: 'INR',
    listPrice,
    discountPercent,
    sku,
    stock,
    averageRating: rating,
    ratingCount,
    salesCount,
    ram: variant && /ultra|pro/i.test(variant) ? '12 GB' : '8 GB',
    storage,
    color,
    screenSize: brand === 'Samsung' ? '6.8 in' : brand === 'Apple' ? '6.1 in' : '6.3 in',
    createdAt,
    updatedAt
  });
}

function makeAccessory({ type, brand, model, color }) {
  const name = `${brand} ${model} ${type}`;
  const listPrice = genINR(299, 4999);
  const discountPercent = rand(0, 35);
  const stock = rand(10, 500);
  const rating = genRating();
  const ratingCount = genCount(1500);
  const salesCount = genCount(10000);
  const sku = `${brand.slice(0,3).toUpperCase()}-${type.toUpperCase()}-${model.replace(/\\s+/g,'').toUpperCase()}-${color.substring(0,3).toUpperCase()}`;
  const { createdAt, updatedAt } = genDates();
  return new Product({
    name,
    brand,
    model,
    description: `${type} for ${model}, color ${color}`,
    category: 'electronics',
    currency: 'INR',
    listPrice,
    discountPercent,
    sku,
    stock,
    averageRating: rating,
    ratingCount,
    salesCount,
    ram: '',
    storage: '',
    color,
    screenSize: '',
    createdAt,
    updatedAt
  });
}

function generateProducts() {
  const items = [];
  const appleModels = ['iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15', 'iPhone 16'];
  const appleVariants = ['', 'Pro', 'Pro Max'];
  const samsungModels = ['Galaxy S21', 'Galaxy S22', 'Galaxy S23', 'Galaxy S24'];
  const samsungVariants = ['', 'Plus', 'Ultra'];
  const storages = ['128 GB', '256 GB', '512 GB'];
  const colors = ['Black', 'Blue', 'White', 'Red', 'Graphite', 'Midnight', 'Starlight', 'Obsidian'];

  for (const model of appleModels) {
    for (const variant of appleVariants) {
      for (const storage of storages) {
        for (const color of colors) {
          const basePrice = variant === 'Pro Max' ? 145000 : variant === 'Pro' ? 125000 : 85000;
          items.push(makePhone({ brand: 'Apple', model, variant, storage, color, basePrice }));
        }
      }
    }
  }

  for (const model of samsungModels) {
    for (const variant of samsungVariants) {
      for (const storage of storages) {
        for (const color of colors) {
          const basePrice = variant === 'Ultra' ? 135000 : variant === 'Plus' ? 95000 : 65000;
          items.push(makePhone({ brand: 'Samsung', model, variant, storage, color, basePrice }));
        }
      }
    }
  }

  const accessoryBrands = ['Spigen', 'Boat', 'Anker', 'Apple', 'Samsung'];
  const accessoryTypes = ['Case', 'Charger', 'Earphones', 'Screen Protector', 'Power Bank'];
  const accessoryFor = [...appleModels, ...samsungModels];
  for (let i = 0; i < 400; i++) {
    items.push(
      makeAccessory({
        type: pick(accessoryTypes),
        brand: pick(accessoryBrands),
        model: pick(accessoryFor),
        color: pick(colors)
      })
    );
  }

  return items;
}

function seedCatalog() {
  const existing = catalog.getAllProducts();
  if (existing.length >= 500) return { seeded: 0, skipped: true };
  const products = generateProducts();
  let seeded = 0;
  for (const p of products) {
    catalog.addProduct(p);
    seeded++;
  }
  return { seeded, skipped: false };
}

module.exports = {
  seedCatalog
};
