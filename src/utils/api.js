import { getAuthToken } from "./getAuthToken";

const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3001';

export const apiCall = async (endpoint, options = {}) => {
  console.log('endpoint', endpoint);

  const skipAuth = options.skipAuth === true;
  const token = skipAuth ? null : await getAuthToken();

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

  delete config.skipAuth;

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

export const getBookmarkById = (id) =>
  apiCall(`/api/bookmarks/get/${id}`);

export const addBookmark = (bookmarkData) =>
  apiCall('/api/bookmarks/add', {
    method: 'POST',
    body: JSON.stringify(bookmarkData),
  });

export const updateBookmark = (bookmarkId, bookmarkData, token) => {
  let endpoint = `/api/bookmarks/update/${bookmarkId}`;
  if (token) {
    endpoint += `?token=${encodeURIComponent(token)}`;
  }
  return apiCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(bookmarkData),
  });
};

export const updateReminderFromEmail = ({ token, remindAt }) =>
  apiCall('/api/bookmarks/remind-by-email', {
    method: 'POST',
    body: JSON.stringify({ token, remindAt }),
    skipAuth: true,
  });

export const verifyReminderToken = (token) =>
  apiCall('/api/bookmarks/verify-reminder-token', {
    method: 'POST',
    body: JSON.stringify({ token }),
    skipAuth: true,
  });

export const deleteBookmark = (id) =>
  apiCall(`/api/bookmarks/delete/${id}`, {
    method: 'POST',
  });

export const trackBookmarkOpen = (id) =>
  apiCall(`/api/bookmarks/track/${id}`, {
    method: 'POST',
  });

export const updateSmartReminder = (id, settings) =>
  apiCall(`/api/bookmarks/smart-reminder/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });