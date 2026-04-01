import axios from "axios";

// Cookie helper functions
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const setCookie = (name: string, value: string, days: number = 7): void => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
};

// Base API instance (for all API calls)
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Auth API instance (for auth-related endpoints)
export const authApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for both instances
const addAuthInterceptor = (instance: any) => {
  instance.interceptors.request.use(
    (config: any) => {
      const token = getCookie("token") || localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const xsrfToken = getCookie("XSRF-TOKEN");
      if (xsrfToken) {
        config.headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfToken);
      }

      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response?.status === 401) {
        if (!error.config.url.includes("/login")) {
          deleteCookie("token");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }

      // Handle 422 validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors || {};
        const errorMessages = Object.values(validationErrors).flat().join(", ");
        error.userMessage = `Validation errors: ${errorMessages}`;
      }

      return Promise.reject(error);
    },
  );
};

addAuthInterceptor(api);
addAuthInterceptor(authApi);

export default api;
