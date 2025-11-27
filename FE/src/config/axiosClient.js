import axios from "axios";
import Cookies from "js-cookie";

const axiosClient = axios.create({
  baseURL: import.meta.env.DEV 
    ? "http://localhost:8080" 
    : "/",
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (!config.headers["Content-Type"] && !config.formData) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default axiosClient;
