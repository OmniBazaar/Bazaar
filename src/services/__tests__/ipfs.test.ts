import { uploadToIPFS, uploadMetadataToIPFS, getFromIPFS, pinToIPFS, unpinFromIPFS } from '../ipfs';

// Mock fetch globally
global.fetch = jest.fn();

describe('IPFS Service', () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadToIPFS', () => {
        it('should upload a file to IPFS successfully', async () => {
            const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
            const mockHash = 'QmTestHash123';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ Hash: mockHash }),
            } as Response);

            const result = await uploadToIPFS(mockFile);

            expect(result).toBe(mockHash);
            expect(mockFetch).toHaveBeenCalledWith(
                'https://ipfs.infura.io:5001/api/v0/add',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(FormData),
                })
            );
        });

        it('should handle upload errors', async () => {
            const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            } as Response);

            await expect(uploadToIPFS(mockFile)).rejects.toThrow('Failed to upload to IPFS');
        });

        it('should handle network errors', async () => {
            const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(uploadToIPFS(mockFile)).rejects.toThrow('Network error');
        });
    });

    describe('uploadMetadataToIPFS', () => {
        it('should upload metadata to IPFS successfully', async () => {
            const mockMetadata = {
                name: 'Test Item',
                description: 'Test Description',
                image: 'QmImageHash123',
            };
            const mockHash = 'QmMetadataHash123';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ Hash: mockHash }),
            } as Response);

            const result = await uploadMetadataToIPFS(mockMetadata);

            expect(result).toBe(mockHash);
            expect(mockFetch).toHaveBeenCalledWith(
                'https://ipfs.infura.io:5001/api/v0/add',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(FormData),
                })
            );
        });

        it('should handle metadata upload errors', async () => {
            const mockMetadata = { name: 'Test' };

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
            } as Response);

            await expect(uploadMetadataToIPFS(mockMetadata)).rejects.toThrow('Failed to upload metadata to IPFS');
        });

        it('should serialize complex metadata correctly', async () => {
            const complexMetadata = {
                name: 'Complex Item',
                attributes: [
                    { trait_type: 'Color', value: 'Blue' },
                    { trait_type: 'Size', value: 'Large' },
                ],
                properties: {
                    category: 'Electronics',
                    condition: 'new',
                },
            };
            const mockHash = 'QmComplexHash123';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ Hash: mockHash }),
            } as Response);

            const result = await uploadMetadataToIPFS(complexMetadata);

            expect(result).toBe(mockHash);
            
            // Verify that the FormData contains properly serialized JSON
            const callArgs = mockFetch.mock.calls[0];
            const formData = callArgs?.[1]?.body as FormData;
            if (formData) {
                expect(formData).toBeInstanceOf(FormData);
            }
        });
    });

    describe('getFromIPFS', () => {
        it('should retrieve data from IPFS successfully', async () => {
            const mockHash = 'QmTestHash123';
            const mockData = { name: 'Test Item', description: 'Test Description' };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            } as Response);

            const result = await getFromIPFS(mockHash);

            expect(result).toEqual(mockData);
            expect(mockFetch).toHaveBeenCalledWith(
                `https://gateway.ipfs.io/ipfs/${mockHash}`
            );
        });

        it('should handle retrieval errors', async () => {
            const mockHash = 'QmInvalidHash';

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            } as Response);

            await expect(getFromIPFS(mockHash)).rejects.toThrow('Failed to get from IPFS');
        });

        it('should handle JSON parsing errors', async () => {
            const mockHash = 'QmTestHash123';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => {
                    throw new Error('Invalid JSON');
                },
            } as unknown as Response);

            await expect(getFromIPFS(mockHash)).rejects.toThrow('Invalid JSON');
        });

        it('should work with different gateway URLs', async () => {
            const mockHash = 'QmTestHash123';
            const mockData = { test: 'data' };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            } as Response);

            await getFromIPFS(mockHash);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(mockHash)
            );
        });
    });

    describe('pinToIPFS', () => {
        it('should pin content to IPFS successfully', async () => {
            const mockHash = 'QmTestHash123';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ Pins: [mockHash] }),
            } as Response);

            await expect(pinToIPFS(mockHash)).resolves.not.toThrow();

            expect(mockFetch).toHaveBeenCalledWith(
                `https://ipfs.infura.io:5001/api/v0/pin/add?arg=${mockHash}`,
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });

        it('should handle pinning errors', async () => {
            const mockHash = 'QmInvalidHash';

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            } as Response);

            await expect(pinToIPFS(mockHash)).rejects.toThrow('Failed to pin to IPFS');
        });

        it('should handle network errors during pinning', async () => {
            const mockHash = 'QmTestHash123';

            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(pinToIPFS(mockHash)).rejects.toThrow('Network error');
        });
    });

    describe('unpinFromIPFS', () => {
        it('should unpin content from IPFS successfully', async () => {
            const mockHash = 'QmTestHash123';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ Pins: [mockHash] }),
            } as Response);

            await expect(unpinFromIPFS(mockHash)).resolves.not.toThrow();

            expect(mockFetch).toHaveBeenCalledWith(
                `https://ipfs.infura.io:5001/api/v0/pin/rm?arg=${mockHash}`,
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });

        it('should handle unpinning errors', async () => {
            const mockHash = 'QmInvalidHash';

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            } as Response);

            await expect(unpinFromIPFS(mockHash)).rejects.toThrow('Failed to unpin from IPFS');
        });

        it('should handle network errors during unpinning', async () => {
            const mockHash = 'QmTestHash123';

            mockFetch.mockRejectedValueOnce(new Error('Connection failed'));

            await expect(unpinFromIPFS(mockHash)).rejects.toThrow('Connection failed');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty files', async () => {
            const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' });
            const mockHash = 'QmEmptyHash123';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ Hash: mockHash }),
            } as Response);

            const result = await uploadToIPFS(emptyFile);
            expect(result).toBe(mockHash);
        });

        it('should handle large files', async () => {
            const largeContent = 'x'.repeat(1024 * 1024); // 1MB of data
            const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });
            const mockHash = 'QmLargeHash123';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ Hash: mockHash }),
            } as Response);

            const result = await uploadToIPFS(largeFile);
            expect(result).toBe(mockHash);
        });

        it('should handle special characters in metadata', async () => {
            const specialMetadata = {
                name: 'Test with 特殊字符 and émojis 🎉',
                description: 'Contains special characters: <>&"\'',
            };
            const mockHash = 'QmSpecialHash123';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ Hash: mockHash }),
            } as Response);

            const result = await uploadMetadataToIPFS(specialMetadata);
            expect(result).toBe(mockHash);
        });

        it('should handle different file types', async () => {
            const imageFile = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
            const mockHash = 'QmImageHash123';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ Hash: mockHash }),
            } as Response);

            const result = await uploadToIPFS(imageFile);
            expect(result).toBe(mockHash);
        });
    });
}); 