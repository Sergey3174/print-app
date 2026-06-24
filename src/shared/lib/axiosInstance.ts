import axios from "axios";
import { getCid } from "./cid";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  // withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const cid = await getCid();

    config.headers["X-Key-Cid"] = cid;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);
