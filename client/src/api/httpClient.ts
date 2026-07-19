const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

interface RequestOptions extends RequestInit {
  body?: any;
}

export async function httpClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, ...customConfig } = options;

  const headers = {
    "Content-Type": "application/json",
    ...customConfig.headers,
  };

  const config: RequestInit = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (response.ok) {
      // For endpoints that return empty success (e.g. logout)
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return {} as T;
      }
      return await response.json();
    }

    const errorMessage = await response.text();
    let parsedError;
    try {
      parsedError = JSON.parse(errorMessage);
    } catch {
      parsedError = { error: errorMessage };
    }

    throw new Error(
      parsedError.error ||
        parsedError.message ||
        `Request failed with status ${response.status}`,
    );
  } catch (error: any) {
    return Promise.reject(error.message || "Something went wrong");
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    httpClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    httpClient<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    httpClient<T>(endpoint, { ...options, method: "PUT", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    httpClient<T>(endpoint, { ...options, method: "DELETE" }),
};
