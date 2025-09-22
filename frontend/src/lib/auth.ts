export async function logout() {
  try {
    // No backend call needed
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Redirect to landing page
  }
}