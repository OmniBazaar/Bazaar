import { APIClient, APIError } from '../client';

// Mock fetch for testing
global.fetch = jest.fn();

describe('APIClient', () => {
    let apiClient: APIClient;
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        apiClient = new APIClient();
        mockFetch.mockClear();
    });

    it('should create an instance', () => {
        expect(apiClient).toBeInstanceOf(APIClient);
    });

    it('should handle successful API response', async () => {
        const mockData = { listings: [] };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockData,
        } as Response);

        const result = await apiClient.searchListings({});
        expect(result).toEqual(mockData);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/listings/search'),
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            })
        );
    });

    it('should handle API error response', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: 'Not Found',
            json: async () => ({}),
        } as Response);

        await expect(apiClient.searchListings({})).rejects.toThrow(APIError);
    });

    it('should handle network error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(apiClient.searchListings({})).rejects.toThrow('Network error');
    });
}); 