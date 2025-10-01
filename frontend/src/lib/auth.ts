// const API_BASE_URL = "https://notenest-backend-epgq.onrender.com";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
interface AuthResponse {
  user: any;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Store tokens securely
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

// Validate if token exists and is not expired
export const isTokenValid = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;

  try {
    // Decode JWT payload (without verification since we don't have the secret)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

// Refresh access token
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      return data.access_token;
    } else {
      // Refresh token is invalid, redirect to login
      logout();
      return null;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    logout();
    return null;
  }
};

// Make authenticated API requests
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let accessToken = getAccessToken();
  
  // If no token or token is expired, try to refresh
  if (!accessToken || !isTokenValid()) {
    accessToken = await refreshAccessToken();
  }
  
  if (!accessToken) {
    throw new Error('No access token available');
  }

  // Try request with current token
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  // If token expired, try to refresh
  if (response.status === 401) {
    accessToken = await refreshAccessToken();
    if (accessToken) {
      // Retry with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    }
  }

  return response;
};

export async function logout() {
  const accessToken = getAccessToken();
  
  if (accessToken) {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }
  
  // Clear all tokens and user data
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('child_user');
  localStorage.removeItem('parent_user');
  localStorage.removeItem('user');
  
  window.location.href = '/';
}