// API service layer for PostgreSQL backend
// Update these endpoints to match your backend API

const API_BASE_URL = process.env.VITE_API_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Auth endpoints
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (email: string, password: string, username: string, university: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username, university }),
    });
    return response.json();
  },
};

// Listings endpoints
export const listingsAPI = {
  getAll: async (filters?: {
    university?: string;
    gender?: string;
    minPrice?: number;
    maxPrice?: number;
    privateRoom?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.university) params.append('university', filters.university);
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.privateRoom !== undefined) params.append('privateRoom', filters.privateRoom.toString());

    const response = await fetch(`${API_BASE_URL}/listings?${params}`);
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`);
    return response.json();
  },

  getMyListings: async () => {
    const response = await fetch(`${API_BASE_URL}/listings/my-listings`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  create: async (listingData: any) => {
    const response = await fetch(`${API_BASE_URL}/listings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(listingData),
    });
    return response.json();
  },

  update: async (id: number, listingData: any) => {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(listingData),
    });
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Amenities endpoints
export const amenitiesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/amenities`);
    return response.json();
  },
};