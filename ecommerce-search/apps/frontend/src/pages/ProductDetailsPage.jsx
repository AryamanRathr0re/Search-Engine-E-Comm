import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import PriceBlock from "../components/PriceBlock.jsx";
import RatingBadge from "../components/RatingBadge.jsx";
import MetaTable from "../components/MetaTable.jsx";

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/product/${productId}`);
        if (!ignore) setProduct(data.data || null);
      } catch {
        if (!ignore) setError("Failed to load product");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, [productId]);

  if (loading) return <p className="muted">Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!product) return <p className="muted">Product not found</p>;

  const stock = Number(product.stock || 0);
  const lowStock = stock > 0 && stock < 5;
  const outOfStock = stock <= 0 || product.isAvailable === false;
  const features = [
    product.ram,
    product.storage,
    product.color,
    product.screenSize,
  ].filter(Boolean);

  return (
    <div className="details">
      <div>
        <div className="details-header">
          <div className="details-title">{product.name}</div>
          <RatingBadge
            rating={product.averageRating}
            count={product.ratingCount}
          />
        </div>
        <PriceBlock
          price={product.salePrice ?? product.price}
          mrp={product.listPrice}
          currency={product.currency}
        />
        {lowStock && <div className="warning">Only {stock} left</div>}
        <div className="chips">
          {features.map((f, i) => (
            <span key={i} className="chip">
              {f}
            </span>
          ))}
        </div>
        <div className="actions">
          <button className={`button`} onClick={() => navigate(-1)}>
            Back
          </button>
          <button className={`button primary`} disabled={outOfStock}>
            Buy Now
          </button>
        </div>
        <div className={`stock-badge ${product.isAvailable ? "in" : "out"}`}>
          {product.isAvailable ? "In stock" : "Out of stock"}
        </div>
        <div className="details-section">
          <MetaTable
            rows={[
              { label: "Brand", value: product.brand },
              { label: "Model", value: product.model },
              { label: "RAM", value: product.ram },
              { label: "Storage", value: product.storage },
              { label: "Color", value: product.color },
              { label: "Screen Size", value: product.screenSize },
              { label: "SKU", value: product.sku },
            ]}
          />
        </div>
      </div>
      <div>
        <div className="details-section">
          <div className="details-title">Description</div>
          <p className="muted">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
