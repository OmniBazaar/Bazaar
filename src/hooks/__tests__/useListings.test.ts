import { renderHook, act } from '@testing-library/react-hooks';
import { useListings } from '../useListings';
import { APIClient } from '../../api/client';
import { ListingMetadata, SearchFilters } from '../../types/listing';

// Mock the APIClient
jest.mock('../../api/client');

const mockListing: ListingMetadata = {
    cid: 'test-cid-123',
    title: 'Test Listing',
    description: 'Test Description',
    type: 'product',
    price: 100,
    currency: 'USD',
    category: 'Electronics',
    tags: ['test', 'electronics'],
    images: ['https://example.com/image.jpg'],
    location: {
        city: 'Test City',
        country: 'Test Country',
    },
    seller: {
        id: '1',
        name: 'Test Seller',
        avatar: 'https://example.com/avatar.jpg',
        rating: 4.5,
        contactInfo: {
            email: 'test@example.com',
        },
    },
    productDetails: {
        condition: 'new',
        brand: 'Test Brand',
        model: 'Test Model',
    },
    status: 'active',
};

describe('useListings', () => {
    let mockApiClient: jest.Mocked<APIClient>;

    beforeEach(() => {
        mockApiClient = new APIClient() as jest.Mocked<APIClient>;
        (APIClient as jest.Mock).mockImplementation(() => mockApiClient);
    });

    it('should search listings successfully', async () => {
        const filters: SearchFilters = { type: 'product' };
        const mockResults = { listings: [mockListing] };
        mockApiClient.searchListings.mockResolvedValue(mockResults);

        const { result } = renderHook(() => useListings());

        await act(async () => {
            await result.current.searchListings(filters);
        });

        expect(result.current.listings).toEqual([mockListing]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle search error', async () => {
        const filters: SearchFilters = { type: 'product' };
        mockApiClient.searchListings.mockRejectedValue(new Error('Search failed'));

        const { result } = renderHook(() => useListings());

        await act(async () => {
            await result.current.searchListings(filters);
        });

        expect(result.current.listings).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to search listings');
    });

    it('should create listing successfully', async () => {
        const mockCid = 'test-cid';
        mockApiClient.createListing.mockResolvedValue({ cid: mockCid });

        const { result } = renderHook(() => useListings());

        let createdCid: string | null = null;
        await act(async () => {
            createdCid = await result.current.createListing(mockListing);
        });

        expect(createdCid).toBe(mockCid);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle create listing error', async () => {
        mockApiClient.createListing.mockRejectedValue(new Error('Create failed'));

        const { result } = renderHook(() => useListings());

        let createdCid: string | null = null;
        await act(async () => {
            createdCid = await result.current.createListing(mockListing);
        });

        expect(createdCid).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to create listing');
    });

    it('should get listing successfully', async () => {
        mockApiClient.getListing.mockResolvedValue(mockListing);

        const { result } = renderHook(() => useListings());

        let retrievedListing: ListingMetadata | null = null;
        await act(async () => {
            retrievedListing = await result.current.getListing('test-cid');
        });

        expect(retrievedListing).toEqual(mockListing);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle get listing error', async () => {
        mockApiClient.getListing.mockRejectedValue(new Error('Get failed'));

        const { result } = renderHook(() => useListings());

        let retrievedListing: ListingMetadata | null = null;
        await act(async () => {
            retrievedListing = await result.current.getListing('test-cid');
        });

        expect(retrievedListing).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to get listing');
    });

    it('should update listing successfully', async () => {
        const mockCid = 'test-cid';
        mockApiClient.updateListing.mockResolvedValue({ cid: mockCid });

        const { result } = renderHook(() => useListings());

        let updatedCid: string | null = null;
        await act(async () => {
            updatedCid = await result.current.updateListing(mockCid, mockListing);
        });

        expect(updatedCid).toBe(mockCid);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle update listing error', async () => {
        mockApiClient.updateListing.mockRejectedValue(new Error('Update failed'));

        const { result } = renderHook(() => useListings());

        let updatedCid: string | null = null;
        await act(async () => {
            updatedCid = await result.current.updateListing('test-cid', mockListing);
        });

        expect(updatedCid).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to update listing');
    });

    it('should delete listing successfully', async () => {
        const mockCid = 'test-cid';
        mockApiClient.deleteListing.mockResolvedValue();

        const { result } = renderHook(() => useListings());

        await act(async () => {
            await result.current.deleteListing(mockCid);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle delete listing error', async () => {
        mockApiClient.deleteListing.mockRejectedValue(new Error('Delete failed'));

        const { result } = renderHook(() => useListings());

        await act(async () => {
            await result.current.deleteListing('test-cid');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to delete listing');
    });
}); 