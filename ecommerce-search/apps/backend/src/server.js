require("dotenv").config();
const http = require("http");
const app = require("./app");
const { seedCatalog } = require("./data/seed");
const index = require("./services/index.service");
const ranking = require("./services/ranking.service");

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer(app);

try {
  const res = seedCatalog();
  if (!res.skipped) {
    console.log(`Seeded ${res.seeded} products`);
  }
  const products = require("./services/catalog.service").getAllProducts();
  index.buildIndex(products);
  ranking.registerProducts(products);
} catch (e) {
  console.error("Seeding failed:", e.message);
}

server.listen(PORT, HOST, () => {
  console.log(`API listening on http://${HOST}:${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("SIGINT", () => {
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});
