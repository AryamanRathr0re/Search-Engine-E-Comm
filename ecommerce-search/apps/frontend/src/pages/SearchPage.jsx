import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import NoResults from "../components/NoResults.jsx";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNoResults, setIsNoResults] = useState(false);

  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    const none = hasQuery && !loading && results.length === 0;
    setIsNoResults(none);
  }, [hasQuery, loading, results]);

  function handleSearch(q) {
    setQuery(q);
  }

  return (
    <div>
      <SearchBar
        initialQuery={query}
        onQueryChange={setQuery}
        onResults={setResults}
        onLoading={setLoading}
      />
      {loading && <p className="muted">Loading...</p>}
      {isNoResults && !loading && <NoResults onSuggestionClick={handleSearch} />}
      {!hasQuery && !loading && results.length === 0 && (
        <p className="muted">Start typing to search products</p>
      )}
      {!loading && results.length > 0 && (
        <ul className="results">
          {results.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
