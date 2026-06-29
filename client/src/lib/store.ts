import { create } from 'zustand';

// ===== AUTH STORE =====
interface User {
  _id: string;
  username: string;
  email: string;
  balance: number;
  avatar?: string;
  totalProfitLoss: number;
  totalTrades: number;
  winRate: number;
  rank: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateBalance: (balance: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  login: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },
  updateBalance: (balance) =>
    set((state) => ({
      user: state.user ? { ...state.user, balance } : null,
    })),
}));

// ===== TRADING STORE =====
interface TradingState {
  selectedSymbol: string;
  orderSide: 'BUY' | 'SELL';
  orderType: string;
  quantity: number;
  price: number;
  setSelectedSymbol: (symbol: string) => void;
  setOrderSide: (side: 'BUY' | 'SELL') => void;
  setOrderType: (type: string) => void;
  setQuantity: (quantity: number) => void;
  setPrice: (price: number) => void;
  resetOrder: () => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  selectedSymbol: 'AAPL',
  orderSide: 'BUY',
  orderType: 'MARKET',
  quantity: 1,
  price: 0,
  setSelectedSymbol: (selectedSymbol) => set({ selectedSymbol }),
  setOrderSide: (orderSide) => set({ orderSide }),
  setOrderType: (orderType) => set({ orderType }),
  setQuantity: (quantity) => set({ quantity }),
  setPrice: (price) => set({ price }),
  resetOrder: () => set({ orderSide: 'BUY', orderType: 'MARKET', quantity: 1, price: 0 }),
}));

// ===== UI STORE =====
interface UIState {
  sidebarOpen: boolean;
  activePage: string;
  notifications: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  toggleSidebar: () => void;
  setActivePage: (page: string) => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activePage: 'dashboard',
  notifications: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActivePage: (activePage) => set({ activePage }),
  addNotification: (message, type) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Date.now().toString(), message, type },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
