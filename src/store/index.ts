import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createMarketplaceSlice, MarketplaceSlice } from './slices/marketplaceSlice';
import { createEscrowSlice, EscrowSlice } from './slices/escrowSlice';
import { createUserSlice, UserSlice } from './slices/userSlice';
import { createSettingsSlice, SettingsSlice } from './slices/settingsSlice';
import { createListingsSlice, ListingsSlice } from './slices/listingsSlice';

// Combined store type
export type AppStore = MarketplaceSlice & 
  EscrowSlice & 
  UserSlice & 
  SettingsSlice & 
  ListingsSlice;

// Create the main store
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((...args) => ({
          ...createMarketplaceSlice(...args),
          ...createEscrowSlice(...args),
          ...createUserSlice(...args),
          ...createSettingsSlice(...args),
          ...createListingsSlice(...args),
        }))
      ),
      {
        name: 'omnibazaar-marketplace-store',
        partialize: (state) => ({
          // Only persist specific parts of the state
          settings: state.settings,
          user: {
            profile: state.user.profile,
            preferences: state.user.preferences,
          },
          marketplace: {
            favorites: state.marketplace.favorites,
            searchHistory: state.marketplace.searchHistory,
            savedSearches: state.marketplace.savedSearches,
          },
        }),
        version: 1,
      }
    ),
    {
      name: 'OmniBazaar Marketplace Store',
    }
  )
);

// Selector hooks for specific slices
export const useMarketplace = () => useAppStore((state) => state.marketplace);
export const useEscrow = () => useAppStore((state) => state.escrow);
export const useUser = () => useAppStore((state) => state.user);
export const useSettings = () => useAppStore((state) => state.settings);
export const useListings = () => useAppStore((state) => state.listings);

// Action hooks
export const useMarketplaceActions = () => useAppStore((state) => state.marketplaceActions);
export const useEscrowActions = () => useAppStore((state) => state.escrowActions);
export const useUserActions = () => useAppStore((state) => state.userActions);
export const useSettingsActions = () => useAppStore((state) => state.settingsActions);
export const useListingsActions = () => useAppStore((state) => state.listingsActions); 