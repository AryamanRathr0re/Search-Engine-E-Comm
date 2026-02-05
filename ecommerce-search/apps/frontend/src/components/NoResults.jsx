export default function NoResults({ examples, onExampleClick, onSuggestionClick }) {
  const items =
    Array.isArray(examples) && examples.length > 0
      ? examples
      : [
          "iPhone 16",
          "Sasta iPhone",
          "Samsung phone under 20000",
          "iPhone cover",
          "iPhone red color",
        ];

  return (
    <div className="no-results">
      <h2>Product not found</h2>
      <p className="muted">Try searching for something else</p>
      <div className="chips">
        {items.map((q, i) => (
          <button
            key={i}
            className="chip"
            type="button"
            onClick={() => (onSuggestionClick ?? onExampleClick)?.(q)}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
