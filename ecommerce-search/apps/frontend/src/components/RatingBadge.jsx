export default function RatingBadge({ rating, count }) {
  const r = Number(rating || 0).toFixed(1);
  const c = Number(count || 0);
  return (
    <div className="rating">
      <span className="stars">★ {r}</span>
      <span className="count">({c})</span>
    </div>
  );
}
