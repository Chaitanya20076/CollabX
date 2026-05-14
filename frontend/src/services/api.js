import axios from "axios";

export const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "https://collabx-3.onrender.com";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || `${API_ORIGIN}/api`;

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export default API;
