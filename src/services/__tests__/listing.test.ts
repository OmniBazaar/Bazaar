import { createListing, updateListing, getListing, createListingTransaction } from '../listing';
import { ListingMetadata, ListingNode } from '../../types/listing';
import { ethers } from 'ethers';

// Mock dependencies
jest.mock('../ipfs', () => ({
    uploadToIPFS: jest.fn(),
    uploadMetadataToIPFS: jest.fn(),
    getFromIPFS: jest.fn(),
}));

jest.mock('ethers', () => ({
    ethers: {
        Contract: jest.fn(),
        utils: {
            parseEther: jest.fn(),
        },
    },
}));

// Import mocked modules
import * as ipfsModule from '../ipfs';

const mockUploadToIPFS = ipfsModule.uploadToIPFS as jest.Mock;
const mockUploadMetadataToIPFS = ipfsModule.uploadMetadataToIPFS as jest.Mock;
const mockGetFromIPFS = ipfsModule.getFromIPFS as jest.Mock;

// Mock ethers as any to access mock implementations
const mockEthers = ethers as any;

describe('listing service', () => {
    const mockListingNode: ListingNode = {
        address: '0x1234567890123456789012345678901234567890',
        ipfsGateway: 'https://ipfs.infura.io:5001',
        reputation: 100,
        status: 'active',
        lastSeen: Date.now()
    };

    const mockListingMetadata: Omit<ListingMetadata, 'blockchainData'> = {
        title: 'Test Product',
        description: 'Test description',
        type: 'product',
        price: 100,
        currency: 'USD',
        category: 'Electronics',
        tags: ['test', 'electronics'],
        images: [],
        location: {
            country: 'USA',
            city: 'New York'
        },
        seller: {
            id: 'seller-1',
            name: 'Test Seller',
            avatar: 'https://example.com/avatar.jpg',
            rating: 4.5,
            contactInfo: {
                email: 'seller@example.com',
                phone: '+1234567890'
            }
        },
        status: 'active'
    };

    const mockImages: File[] = [
        new File(['image1'], 'image1.jpg', { type: 'image/jpeg' }),
        new File(['image2'], 'image2.jpg', { type: 'image/jpeg' }),
    ];

    // Create a proper mock contract that satisfies ethers.Contract interface
    const createMockContract = (overrides: Record<string, jest.Mock> = {}) => ({
        createListing: jest.fn(),
        updateListing: jest.fn(),
        getListing: jest.fn(),
        getListingCount: jest.fn(),
        ...overrides,
        // Add minimal properties to satisfy ethers.Contract interface
        address: '0x1234567890123456789012345678901234567890',
        interface: {},
        signer: {},
        provider: {},
    } as unknown as ethers.Contract);

    const mockDependencies = {
        contract: createMockContract(),
        signer: {
            getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        } as unknown as ethers.Signer,
        account: '0x1234567890123456789012345678901234567890',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUploadToIPFS.mockResolvedValue('QmTest123');
        mockUploadMetadataToIPFS.mockResolvedValue('QmMetadata123');
        mockGetFromIPFS.mockResolvedValue(mockListingMetadata);

        const mockContract = createMockContract();
        mockEthers.Contract.mockImplementation(() => mockContract);
    });

    describe('createListing', () => {
        it('should create a listing successfully', async () => {
            const mockContract = createMockContract({
                createListing: jest.fn().mockResolvedValue({
                    wait: jest.fn().mockResolvedValue({
                        events: [{ args: { tokenId: { toString: () => '1' } } }]
                    })
                })
            });

            const deps = { ...mockDependencies, contract: mockContract };
            const result = await createListing(mockListingMetadata, mockImages, mockListingNode, deps);

            expect(result).toBe('1');
            expect(mockUploadToIPFS).toHaveBeenCalledTimes(2);
            expect(mockUploadMetadataToIPFS).toHaveBeenCalledWith(expect.objectContaining({
                title: mockListingMetadata.title,
                description: mockListingMetadata.description,
            }));
            expect(mockContract['createListing']).toHaveBeenCalled();
        });

        it('should handle image upload errors', async () => {
            mockUploadToIPFS.mockRejectedValue(new Error('Upload failed'));

            await expect(
                createListing(mockListingMetadata, mockImages, mockListingNode, mockDependencies)
            ).rejects.toThrow('Upload failed');
        });

        it('should handle metadata upload errors', async () => {
            mockUploadMetadataToIPFS.mockRejectedValue(new Error('Metadata upload failed'));

            await expect(
                createListing(mockListingMetadata, mockImages, mockListingNode, mockDependencies)
            ).rejects.toThrow('Metadata upload failed');
        });

        it('should handle contract errors', async () => {
            const mockContract = createMockContract({
                createListing: jest.fn().mockRejectedValue(new Error('Contract error'))
            });

            const deps = { ...mockDependencies, contract: mockContract };
            await expect(
                createListing(mockListingMetadata, mockImages, mockListingNode, deps)
            ).rejects.toThrow('Contract error');
        });
    });

    describe('updateListing', () => {
        it('should update a listing successfully', async () => {
            const mockContract = createMockContract({
                updateListing: jest.fn().mockResolvedValue({
                    wait: jest.fn().mockResolvedValue({})
                })
            });

            const deps = { ...mockDependencies, contract: mockContract };
            const partialMetadata = { title: 'Updated Title' };
            const newImages = [new File(['new'], 'new.jpg', { type: 'image/jpeg' })];

            await updateListing('1', partialMetadata, newImages, deps);

            expect(mockUploadToIPFS).toHaveBeenCalledWith(newImages[0]);
            expect(mockContract['updateListing']).toHaveBeenCalled();
        });

        it('should handle update errors', async () => {
            const mockContract = createMockContract({
                updateListing: jest.fn().mockRejectedValue(new Error('Update failed'))
            });

            const deps = { ...mockDependencies, contract: mockContract };
            await expect(
                updateListing('1', { title: 'Updated' }, [], deps)
            ).rejects.toThrow('Update failed');
        });
    });

    describe('getListing', () => {
        it('should get a listing successfully', async () => {
            const mockContract = createMockContract({
                getListing: jest.fn().mockResolvedValue({
                    tokenId: '1',
                    metadataHash: 'QmMetadata123',
                    seller: '0x1234567890123456789012345678901234567890',
                    price: '100',
                    isActive: true,
                })
            });

            const deps = { ...mockDependencies, contract: mockContract };
            const result = await getListing('1', deps);

            expect(result).toEqual(expect.objectContaining({
                title: mockListingMetadata.title,
                description: mockListingMetadata.description,
            }));
            expect(mockGetFromIPFS).toHaveBeenCalledWith('QmMetadata123');
        });

        it('should handle metadata retrieval errors', async () => {
            const mockContract = createMockContract({
                getListing: jest.fn().mockResolvedValue({
                    tokenId: '1',
                    metadataHash: 'QmMetadata123',
                    seller: '0x1234567890123456789012345678901234567890',
                    price: '100',
                    isActive: true,
                })
            });

            const deps = { ...mockDependencies, contract: mockContract };
            mockGetFromIPFS.mockRejectedValue(new Error('IPFS error'));

            await expect(getListing('1', deps)).rejects.toThrow('IPFS error');
        });
    });

    describe('createListingTransaction', () => {
        it('should create a transaction successfully', async () => {
            const mockContract = createMockContract({
                createTransaction: jest.fn().mockResolvedValue({
                    wait: jest.fn().mockResolvedValue({
                        events: [{ args: { transactionId: { toString: () => 'tx1' } } }]
                    })
                })
            });

            const deps = { ...mockDependencies, contract: mockContract };
            const result = await createListingTransaction('1', '0xbuyer', 1, deps);

            expect(result).toEqual(expect.objectContaining({
                listingId: '1',
                buyer: '0xbuyer',
                quantity: 1,
            }));
        });

        it('should handle transaction creation errors', async () => {
            const mockContract = createMockContract({
                createTransaction: jest.fn().mockRejectedValue(new Error('Transaction failed'))
            });

            const deps = { ...mockDependencies, contract: mockContract };
            await expect(
                createListingTransaction('1', '0xbuyer', 1, deps)
            ).rejects.toThrow('Transaction failed');
        });

        it('should validate quantity parameter', async () => {
            await expect(
                createListingTransaction('1', '0xbuyer', 0, mockDependencies)
            ).rejects.toThrow('Invalid quantity');
        });

        it('should handle parseEther correctly', async () => {
            const mockContract = createMockContract({
                getListing: jest.fn().mockResolvedValue({
                    tokenId: '1',
                    metadataHash: 'QmMetadata123',
                    seller: '0x1234567890123456789012345678901234567890',
                    price: '100',
                    isActive: true,
                }),
                createTransaction: jest.fn().mockResolvedValue({
                    wait: jest.fn().mockResolvedValue({
                        events: [{ args: { transactionId: { toString: () => 'tx1' } } }]
                    })
                })
            });

            mockEthers.utils.parseEther.mockReturnValue({
                toString: () => '100000000000000000000'
            });

            const deps = { ...mockDependencies, contract: mockContract };
            const result = await createListingTransaction('1', '0xbuyer', 1, deps);

            expect(result).toEqual(expect.objectContaining({
                listingId: '1',
                buyer: '0xbuyer',
                quantity: 1,
            }));
        });

        it('should handle missing listing', async () => {
            const mockContract = createMockContract({
                getListing: jest.fn().mockResolvedValue(null)
            });

            const deps = { ...mockDependencies, contract: mockContract };
            await expect(
                createListingTransaction('999', '0xbuyer', 1, deps)
            ).rejects.toThrow('Listing not found');
        });
    });
}); 