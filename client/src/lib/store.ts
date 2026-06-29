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
  isGuest: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  updateBalance: (balance: number) => void;
}

const DEMO_USER: User = {
  _id: 'demo-user',
  username: 'Guest Trader',
  email: 'guest@stocksim.app',
  balance: 100000,
  totalProfitLoss: 5420.5,
  totalTrades: 47,
  winRate: 68.5,
  rank: 0,
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isGuest: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  login: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, isAuthenticated: true, isLoading: false, isGuest: false });
  },
  loginAsGuest: () => {
    localStorage.setItem('guestMode', 'true');
    set({ user: DEMO_USER, isAuthenticated: true, isLoading: false, isGuest: true });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('guestMode');
    set({ user: null, isAuthenticated: false, isGuest: false });
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
  mobileMenuOpen: boolean;
  activePage: string;
  notifications: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setActivePage: (page: string) => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  activePage: 'dashboard',
  notifications: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
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

// ===== API KEYS STORE (client-side, persisted to localStorage) =====
export interface ApiKeyConfig {
  nvidiaApiKey: string;
  nvidiaModel: string;
  alphaVantageKey: string;
  finnhubKey: string;
  stockdataKey: string;
  stockfitKey: string;
  dataProvider: 'simulated' | 'alphavantage' | 'finnhub' | 'stockdata';
}

const defaultApiConfig: ApiKeyConfig = {
  nvidiaApiKey: '',
  nvidiaModel: 'minimaxai/minimax-m3',
  alphaVantageKey: '',
  finnhubKey: '',
  stockdataKey: '',
  stockfitKey: '',
  dataProvider: 'simulated',
};

interface ApiKeyState extends ApiKeyConfig {
  loadKeys: () => void;
  setKey: (key: keyof ApiKeyConfig, value: string) => void;
  saveKeys: () => void;
  clearKeys: () => void;
}

const STORAGE_KEY = 'stocksim_api_config';

export const useApiKeyStore = create<ApiKeyState>((set, get) => ({
  ...defaultApiConfig,
  loadKeys: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<ApiKeyConfig>;
        set({ ...defaultApiConfig, ...parsed });
      }
    } catch {
      // ignore parse errors
    }
  },
  setKey: (key, value) => set({ [key]: value } as Pick<ApiKeyState, keyof ApiKeyConfig>),
  saveKeys: () => {
    if (typeof window === 'undefined') return;
    const state = get();
    const config: ApiKeyConfig = {
      nvidiaApiKey: state.nvidiaApiKey,
      nvidiaModel: state.nvidiaModel,
      alphaVantageKey: state.alphaVantageKey,
      finnhubKey: state.finnhubKey,
      stockdataKey: state.stockdataKey,
      stockfitKey: state.stockfitKey,
      dataProvider: state.dataProvider,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  },
  clearKeys: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    set({ ...defaultApiConfig });
  },
}));
