import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchPage from "./pages/SearchPage.jsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <header className="header">
          <h1>Ecommerce Search</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/product/:productId" element={<ProductDetailsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
