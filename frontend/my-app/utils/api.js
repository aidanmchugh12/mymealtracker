import { authConfig } from "../auth/authConfig";

/**
 * Make an authenticated API request to the backend
 * Automatically includes the bearer token in the Authorization header
 */
export const apiCall = async (token, endpoint, options = {}) => {
  const url = `${authConfig.apiUrl}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data.message || data || `HTTP Error ${response.status}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * GET request helper
 */
export const apiGet = (token, endpoint) => {
  return apiCall(token, endpoint, { method: "GET" });
};

/**
 * POST request helper
 */
export const apiPost = (token, endpoint, body) => {
  return apiCall(token, endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

/**
 * PUT request helper
 */
export const apiPut = (token, endpoint, body) => {
  return apiCall(token, endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

/**
 * DELETE request helper
 */
export const apiDelete = (token, endpoint) => {
  return apiCall(token, endpoint, { method: "DELETE" });
};
