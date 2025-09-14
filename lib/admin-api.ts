/**
 * Admin API Helper Functions
 * 
 * This file provides utility functions for making authenticated API calls
 * in the admin panel. All requests include credentials for proper authentication.
 */

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Makes an authenticated API request to admin endpoints
 */
export async function adminApiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error (${response.status}):`, data);
      return {
        success: false,
        error: data.error || data.message || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Admin API Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * GET request to admin API
 */
export async function adminGet<T = any>(url: string): Promise<ApiResponse<T>> {
  return adminApiRequest<T>(url, { method: 'GET' });
}

/**
 * POST request to admin API
 */
export async function adminPost<T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> {
  return adminApiRequest<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request to admin API
 */
export async function adminPut<T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> {
  return adminApiRequest<T>(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request to admin API
 */
export async function adminDelete<T = any>(url: string): Promise<ApiResponse<T>> {
  return adminApiRequest<T>(url, { method: 'DELETE' });
}
