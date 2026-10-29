import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

API.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("superAdminToken");
  const hospitalToken = localStorage.getItem("hospitalToken");

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (hospitalToken) {
    config.headers.Authorization = `Bearer ${hospitalToken}`;
  }

  return config;
});

export default API;