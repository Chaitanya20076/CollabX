import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://collabx-9sf9.onrender.com/api",
  timeout: 30000,
});

export default API;
