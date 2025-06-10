import { useState, useCallback } from 'react';
import { ListingNode, SearchFilters } from '../types/listing';

interface MarketplaceState {
    listings: ListingNode[];
    loading: boolean;
    error: string | null;
    filters: SearchFilters;
}

export const useMarketplace = () => {
    const [state, setState] = useState<MarketplaceState>({
        listings: [],
        loading: false,
        error: null,
        filters: {
            type: 'product',
            sortBy: 'date',
            sortOrder: 'desc',
            page: 1,
            limit: 20,
        },
    });

    const searchListings = useCallback(async (filters: SearchFilters) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            // TODO: Implement actual API call
            const response = await fetch('/api/listings/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }

            const data = await response.json();
            setState(prev => ({
                ...prev,
                listings: data.listings,
                filters,
                loading: false,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'An error occurred',
                loading: false,
            }));
        }
    }, []);

    const updateFilters = useCallback((filters: Partial<SearchFilters>) => {
        setState(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                ...filters,
            },
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setState(prev => ({
            ...prev,
            filters: {
                type: 'product',
                sortBy: 'date',
                sortOrder: 'desc',
                page: 1,
                limit: 20,
            },
        }));
    }, []);

    const refreshListings = useCallback(() => {
        searchListings(state.filters);
    }, [searchListings, state.filters]);

    return {
        ...state,
        searchListings,
        updateFilters,
        resetFilters,
        refreshListings,
    };
}; 