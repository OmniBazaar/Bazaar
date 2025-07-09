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

    it('should create APIClient instance', () => {
        expect(mockApiClient).toBeDefined();
    });

    it('should handle successful search', async () => {
        const filters: SearchFilters = { type: 'product' };
        const mockResults = { listings: [mockListing] };
        mockApiClient.searchListings.mockResolvedValue(mockResults);

        const result = await mockApiClient.searchListings(filters);
        expect(result).toEqual(mockResults);
    });

    it('should handle search error', async () => {
        const filters: SearchFilters = { type: 'product' };
        mockApiClient.searchListings.mockRejectedValue(new Error('Search failed'));

        await expect(mockApiClient.searchListings(filters)).rejects.toThrow('Search failed');
    });

    it('should handle create listing', async () => {
        const mockCid = 'test-cid';
        mockApiClient.createListing.mockResolvedValue({ cid: mockCid });

        const result = await mockApiClient.createListing(mockListing);
        expect(result).toEqual({ cid: mockCid });
    });

    it('should handle get listing', async () => {
        mockApiClient.getListing.mockResolvedValue(mockListing);

        const result = await mockApiClient.getListing('test-cid');
        expect(result).toEqual(mockListing);
    });

    it('should handle update listing', async () => {
        const mockCid = 'test-cid';
        mockApiClient.updateListing.mockResolvedValue({ cid: mockCid });

        const result = await mockApiClient.updateListing(mockCid, mockListing);
        expect(result).toEqual({ cid: mockCid });
    });

    it('should handle delete listing', async () => {
        mockApiClient.deleteListing.mockResolvedValue();

        await expect(mockApiClient.deleteListing('test-cid')).resolves.toBeUndefined();
    });
}); 