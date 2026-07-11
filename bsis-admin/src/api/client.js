import axios from "axios";

// In dev, VITE_API_URL is empty and Vite proxies /api -> http://localhost:5000.
// In production, set VITE_API_URL to your deployed API origin.
const baseURL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL,
  withCredentials: true, // also send the httpOnly cookie the backend sets
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bsis_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear the session and bounce to /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      !err.config?.url?.includes("/auth/login")
    ) {
      localStorage.removeItem("bsis_token");
      localStorage.removeItem("bsis_user");
      if (window.location.pathname !== "/login")
        window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// Helper: turn any axios error into a readable message
export const errMsg = (e) =>
  e?.response?.data?.message || e?.message || "Something went wrong.";

export default api;
