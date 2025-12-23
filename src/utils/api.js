import { getAuthToken } from "./getAuthToken";

const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3001';

export const apiCall = async (endpoint, options = {}) => {
  console.log('endpoint', endpoint);

  const token = await getAuthToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API calls
export const loginUser = (credentials) =>
  apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const signupUser = (credentials) =>
  apiCall('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const socialLogin = (idToken) =>
  apiCall('/api/auth/social-login', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });

// Bookmark API calls
export const getBookmarks = () =>
  apiCall('/api/bookmarks/get');

export const addBookmark = (bookmarkData) =>
  apiCall('/api/bookmarks/add', {
    method: 'POST',
    body: JSON.stringify(bookmarkData),
  });

export const updateBookmark = (bookmarkId, bookmarkData) =>
  apiCall(`/api/bookmarks/update/${bookmarkId}`, {
    method: 'PATCH',
    body: JSON.stringify(bookmarkData),
  })

export const deleteBookmark = (id) =>
  apiCall(`/api/bookmarks/delete/${id}`, {
    method: 'POST',
  }); 