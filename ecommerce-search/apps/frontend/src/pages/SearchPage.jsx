import { useState } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const hasQuery = query.trim().length > 0;
  const isEmpty = hasQuery && !loading && results.length === 0;

  return (
    <div>
      <SearchBar
        initialQuery={query}
        onQueryChange={setQuery}
        onResults={setResults}
        onLoading={setLoading}
      />
      {loading && <p className="muted">Loading...</p>}
      {isEmpty && <p className="muted">No results found</p>}
      {!hasQuery && !loading && results.length === 0 && (
        <p className="muted">Start typing to search products</p>
      )}
      <ul className="results">
        {results.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
