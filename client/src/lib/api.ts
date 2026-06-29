import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        if (data.success) {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          }

          return api(originalRequest);
        }
      } catch {
        // Refresh failed - clear auth and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ===== AUTH API =====
export const authAPI = {
  register: (data: { username: string; email: string; password: string; confirmPassword: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  getProfile: () =>
    api.get('/auth/profile'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// ===== STOCKS API =====
export const stocksAPI = {
  getAll: () => api.get('/stocks'),
  getStock: (symbol: string) => api.get(`/stocks/${symbol}`),
  getHistory: (symbol: string, days = 90) => api.get(`/stocks/${symbol}/history?days=${days}`),
  search: (query: string) => api.get(`/stocks/search?q=${query}`),
  getPrediction: (symbol: string, timeframe = '1D') =>
    api.get(`/stocks/${symbol}/prediction?timeframe=${timeframe}`),
  getAllPredictions: (timeframe = '1D') =>
    api.get(`/stocks/predictions?timeframe=${timeframe}`),
};

// ===== TRADING API =====
export const tradingAPI = {
  placeOrder: (data: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: string;
    quantity: number;
    price?: number;
    stopPrice?: number;
  }) => api.post('/trading/orders', data),
  cancelOrder: (orderId: string) => api.delete(`/trading/orders/${orderId}`),
  getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/trading/orders', { params }),
};

// ===== PORTFOLIO API =====
export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio'),
  getPerformance: () => api.get('/portfolio/performance'),
};

// ===== LEADERBOARD API =====
export const leaderboardAPI = {
  getLeaderboard: (params?: { timeframe?: string; page?: number; limit?: number }) =>
    api.get('/leaderboard', { params }),
  getMyRank: () => api.get('/leaderboard/my-rank'),
};

export default api;
