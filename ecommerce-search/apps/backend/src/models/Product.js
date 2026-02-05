// Product entity for an ecommerce electronics catalog
// Comments explain why each field exists for search, merchandising, and analytics

class Product {
  constructor(data = {}) {
    const now = new Date();

    // Identity and display
    this.id = data.id || null; // Unique identifier used across inventory, orders, and analytics
    this.name = data.name || ''; // Human-readable product title for listings and search results
    this.description = data.description || ''; // Details shown on PDP and used by search indexing
    this.brand = data.brand || ''; // Brand improves filtering, facets, and relevance scoring
    this.model = data.model || ''; // Model helps users refine within a brand and supports exact matches
    this.category = data.category || 'electronics'; // Category enables faceted navigation and merchandising rules

    // Pricing
    this.currency = data.currency || 'USD'; // ISO currency code for display, totals, and multi-region support
    this.listPrice = Number(data.listPrice ?? 0); // MSRP or original price for anchoring discounts
    this.discountPercent = Product.#clamp(Number(data.discountPercent ?? 0), 0, 100); // Normalized discount for promotions
    // salePrice computed to avoid divergent pricing and to support consistent cart totals
    const computedSale = Product.#computeSalePrice(this.listPrice, this.discountPercent);
    this.salePrice = Number(
      data.salePrice !== undefined ? data.salePrice : computedSale
    ); // Current sell price after discount; source of truth for checkout
    this.price = this.salePrice; // Convenience alias used by UI components and sorting logic

    // Inventory
    this.sku = data.sku || ''; // Stock keeping unit for internal tracking and fulfillment
    this.stock = Math.max(0, Number(data.stock ?? 0)); // Units available for purchase; enables OOS logic
    this.isAvailable = this.stock > 0; // Quick flag for listing visibility and add-to-cart enablement

    // Ratings & sales
    this.averageRating = Product.#clamp(Number(data.averageRating ?? 0), 0, 5); // Aggregated user rating for ranking and UX
    this.ratingCount = Math.max(0, Number(data.ratingCount ?? 0)); // Number of ratings for confidence measure and sorting
    this.salesCount = Math.max(0, Number(data.salesCount ?? 0)); // Lifetime sales for popularity ranking and analytics

    // Electronics-specific metadata
    this.ram = data.ram || ''; // RAM capacity (e.g., '8 GB') used in filters and comparisons
    this.storage = data.storage || ''; // Storage capacity (e.g., '128 GB') for spec filtering and PDP
    this.color = data.color || ''; // Color variant for SKU differentiation and variant selection UI
    this.screenSize = data.screenSize || ''; // Screen size (e.g., '6.7 in' or '15.6 in') used in filters and PDP

    // Timestamps
    this.createdAt = data.createdAt ? new Date(data.createdAt) : now; // Record creation moment for auditing
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : now; // Last update time for cache invalidation and sync
  }

  // Update selective fields and refresh timestamp; useful before persistence or cache updates
  update(partial = {}) {
    const fields = [
      'name',
      'description',
      'brand',
      'model',
      'category',
      'currency',
      'listPrice',
      'discountPercent',
      'salePrice',
      'sku',
      'stock',
      'averageRating',
      'ratingCount',
      'salesCount',
      'ram',
      'storage',
      'color',
      'screenSize'
    ];
    for (const key of fields) {
      if (partial[key] !== undefined) {
        this[key] = partial[key];
      }
    }
    // Keep derived fields consistent
    this.discountPercent = Product.#clamp(Number(this.discountPercent ?? 0), 0, 100); // Normalize after updates
    this.listPrice = Number(this.listPrice ?? 0); // Ensure numeric for pricing math
    this.salePrice =
      this.salePrice !== undefined
        ? Number(this.salePrice)
        : Product.#computeSalePrice(this.listPrice, this.discountPercent); // Recompute when needed
    this.price = this.salePrice; // Maintain alias consistency
    this.stock = Math.max(0, Number(this.stock ?? 0)); // Avoid negative stock
    this.isAvailable = this.stock > 0; // Reflect inventory state
    this.averageRating = Product.#clamp(Number(this.averageRating ?? 0), 0, 5); // Keep within scale
    this.ratingCount = Math.max(0, Number(this.ratingCount ?? 0)); // Prevent negatives
    this.salesCount = Math.max(0, Number(this.salesCount ?? 0)); // Prevent negatives

    this.updatedAt = new Date(); // Timestamp refresh to support cache invalidation
  }

  // Serialize to plain object for API responses or storage
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      brand: this.brand,
      model: this.model,
      category: this.category,
      currency: this.currency,
      listPrice: this.listPrice,
      discountPercent: this.discountPercent,
      salePrice: this.salePrice,
      price: this.price,
      sku: this.sku,
      stock: this.stock,
      isAvailable: this.isAvailable,
      averageRating: this.averageRating,
      ratingCount: this.ratingCount,
      salesCount: this.salesCount,
      ram: this.ram,
      storage: this.storage,
      color: this.color,
      screenSize: this.screenSize,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Helper to compute sale price from list price and discount
  static #computeSalePrice(listPrice, discountPercent) {
    const lp = Number(listPrice ?? 0);
    const dp = Product.#clamp(Number(discountPercent ?? 0), 0, 100);
    const discount = lp * (dp / 100);
    return Math.max(0, lp - discount);
  }

  // Clamp numeric values to a range
  static #clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  // Factory for consistent instantiation
  static create(data) {
    return new Product(data);
  }
}

module.exports = Product;
