// src/auth.js

// Save user session (in localStorage)
export const setUserSession = (userId, role = 'user') => {
  localStorage.setItem('userId', userId);
  localStorage.setItem('userRole', role);
};

// Get current session
export const getUserSession = () => {
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('userRole') || 'user';
  return { userId, role };
};

// Clear session
export const clearUserSession = () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('userId');
};

// Check user role
export const getUserRole = () => {
  return localStorage.getItem('userRole') || 'user';
};

// Check if user is admin
export const isAdmin = () => {
  const role = getUserRole();
  return role === 'admin' || role === 'super_admin';
};

// Check if user is super admin
export const isSuperAdmin = () => {
  return getUserRole() === 'super_admin';
};
  