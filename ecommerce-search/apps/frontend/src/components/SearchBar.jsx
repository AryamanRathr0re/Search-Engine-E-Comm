import { useEffect, useRef, useState } from "react";
import api from "../utils/api";

export default function SearchBar({
  onResults,
  onLoading,
  initialQuery = "",
  onQueryChange,
}) {
  const [value, setValue] = useState(initialQuery);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  async function performSearch(q) {
    if (!q || !q.trim()) {
      onResults?.([]);
      return;
    }
    onLoading?.(true);
    setError(null);
    try {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();
      const { data } = await api.get("/search/product", {
        params: { query: q },
        signal: abortRef.current.signal,
      });
      onResults?.(data.data || []);
    } catch (e) {
      if (e.name !== "CanceledError" && e.name !== "AbortError") {
        setError("Search failed");
      }
    } finally {
      onLoading?.(false);
    }
  }

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      performSearch(value);
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value]);

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (timerRef.current) clearTimeout(timerRef.current);
      performSearch(value);
    }
  }

  return (
    <div className="search">
      <input
        type="text"
        placeholder="Search products"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          setValue(v);
          onQueryChange?.(v);
        }}
        onKeyDown={onKeyDown}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
