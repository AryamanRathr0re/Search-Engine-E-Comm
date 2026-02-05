# Ecommerce Search — Full-Stack Demo (India Market Focus)

## Problem Statement
- Build an end-to-end ecommerce search experience optimized for Indian market terminology and price sensitivity.
- Parse noisy queries (spelling mistakes, Hinglish terms), infer user intent (price, storage, color, model), and return relevant products quickly.
- Achieve sub-1000ms latency for typical queries with a catalog of 1000+ items.

## Architecture
- Backend (Node.js + Express) in [apps/backend](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/backend):
  - Request routing: [app.js](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/backend/src/app.js), [server.js](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/backend/src/server.js)
  - Search controller: [search.controller.js](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/backend/src/controllers/search.controller.js)
  - Product APIs: [product.controller.js](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/backend/src/controllers/product.controller.js)
  - NLP intent extraction: [nlp.service.js](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/backend/src/services/nlp.service.js)
  - Ranking engine: [ranking.service.js](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/backend/src/services/ranking.service.js)
  - Inverted index: [index.service.js](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/backend/src/services/index.service.js)
  - Query cache (TTL LRU): [cache.service.js](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/backend/src/services/cache.service.js)
  - Catalog (in-memory): [catalog.service.js](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/backend/src/services/catalog.service.js)
  - Seed data: [seed.js](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/backend/src/data/seed.js)
- Frontend (React + Vite) in [apps/frontend](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/frontend):
  - Search page: [SearchPage.jsx](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/frontend/src/pages/SearchPage.jsx)
  - Search bar (debounce + enter): [SearchBar.jsx](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/frontend/src/components/SearchBar.jsx)
  - Product card (deal highlighting): [ProductCard.jsx](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/frontend/src/components/ProductCard.jsx)
  - API client (Axios): [api.js](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/frontend/src/utils/api.js)
  - Vite dev proxy to backend: [vite.config.js](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/frontend/vite.config.js)

## Ranking Logic
- Objective: Balance relevance, quality, popularity, price intent, and availability, while keeping scoring efficient.
- Components:
  - Text relevance (0.40): token matches across name, brand, model, description.
  - Price intent (0.15): “cheap” favors lower prices, “expensive” favors higher, neutral prefers midrange.
  - Baseline score (precomputed):
    - Rating (0.20): normalized avg rating with confidence by rating count.
    - Sales (0.15): log-normalized by max sales; surfaces best sellers without dominance.
    - Stock (0.05): favors in-stock items.
    - Recency (0.05): 1/(1+days) since updatedAt.
- Implementation:
  - Baseline is computed once on startup and incrementally on product add/update.
  - Per-query score = 0.40*text + 0.15*price + baseline.
  - Candidates are reduced via inverted index before ranking.

## NLP Intent Extraction
- Normalization: Unicode fold, lowercasing, punctuation → spaces.
- Spelling correction: Common brand/product errors (e.g., “Ifone” → “iphone”, “samsng” → “samsung”).
- Hinglish sentiment: “sasta”/“budget” → cheap, “mehenga/mehnga” → expensive.
- Price parsing: numeric and multipliers (k, lakh/lac, m), currency (rs/inr/rupees, usd/dollar).
- Storage/color: captures “128 GB”, “256gb” and maps Hindi color terms (kaala → black, neela → blue, etc.).
- Model detection: brand + numeric token fallback (e.g., “iphone 15”, “s24”).

## API Contracts
- Health
  - GET /health
  - 200: `{ "status": "ok" }`
- Product
  - POST /api/v1/product
    - Body: `{ name, brand, category, currency, listPrice:number, discountPercent?:number, sku, stock:number, ... }`
    - 201: `{ data: <product> }`
  - PUT /api/v1/product/meta-data
    - Body: `{ id, metadata: { name?, description?, brand?, model?, category?, ram?, storage?, color?, screenSize? } }`
    - 200: `{ data: <updated product> }`
- Search
  - GET /api/v1/search/product?query=<string>
  - 200:
    ```
    {
      "data": [ { ...product, "_score": number }, ... up to 50 ],
      "meta": {
        "query": "<normalized>",
        "tokens": [ ... ],
        "corrections": [ { from, to }, ... ]
      }
    }
    ```

## Sample Queries
- “Ifone 15 black under 70k sasta”
- “Samsung S24 Ultra 256gb mehenga above 1 lakh”
- “oneplus 12 blue less 500 usd”
- “Pixel 8 obsidian 128 GB under $800”

## Performance
- First uncached query on large payloads: ~2.1s with full-scan.
- With index + cache + baseline precompute:
  - Typical fresh query: ~18–60ms (depending on tokens and candidate size).
  - Cached repeat query: ~20–40ms.
- Reductions achieved by:
  - Candidate pruning via inverted index (cap 100).
  - Result limit (top 50).
  - TTL LRU query cache (default 30s).

## How To Run Locally
- Backend:
  - Location: [apps/backend](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/backend)
  - Start: `npm run start`
  - On startup: seeds catalog with 1000+ products and builds index/baseline.
- Frontend:
  - Location: [apps/frontend](file:///c:/Users/aryan/OneDrive/Desktop/SEO/ecommerce-search/apps/frontend)
  - Install: `npm install`
  - Start dev server: `npm run dev`
  - Open: http://localhost:5173
  - Dev proxy routes `/api/*` → http://localhost:3001

## Design Decisions
- In-memory catalog and index:
  - Enables fast iteration and deterministic latency; suitable for demo and local evaluation.
  - Hooks on add/update maintain index and baseline freshness.
- Lightweight NLP:
  - Domain-specific rules outperform general models for ecommerce search without external dependencies.
  - Hinglish/Indian market terms added to sentiment and color mappings.
- Ranking precompute:
  - Baseline components are query-invariant; precomputation avoids repeated cost per request.
  - Text and price intent remain query-dependent for relevance.
- Caching strategy:
  - TTL LRU keeps hot queries fast and memory bounded.
  - Normalized queries are cache keys to ensure consistency.
- Result size constraints:
  - Limits payload to top 50 for transport efficiency while remaining user-friendly.
- Extensibility:
  - Swap in persistent storage and external search engines as needed.
  - Add pagination and facet filters (brand/category/price range).
  - BM25-like text scoring or field-weighted matching for improved relevance.
