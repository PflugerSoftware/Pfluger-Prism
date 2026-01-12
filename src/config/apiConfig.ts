/**
 * API Configuration
 * Central configuration for API endpoints
 */

// API Base URL - points to Bluehost API
export const API_CONFIG = {
  // Production: Use Bluehost API
  // Development: Can use local or Bluehost (set to Bluehost for consistency)
  baseUrl: 'https://prism.pflugerarchitects.com/api',

  // Individual endpoints
  endpoints: {
    projects: '/projects.php',
    bonds: '/bonds.php',
    pods: '/pods.php?resource=pods',
    spaces: '/pods.php?resource=spaces',
    auth: '/auth.php',
    facilities: '/facilities.php'
  }
};

/**
 * Get full API URL for an endpoint
 */
export function getApiUrl(endpoint: keyof typeof API_CONFIG.endpoints): string {
  return `${API_CONFIG.baseUrl}${API_CONFIG.endpoints[endpoint]}`;
}

/**
 * Helper function for API requests with error handling
 * Includes credentials for session cookie support
 */
export async function apiRequest<T>(
  endpoint: keyof typeof API_CONFIG.endpoints,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);

  const defaultOptions: RequestInit = {
    credentials: 'include', // Include session cookies
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);

    // Handle 401 Unauthorized - dispatch event for auth context to handle
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('session-expired'));
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Raw fetch with credentials - for custom endpoint handling
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options
  };

  const response = await fetch(url, defaultOptions);

  // Handle 401 Unauthorized
  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('session-expired'));
  }

  return response;
}

/**
 * Auth-specific API functions
 */
export async function apiLogin(email: string, password: string) {
  const response = await apiFetch('/auth.php', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

export async function apiLogout() {
  const response = await apiFetch('/auth.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'logout' }),
  });
  return response.json();
}

export async function apiCheckAuth() {
  const response = await apiFetch('/auth.php', {
    method: 'GET',
  });
  return response.json();
}
