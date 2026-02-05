const express = require("express");
const productRoutes = require("./routes/product.routes");
const searchRoutes = require("./routes/search.routes");

const app = express();

app.use(express.json());

app.use("/api/v1", productRoutes);
app.use("/api/v1", searchRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

function notFound(req, res, next) {
  res.status(404).json({ error: { message: "Not Found" } });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const response = { error: { message } };
  if (process.env.NODE_ENV === "development" && err.stack) {
    response.error.stack = err.stack;
  }
  res.status(status).json(response);
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
