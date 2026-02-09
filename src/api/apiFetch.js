//export const API_BASE = 'http://localhost:3000/api'; // development
//export const API_BASE = 'https://devtinder-1-pqv8.onrender.com/api'; // production
export const API_BASE=import.meta.env.VITE_CLIENT_ENV==="production"?'https://devtinder-1-pqv8.onrender.com/api':'http://localhost:3000/api';

export const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include"
  });

  return response.json();
};
