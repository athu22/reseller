// src/auth.js

// Save user session (in localStorage)
export const setUserSession = (userId) => {
    localStorage.setItem('userId', userId);
  };
  
  // Get current session
  export const getUserSession = () => {
    return localStorage.getItem('userId');
  };
  
  // Clear session
  export const clearUserSession = () => {
    localStorage.removeItem('userId');
  };
  