import { renderHook, act } from '@testing-library/react';
import { useMarketplace } from '../useMarketplace';
import { SearchFilters } from '../../types/listing';

// Mock the listing service
jest.mock('../../services/listing', () => ({
    getListing: jest.fn(),
    createListing: jest.fn(),
    updateListing: jest.fn(),
}));

// Mock toast notifications
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        warning: jest.fn(),
        info: jest.fn(),
    }
}));

describe('useMarketplace', () => {
    const mockFilters: SearchFilters = {
        type: 'product',
        category: 'electronics',
        priceRange: { min: 10, max: 1000 },
        location: { city: 'Test City', country: 'Test Country' },
        sortBy: 'price',
        sortOrder: 'asc'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return initial state', () => {
        const { result } = renderHook(() => useMarketplace());

        expect(result.current.listings).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(result.current.filters).toEqual({});
        expect(typeof result.current.searchListings).toBe('function');
        expect(typeof result.current.updateFilters).toBe('function');
        expect(typeof result.current.resetFilters).toBe('function');
    });

    it('should update filters correctly', () => {
        const { result } = renderHook(() => useMarketplace());

        act(() => {
            result.current.updateFilters(mockFilters);
        });

        expect(result.current.filters).toMatchObject(mockFilters);
    });

    it('should reset filters correctly', () => {
        const { result } = renderHook(() => useMarketplace());

        // First set some filters
        act(() => {
            result.current.updateFilters(mockFilters);
        });

        expect(result.current.filters).toMatchObject(mockFilters);

        // Then reset them
        act(() => {
            result.current.resetFilters();
        });

        expect(result.current.filters).toEqual({});
    });

    it('should handle search listings operation', async () => {
        const { result } = renderHook(() => useMarketplace());

        act(() => {
            void result.current.searchListings(mockFilters);
        });

        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(null);
    });

    it('should update filters when searching', () => {
        const { result } = renderHook(() => useMarketplace());

        act(() => {
            void result.current.searchListings(mockFilters);
        });

        expect(result.current.filters).toMatchObject(mockFilters);
    });

    it('should handle partial filter updates', () => {
        const { result } = renderHook(() => useMarketplace());

        // Set initial filters
        act(() => {
            result.current.updateFilters(mockFilters);
        });

        // Update with partial filters
        const partialFilters: SearchFilters = {
            type: 'service',
            priceRange: { min: 20, max: 500 }
        };

        act(() => {
            result.current.updateFilters(partialFilters);
        });

        expect(result.current.filters.type).toBe('service');
        expect(result.current.filters.priceRange?.min).toBe(20);
        expect(result.current.filters.priceRange?.max).toBe(500);
    });

    it('should handle empty filters', () => {
        const { result } = renderHook(() => useMarketplace());

        act(() => {
            result.current.updateFilters({});
        });

        expect(result.current.filters).toBeDefined();
    });

    it('should handle complex filter combinations', () => {
        const { result } = renderHook(() => useMarketplace());

        const complexFilters: SearchFilters = {
            type: 'product',
            category: 'electronics',
            priceRange: { min: 100, max: 2000 },
            location: { 
                city: 'San Francisco', 
                country: 'USA' 
            },
            sortBy: 'date',
            sortOrder: 'desc'
        };

        act(() => {
            result.current.updateFilters(complexFilters);
        });

        expect(result.current.filters).toMatchObject(complexFilters);
        expect(result.current.filters.location?.city).toBe('San Francisco');
        expect(result.current.filters.priceRange?.min).toBe(100);
        expect(result.current.filters.priceRange?.max).toBe(2000);
    });

    it('should handle search with no filters', () => {
        const { result } = renderHook(() => useMarketplace());

        act(() => {
            void result.current.searchListings({});
        });

        expect(result.current.loading).toBe(true);
    });

    it('should reset error state when starting new search', () => {
        const { result } = renderHook(() => useMarketplace());

        // Start new search - should reset error
        act(() => {
            void result.current.searchListings({});
        });

        expect(result.current.error).toBe(null);
        expect(result.current.loading).toBe(true);
    });

    it('should handle incremental filter updates', () => {
        const { result } = renderHook(() => useMarketplace());

        // Set initial type filter
        act(() => {
            result.current.updateFilters({ type: 'product' });
        });

        expect(result.current.filters.type).toBe('product');

        // Add category filter
        act(() => {
            result.current.updateFilters({ category: 'electronics' });
        });

        expect(result.current.filters.type).toBe('product');
        expect(result.current.filters.category).toBe('electronics');

        // Add price range
        act(() => {
            result.current.updateFilters({ priceRange: { min: 10, max: 100 } });
        });

        expect(result.current.filters.type).toBe('product');
        expect(result.current.filters.category).toBe('electronics');
        expect(result.current.filters.priceRange?.min).toBe(10);
        expect(result.current.filters.priceRange?.max).toBe(100);
    });

    it('should handle location filter updates', () => {
        const { result } = renderHook(() => useMarketplace());

        act(() => {
            result.current.updateFilters({ 
                location: { city: 'New York', country: 'USA' }
            });
        });

        expect(result.current.filters.location?.city).toBe('New York');
        expect(result.current.filters.location?.country).toBe('USA');
    });

    it('should handle sort options', () => {
        const { result } = renderHook(() => useMarketplace());

        act(() => {
            result.current.updateFilters({ 
                sortBy: 'price',
                sortOrder: 'desc'
            });
        });

        expect(result.current.filters.sortBy).toBe('price');
        expect(result.current.filters.sortOrder).toBe('desc');
    });

    it('should handle error scenarios gracefully', () => {
        const { result } = renderHook(() => useMarketplace());

        // Test with undefined filters
        act(() => {
            result.current.updateFilters(undefined as any);
        });

        expect(result.current.filters).toBeDefined();
    });

    it('should handle filter merging correctly', () => {
        const { result } = renderHook(() => useMarketplace());

        // Set multiple filter properties
        act(() => {
            result.current.updateFilters({ 
                type: 'product',
                category: 'electronics'
            });
        });

        expect(result.current.filters.type).toBe('product');
        expect(result.current.filters.category).toBe('electronics');

        // Update only one property
        act(() => {
            result.current.updateFilters({ category: 'books' });
        });

        // Should preserve existing filters and update specific one
        expect(result.current.filters.type).toBe('product');
        expect(result.current.filters.category).toBe('books');
    });

    it('should handle loading state correctly during search', () => {
        const { result } = renderHook(() => useMarketplace());

        // Initial state should not be loading
        expect(result.current.loading).toBe(false);

        // Start search
        act(() => {
            void result.current.searchListings(mockFilters);
        });

        // Should be loading
        expect(result.current.loading).toBe(true);
    });
}); 