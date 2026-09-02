import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { ApiResponse, ApiErrorDetail } from "@/types/common";

const DEFAULT_API_BASE = "https://backend-oz3h.onrender.com/railways";

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!envUrl) return DEFAULT_API_BASE;

  // If user provided backend root URL without /railways, append it
  if (!envUrl.includes("/railways")) {
    return `${envUrl.replace(/\/+$/, "")}/railways`;
  }
  return envUrl.replace(/\/+$/, "");
}

/**
 * Global Axios instance configured with base URL, headers, and DRF interceptors.
 */
export const api: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

// Request interceptor: ensure trailing slash for Django REST Framework endpoints
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.url) {
      const [urlPath, queryString] = config.url.split("?");
      const trimmedPath = urlPath.endsWith("/") ? urlPath : `${urlPath}/`;
      config.url = queryString ? `${trimmedPath}?${queryString}` : trimmedPath;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function formatAxiosError(error: unknown): { message: string; status: number; data?: unknown } {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || (error.code === "ECONNABORTED" ? 408 : 500);
    const data = error.response?.data;

    if (typeof data === "string") {
      return { message: data, status, data };
    }

    if (data && typeof data === "object") {
      const errorObj = data as ApiErrorDetail;
      if (errorObj.detail) return { message: errorObj.detail, status, data };
      if (errorObj.error) return { message: errorObj.error, status, data };
      if (errorObj.message) return { message: errorObj.message, status, data };

      // DRF field-level errors: { field: ["error1", "error2"] }
      const entries = Object.entries(errorObj);
      if (entries.length > 0) {
        const formatted = entries
          .map(([key, val]) => {
            if (Array.isArray(val)) return `${key}: ${val.join(", ")}`;
            return `${key}: ${String(val)}`;
          })
          .join("; ");
        return { message: formatted, status, data };
      }
    }

    return {
      message: error.message || `Request failed with status ${status}`,
      status,
      data,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, status: 500 };
  }

  return { message: "An unexpected error occurred", status: 500 };
}

/**
 * Helper to safely execute any axios request and return a standard ApiResponse<T>
 */
export async function safeApiCall<T>(
  action: () => Promise<{ data: T }> | Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const res = await action();
    // If an AxiosResponse object is returned, extract .data, otherwise use res as data
    const data = res && typeof res === "object" && "data" in res ? (res as { data: T }).data : (res as T);
    return {
      success: true,
      data,
    };
  } catch (error) {
    const formatted = formatAxiosError(error);
    return {
      success: false,
      error: formatted.message,
      status: formatted.status,
    };
  }
}

export default api;
