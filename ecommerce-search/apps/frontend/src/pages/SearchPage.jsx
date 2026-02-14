import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import NoResults from "../components/NoResults.jsx";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNoResults, setIsNoResults] = useState(false);
  const [onlyBest, setOnlyBest] = useState(false);

  const hasQuery = query.trim().length > 0;
  const visibleResults = onlyBest
    ? results.filter((p) => {
        const current = Number(p.salePrice ?? p.price ?? 0);
        const mrp = Number(p.listPrice ?? current);
        const discountPercent =
          mrp > 0 ? Math.round(((mrp - current) / mrp) * 100) : 0;
        return discountPercent >= 20;
      })
    : results;

  useEffect(() => {
    const none = hasQuery && !loading && visibleResults.length === 0;
    setIsNoResults(none);
  }, [hasQuery, loading, results, onlyBest]);

  function handleSearch(q) {
    setQuery(q);
  }

  return (
    <div className="container">
      <SearchBar
        initialQuery={query}
        onQueryChange={setQuery}
        onResults={setResults}
        onLoading={setLoading}
      />
      <div className="filters">
        <button
          className={`button${onlyBest ? " primary" : ""}`}
          onClick={() => setOnlyBest((v) => !v)}
          aria-pressed={onlyBest}
        >
          {onlyBest ? "Showing Best Deals" : "Show Best Deals Only"}
        </button>
      </div>
      {loading && (
        <div className="loading-banner" role="status" aria-live="polite">
          <span className="loader" />
          <span className="loading-text">
            Fetching results — please be patient
          </span>
        </div>
      )}
      {isNoResults && !loading && (
        <NoResults onSuggestionClick={handleSearch} />
      )}
      {!hasQuery && !loading && results.length === 0 && (
        <p className="muted">Start typing to search products</p>
      )}
      {!loading && visibleResults.length > 0 && (
        <ul className="results">
          {visibleResults.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
