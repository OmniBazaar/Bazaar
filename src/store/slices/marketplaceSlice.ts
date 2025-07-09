import { StateCreator } from 'zustand';
import { ListingMetadata, SearchFilters } from '../../types/listing';
import { SupportedLocale } from '../../i18n';

// Marketplace state interface
export interface MarketplaceState {
  // Current view
  currentView: 'home' | 'category' | 'search' | 'listing' | 'create';
  currentCategory: string | null;
  
  // Search state
  searchQuery: string;
  searchFilters: SearchFilters;
  searchResults: ListingMetadata[];
  searchHistory: string[];
  savedSearches: Array<{
    id: string;
    name: string;
    query: string;
    filters: SearchFilters;
    createdAt: string;
  }>;
  
  // Favorites and collections
  favorites: string[]; // listing IDs
  featuredListings: string[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  
  // Recent activity
  recentlyViewed: string[];
  
  // Locale and theme
  locale: SupportedLocale;
  theme: 'light' | 'dark' | 'auto';
}

// Marketplace actions interface
export interface MarketplaceActions {
  // Navigation
  setCurrentView: (view: MarketplaceState['currentView']) => void;
  setCurrentCategory: (category: string | null) => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  clearSearchFilters: () => void;
  executeSearch: () => Promise<void>;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  saveSearch: (name: string) => void;
  deleteSavedSearch: (id: string) => void;
  
  // Favorites
  addToFavorites: (listingId: string) => void;
  removeFromFavorites: (listingId: string) => void;
  toggleFavorite: (listingId: string) => void;
  clearFavorites: () => void;
  
  // Recent activity
  addToRecentlyViewed: (listingId: string) => void;
  clearRecentlyViewed: () => void;
  
  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Pagination
  setPagination: (pagination: Partial<MarketplaceState['pagination']>) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  // Settings
  setLocale: (locale: SupportedLocale) => void;
  setTheme: (theme: MarketplaceState['theme']) => void;
  
  // Reset
  resetMarketplace: () => void;
}

// Combined marketplace slice type
export type MarketplaceSlice = {
  marketplace: MarketplaceState;
  marketplaceActions: MarketplaceActions;
};

// Initial state
const initialMarketplaceState: MarketplaceState = {
  currentView: 'home',
  currentCategory: null,
  searchQuery: '',
  searchFilters: {
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  },
  searchResults: [],
  searchHistory: [],
  savedSearches: [],
  favorites: [],
  featuredListings: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
  recentlyViewed: [],
  locale: 'en',
  theme: 'auto',
};

// Create marketplace slice
export const createMarketplaceSlice: StateCreator<
  MarketplaceSlice,
  [],
  [],
  MarketplaceSlice
> = (set, get) => ({
  marketplace: initialMarketplaceState,
  
  marketplaceActions: {
    // Navigation
    setCurrentView: (view) => set((state) => {
      state.marketplace.currentView = view;
    }),
    
    setCurrentCategory: (category) => set((state) => {
      state.marketplace.currentCategory = category;
    }),
    
    // Search
    setSearchQuery: (query) => set((state) => {
      state.marketplace.searchQuery = query;
    }),
    
    setSearchFilters: (filters) => set((state) => {
      state.marketplace.searchFilters = {
        ...state.marketplace.searchFilters,
        ...filters,
      };
    }),
    
    clearSearchFilters: () => set((state) => {
      state.marketplace.searchFilters = {
        sortBy: 'date',
        sortOrder: 'desc',
        page: 1,
        limit: 20,
      };
    }),
    
    executeSearch: async () => {
      const { marketplace } = get();
      
      set((state) => {
        state.marketplace.isLoading = true;
        state.marketplace.error = null;
      });
      
      try {
        // Implementation will connect to search API
        // For now, mock the search
        const mockResults: ListingMetadata[] = [];
        
        set((state) => {
          state.marketplace.searchResults = mockResults;
          state.marketplace.isLoading = false;
        });
        
        // Add to search history if query exists
        if (marketplace.searchQuery.trim()) {
          get().marketplaceActions.addToSearchHistory(marketplace.searchQuery);
        }
      } catch (error) {
        set((state) => {
          state.marketplace.error = error instanceof Error ? error.message : 'Search failed';
          state.marketplace.isLoading = false;
        });
      }
    },
    
    addToSearchHistory: (query) => set((state) => {
      const history = state.marketplace.searchHistory;
      const filteredHistory = history.filter(item => item !== query);
      state.marketplace.searchHistory = [query, ...filteredHistory].slice(0, 10);
    }),
    
    clearSearchHistory: () => set((state) => {
      state.marketplace.searchHistory = [];
    }),
    
    saveSearch: (name) => set((state) => {
      const { searchQuery, searchFilters } = state.marketplace;
      const savedSearch = {
        id: Date.now().toString(),
        name,
        query: searchQuery,
        filters: searchFilters,
        createdAt: new Date().toISOString(),
      };
      state.marketplace.savedSearches.push(savedSearch);
    }),
    
    deleteSavedSearch: (id) => set((state) => {
      state.marketplace.savedSearches = state.marketplace.savedSearches.filter(
        search => search.id !== id
      );
    }),
    
    // Favorites
    addToFavorites: (listingId) => set((state) => {
      if (!state.marketplace.favorites.includes(listingId)) {
        state.marketplace.favorites.push(listingId);
      }
    }),
    
    removeFromFavorites: (listingId) => set((state) => {
      state.marketplace.favorites = state.marketplace.favorites.filter(
        id => id !== listingId
      );
    }),
    
    toggleFavorite: (listingId) => {
      const { favorites } = get().marketplace;
      if (favorites.includes(listingId)) {
        get().marketplaceActions.removeFromFavorites(listingId);
      } else {
        get().marketplaceActions.addToFavorites(listingId);
      }
    },
    
    clearFavorites: () => set((state) => {
      state.marketplace.favorites = [];
    }),
    
    // Recent activity
    addToRecentlyViewed: (listingId) => set((state) => {
      const viewed = state.marketplace.recentlyViewed;
      const filteredViewed = viewed.filter(id => id !== listingId);
      state.marketplace.recentlyViewed = [listingId, ...filteredViewed].slice(0, 20);
    }),
    
    clearRecentlyViewed: () => set((state) => {
      state.marketplace.recentlyViewed = [];
    }),
    
    // UI state
    setLoading: (loading) => set((state) => {
      state.marketplace.isLoading = loading;
    }),
    
    setError: (error) => set((state) => {
      state.marketplace.error = error;
    }),
    
    // Pagination
    setPagination: (pagination) => set((state) => {
      state.marketplace.pagination = {
        ...state.marketplace.pagination,
        ...pagination,
      };
    }),
    
    nextPage: () => set((state) => {
      if (state.marketplace.pagination.hasMore) {
        state.marketplace.pagination.page += 1;
      }
    }),
    
    prevPage: () => set((state) => {
      if (state.marketplace.pagination.page > 1) {
        state.marketplace.pagination.page -= 1;
      }
    }),
    
    // Settings
    setLocale: (locale) => set((state) => {
      state.marketplace.locale = locale;
    }),
    
    setTheme: (theme) => set((state) => {
      state.marketplace.theme = theme;
    }),
    
    // Reset
    resetMarketplace: () => set((state) => {
      state.marketplace = initialMarketplaceState;
    }),
  },
}); 