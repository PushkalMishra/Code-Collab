// Helper function to check if JWT token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't decode the token, consider it expired
  }
};

// Helper function to get and validate token
export const getValidToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    return null;
  }
  return token;
}; 