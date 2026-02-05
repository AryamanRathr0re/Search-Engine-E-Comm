import axios from "axios";

const baseURL = import.meta.env?.VITE_API_BASE_URL?.trim() || "/api/v1";

const api = axios.create({
  baseURL,
  timeout: 8000,
});

export default api;
