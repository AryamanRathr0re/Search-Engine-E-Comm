function formatCurrency(value, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(Number(value || 0));
  } catch {
    return `₹${Number(value || 0).toFixed(0)}`;
  }
}

export default function PriceBlock({ price, mrp, currency }) {
  const current = Number(price || 0);
  const list = Number(mrp || current);
  const showMrp = list > current;
  const discountPercent = showMrp ? Math.round(((list - current) / list) * 100) : 0;
  return (
    <div className="details-price">
      <span className="price">{formatCurrency(current, currency)}</span>
      {showMrp && <span className="mrp">{formatCurrency(list, currency)}</span>}
      {discountPercent > 0 && <span className="discount">-{discountPercent}%</span>}
    </div>
  );
}
