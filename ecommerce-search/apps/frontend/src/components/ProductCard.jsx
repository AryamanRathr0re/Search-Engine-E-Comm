import React from 'react';

function formatCurrency(value, currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(Number(value || 0));
  } catch {
    return `₹${Number(value || 0).toFixed(0)}`;
  }
}

export default function ProductCard({ product }) {
  const {
    name,
    brand,
    color,
    storage,
    ram,
    screenSize,
    listPrice,
    salePrice,
    price,
    currency,
    averageRating,
    ratingCount,
    stock
  } = product || {};

  const current = salePrice ?? price ?? 0;
  const mrp = listPrice ?? current;
  const discountPercent = mrp > 0 ? Math.round(((mrp - current) / mrp) * 100) : 0;
  const inStock = Number(stock || 0) > 0;
  const isBestDeal = discountPercent >= 20;

  return (
    <div className={`product-card${isBestDeal ? ' best-deal' : ''}`}>
      {isBestDeal && <span className="badge">Best Deal</span>}
      <div className="title">{name}</div>
      <div className="price-row">
        <span className="price">{formatCurrency(current, currency)}</span>
        {mrp > current && <span className="mrp">{formatCurrency(mrp, currency)}</span>}
        {discountPercent > 0 && <span className="discount">-{discountPercent}%</span>}
      </div>
      <div className="rating">
        <span className="stars">★ {Number(averageRating || 0).toFixed(1)}</span>
        <span className="count">({Number(ratingCount || 0)})</span>
      </div>
      <div className="meta">
        {brand && <span>{brand}</span>}
        {color && <span>{color}</span>}
        {storage && <span>{storage}</span>}
        {ram && <span>{ram}</span>}
        {screenSize && <span>{screenSize}</span>}
      </div>
      <div className={`stock ${inStock ? 'in' : 'out'}`}>{inStock ? 'In stock' : 'Out of stock'}</div>
    </div>
  );
}
