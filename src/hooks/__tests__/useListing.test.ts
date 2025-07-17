import { renderHook, waitFor } from '@testing-library/react';
import { useListing } from '../useListing';

// Mock the API client completely
jest.mock('../../api/client', () => ({
    APIClient: jest.fn().mockImplementation(() => ({
        getListing: jest.fn(),
        createListing: jest.fn(),
        updateListing: jest.fn(),
        deleteListing: jest.fn(),
        searchListings: jest.fn(),
    }))
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

// Import after mocking
const { APIClient } = require('../../api/client');

describe('useListing', () => {
    const mockListing = {
        id: 'listing-1',
        title: 'Test Listing',
        description: 'Test Description',
        price: 100,
        currency: 'omnicoin',
        quantity: 1,
        images: ['image1.jpg'],
        seller: {
            id: 'seller-1',
            username: 'testuser',
            reputation: 100,
            avatar: 'avatar.jpg'
        },
        category: 'electronics',
        tags: ['test', 'electronics'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        details: {
            condition: 'new',
            brand: 'TestBrand'
        },
        shipping: {
            method: 'standard',
            cost: 10,
            estimatedDelivery: '3-5 business days'
        },
        status: 'active'
    };

    let mockAPIInstance: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockAPIInstance = new APIClient();
    });

    it('should return initial state', () => {
        const { result } = renderHook(() => useListing());

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(typeof result.current.getListing).toBe('function');
        expect(typeof result.current.createListing).toBe('function');
        expect(typeof result.current.updateListing).toBe('function');
        expect(typeof result.current.deleteListing).toBe('function');
    });

    it('should get listing successfully', async () => {
        mockAPIInstance.getListing.mockResolvedValue(mockListing);
        const { result } = renderHook(() => useListing());

        const listing = await result.current.getListing('listing-1');

        expect(listing).toEqual(mockListing);
        expect(mockAPIInstance.getListing).toHaveBeenCalledWith('listing-1');
    });

    it('should handle get listing error', async () => {
        mockAPIInstance.getListing.mockRejectedValue(new Error('Network error'));
        const { result } = renderHook(() => useListing());

        await expect(result.current.getListing('listing-1')).rejects.toThrow('Network error');
    });

    it('should create listing successfully', async () => {
        const newListing = {
            title: 'New Listing',
            description: 'New Description',
            price: 50,
            currency: 'bitcoin',
            quantity: 2,
            images: ['image2.jpg'],
            seller: {
                id: 'seller-2',
                username: 'newuser',
                reputation: 50,
                avatar: 'avatar2.jpg'
            },
            category: 'books',
            tags: ['book'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            details: {
                condition: 'used'
            },
            shipping: {
                method: 'express',
                cost: 20,
                estimatedDelivery: '1-2 business days'
            },
            status: 'active'
        };

        const createdListing = { ...newListing, id: 'listing-2' };
        mockAPIInstance.createListing.mockResolvedValue(createdListing);
        const { result } = renderHook(() => useListing());

        const result_listing = await result.current.createListing(newListing);

        expect(result_listing).toEqual(createdListing);
        expect(mockAPIInstance.createListing).toHaveBeenCalledWith(newListing);
    });

    it('should handle create listing error', async () => {
        const newListing = {
            title: 'Invalid Listing',
            description: '',
            price: -1,
            currency: 'omnicoin',
            quantity: 0
        };

        mockAPIInstance.createListing.mockRejectedValue(new Error('Validation error'));
        const { result } = renderHook(() => useListing());

        await expect(result.current.createListing(newListing)).rejects.toThrow('Validation error');
    });

    it('should update listing successfully', async () => {
        const updates = {
            title: 'Updated Title',
            price: 150
        };

        const updatedListing = { ...mockListing, ...updates, updatedAt: '2024-01-02T00:00:00Z' };
        mockAPIInstance.updateListing.mockResolvedValue(updatedListing);
        const { result } = renderHook(() => useListing());

        const result_listing = await result.current.updateListing('listing-1', updates);

        expect(result_listing).toEqual(updatedListing);
        expect(mockAPIInstance.updateListing).toHaveBeenCalledWith('listing-1', updates);
    });

    it('should handle update listing error', async () => {
        const updates = { title: '' };

        mockAPIInstance.updateListing.mockRejectedValue(new Error('Update failed'));
        const { result } = renderHook(() => useListing());

        await expect(result.current.updateListing('listing-1', updates)).rejects.toThrow('Update failed');
    });

    it('should delete listing successfully', async () => {
        mockAPIInstance.deleteListing.mockResolvedValue(undefined);
        const { result } = renderHook(() => useListing());

        await result.current.deleteListing('listing-1');

        expect(mockAPIInstance.deleteListing).toHaveBeenCalledWith('listing-1');
    });

    it('should handle delete listing error', async () => {
        mockAPIInstance.deleteListing.mockRejectedValue(new Error('Delete failed'));
        const { result } = renderHook(() => useListing());

        await expect(result.current.deleteListing('listing-1')).rejects.toThrow('Delete failed');
    });

    it('should handle loading states correctly', async () => {
        mockAPIInstance.getListing.mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve(mockListing), 100))
        );
        const { result } = renderHook(() => useListing());

        // Start async operation
        const promise = result.current.getListing('listing-1');

        // Loading should be true initially
        expect(result.current.loading).toBe(true);

        // Wait for completion
        await promise;

        // Loading should be false after completion
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it('should handle error states correctly', async () => {
        const error = new Error('API Error');
        mockAPIInstance.getListing.mockRejectedValue(error);
        const { result } = renderHook(() => useListing());

        try {
            await result.current.getListing('listing-1');
        } catch (e) {
            // Expected error
        }

        await waitFor(() => {
            expect(result.current.error).toBe(error);
            expect(result.current.loading).toBe(false);
        });
    });

    it('should reset error state on successful operation', async () => {
        mockAPIInstance.getListing.mockRejectedValueOnce(new Error('First error'));
        const { result } = renderHook(() => useListing());

        try {
            await result.current.getListing('listing-1');
        } catch (e) {
            // Expected error
        }

        // Error should be set
        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
        });

        // Mock successful response
        mockAPIInstance.getListing.mockResolvedValueOnce(mockListing);

        await result.current.getListing('listing-1');

        // Error should be cleared
        await waitFor(() => {
            expect(result.current.error).toBe(null);
        });
    });
}); 