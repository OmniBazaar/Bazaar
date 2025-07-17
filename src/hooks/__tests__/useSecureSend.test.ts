import { renderHook, waitFor } from '@testing-library/react';
import { useSecureSend } from '../useSecureSend';

// Create mock contract instance
const mockContract = {
    createEscrow: jest.fn(),
    vote: jest.fn(),
    getEscrowDetails: jest.fn(),
    extendExpirationTime: jest.fn(),
};

// Mock ethers
const mockEthers = {
    Contract: jest.fn().mockImplementation(() => mockContract),
    utils: {
        parseEther: jest.fn((value) => `${value}_parsed`),
        formatEther: jest.fn((value) => value.toString()),
    }
};

jest.mock('ethers', () => ({
    ethers: mockEthers
}));

// Mock wallet hook based on actual Wallet module patterns
const mockSigner = {
    sendTransaction: jest.fn(),
    signMessage: jest.fn(),
    getAddress: jest.fn(() => '0x123456789')
};

const mockWallet = {
    account: '0x123456789', // useSecureSend expects 'account' property
    address: '0x123456789', // some wallet implementations use 'address'
    provider: {
        getSigner: jest.fn(() => mockSigner)
    },
    signer: mockSigner,
    signTransaction: jest.fn(), // useSecureSend expects 'signTransaction' function
    connect: jest.fn(),
    isConnected: true,
    chainId: 1
};

const mockUseWallet = jest.fn(() => mockWallet);

// Mock the wallet module that doesn't exist yet - this will be the actual Wallet integration
jest.mock('@omniwallet/react', () => ({
    useWallet: mockUseWallet
}), { virtual: true });

// Mock toast notifications
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        warning: jest.fn(),
        info: jest.fn(),
    }
}));

describe('useSecureSend', () => {
    const mockCreateEscrowParams = {
        sellerAddress: '0x987654321',
        escrowAgent: '0x111111111',
        amount: '100',
        expirationTime: 86400, // 1 day in seconds
        listingId: 'listing-123',
    };

    const mockEscrowDetails = {
        buyer: '0x123456789',
        seller: '0x987654321',
        escrowAgent: '0x111111111',
        amount: '100',
        expirationTime: 86400,
        isReleased: false,
        isRefunded: false,
        positiveVotes: 1,
        negativeVotes: 0,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset mock wallet
        mockUseWallet.mockReturnValue(mockWallet);
    });

    it('should return initial state', () => {
        const { result } = renderHook(() => useSecureSend());

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(typeof result.current.createEscrow).toBe('function');
        expect(typeof result.current.vote).toBe('function');
        expect(typeof result.current.getEscrowDetails).toBe('function');
        expect(typeof result.current.extendExpirationTime).toBe('function');
    });

    it('should create escrow successfully', async () => {
        const { result } = renderHook(() => useSecureSend());

        const mockTransaction = {
            hash: '0xtxhash123',
            wait: jest.fn().mockResolvedValue({
                transactionHash: '0xtxhash123',
                events: [{
                    event: 'EscrowCreated',
                    args: {
                        escrowId: '0xescrow123'
                    }
                }]
            })
        };

        mockContract.createEscrow.mockResolvedValue(mockTransaction);
        mockWallet.signTransaction.mockResolvedValue(mockTransaction);

        const escrowId = await result.current.createEscrow(mockCreateEscrowParams);

        expect(escrowId).toBe('0xescrow123');
        expect(mockContract.createEscrow).toHaveBeenCalledWith(
            mockCreateEscrowParams.sellerAddress,
            mockCreateEscrowParams.escrowAgent,
            '100_parsed', // mocked parseEther result
            expect.any(Number) // timestamp + expirationTime
        );
    });

    it('should handle create escrow error', async () => {
        const { result } = renderHook(() => useSecureSend());

        mockContract.createEscrow.mockRejectedValue(new Error('Transaction failed'));

        await expect(result.current.createEscrow(mockCreateEscrowParams))
            .rejects.toThrow('Transaction failed');

        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
            expect(result.current.loading).toBe(false);
        });
    });

    it('should vote on escrow successfully', async () => {
        const { result } = renderHook(() => useSecureSend());

        const mockTransaction = {
            hash: '0xvote123',
            wait: jest.fn().mockResolvedValue({
                transactionHash: '0xvote123',
            })
        };

        mockContract.vote.mockResolvedValue(mockTransaction);
        mockWallet.signTransaction.mockResolvedValue(mockTransaction);

        await result.current.vote('escrow-1', true);

        expect(mockContract.vote).toHaveBeenCalledWith('escrow-1', true);
    });

    it('should handle vote error', async () => {
        const { result } = renderHook(() => useSecureSend());

        mockContract.vote.mockRejectedValue(new Error('Vote failed'));

        await expect(result.current.vote('escrow-1', true))
            .rejects.toThrow('Vote failed');

        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
            expect(result.current.loading).toBe(false);
        });
    });

    it('should get escrow details successfully', async () => {
        const { result } = renderHook(() => useSecureSend());

        mockContract.getEscrowDetails.mockResolvedValue([
            mockEscrowDetails.buyer,
            mockEscrowDetails.seller,
            mockEscrowDetails.escrowAgent,
            mockEscrowDetails.amount,
            mockEscrowDetails.expirationTime,
            mockEscrowDetails.isReleased,
            mockEscrowDetails.isRefunded,
            mockEscrowDetails.positiveVotes,
            mockEscrowDetails.negativeVotes,
        ]);

        const details = await result.current.getEscrowDetails('escrow-1');

        expect(details).toEqual(mockEscrowDetails);
        expect(mockContract.getEscrowDetails).toHaveBeenCalledWith('escrow-1');
    });

    it('should handle get escrow details error', async () => {
        const { result } = renderHook(() => useSecureSend());

        mockContract.getEscrowDetails.mockRejectedValue(new Error('Details not found'));

        await expect(result.current.getEscrowDetails('escrow-1'))
            .rejects.toThrow('Details not found');

        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
            expect(result.current.loading).toBe(false);
        });
    });

    it('should extend expiration time successfully', async () => {
        const { result } = renderHook(() => useSecureSend());

        const mockTransaction = {
            hash: '0xextend123',
            wait: jest.fn().mockResolvedValue({
                transactionHash: '0xextend123',
            })
        };

        mockContract.extendExpirationTime.mockResolvedValue(mockTransaction);
        mockWallet.signTransaction.mockResolvedValue(mockTransaction);

        await result.current.extendExpirationTime('escrow-1', 172800); // 2 days

        expect(mockContract.extendExpirationTime).toHaveBeenCalledWith('escrow-1', expect.any(Number));
    });

    it('should handle extend expiration time error', async () => {
        const { result } = renderHook(() => useSecureSend());

        mockContract.extendExpirationTime.mockRejectedValue(new Error('Extension failed'));

        await expect(result.current.extendExpirationTime('escrow-1', 172800))
            .rejects.toThrow('Extension failed');

        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
            expect(result.current.loading).toBe(false);
        });
    });

    it('should handle loading states correctly', async () => {
        const { result } = renderHook(() => useSecureSend());

        const mockTransaction = {
            hash: '0xdelay123',
            wait: jest.fn().mockResolvedValue({
                transactionHash: '0xdelay123',
                events: [{
                    event: 'EscrowCreated',
                    args: { escrowId: '0xdelayescrow' }
                }]
            })
        };

        mockContract.createEscrow.mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve(mockTransaction), 100))
        );
        mockWallet.signTransaction.mockResolvedValue(mockTransaction);

        // Start async operation
        const promise = result.current.createEscrow(mockCreateEscrowParams);

        // Loading should be true initially
        expect(result.current.loading).toBe(true);

        // Wait for completion
        await promise;

        // Loading should be false after completion
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it('should reset error state on successful operation', async () => {
        const { result } = renderHook(() => useSecureSend());
        
        // First operation fails
        mockContract.createEscrow.mockRejectedValueOnce(new Error('First error'));

        try {
            await result.current.createEscrow(mockCreateEscrowParams);
        } catch {
            // Expected error
        }

        // Error should be set
        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
        });

        // Second operation succeeds
        const successTransaction = {
            hash: '0xsuccess123',
            wait: jest.fn().mockResolvedValue({
                transactionHash: '0xsuccess123',
                events: [{
                    event: 'EscrowCreated',
                    args: { escrowId: '0xsuccessescrow' }
                }]
            })
        };

        mockContract.createEscrow.mockResolvedValueOnce(successTransaction);
        mockWallet.signTransaction.mockResolvedValue(successTransaction);

        await result.current.createEscrow(mockCreateEscrowParams);

        // Error should be cleared
        await waitFor(() => {
            expect(result.current.error).toBe(null);
        });
    });

    it('should handle missing wallet connection', async () => {
        // Mock wallet as not connected
        mockUseWallet.mockReturnValueOnce({
            account: null, // useSecureSend checks for account
            address: undefined,
            provider: undefined,
            signer: undefined,
            signTransaction: undefined,
            connect: jest.fn(),
            isConnected: false,
            chainId: null
        } as any);

        const { result } = renderHook(() => useSecureSend());

        await expect(result.current.createEscrow(mockCreateEscrowParams))
            .rejects.toThrow();
    });

    it('should handle positive and negative votes', async () => {
        const { result } = renderHook(() => useSecureSend());

        const mockTransaction = {
            hash: '0xvotepos',
            wait: jest.fn().mockResolvedValue({
                transactionHash: '0xvotepos',
            })
        };

        mockContract.vote.mockResolvedValue(mockTransaction);
        mockWallet.signTransaction.mockResolvedValue(mockTransaction);

        // Test positive vote
        await result.current.vote('escrow-1', true);
        expect(mockContract.vote).toHaveBeenCalledWith('escrow-1', true);

        // Test negative vote
        await result.current.vote('escrow-1', false);
        expect(mockContract.vote).toHaveBeenCalledWith('escrow-1', false);
    });

    it('should handle different amount formats', async () => {
        const { result } = renderHook(() => useSecureSend());

        const mockTransaction = {
            hash: '0xamount123',
            wait: jest.fn().mockResolvedValue({
                transactionHash: '0xamount123',
                events: [{
                    event: 'EscrowCreated',
                    args: { escrowId: '0xamountescrow' }
                }]
            })
        };

        mockContract.createEscrow.mockResolvedValue(mockTransaction);
        mockWallet.signTransaction.mockResolvedValue(mockTransaction);

        const params = {
            ...mockCreateEscrowParams,
            amount: '0.5', // Different amount format
        };

        await result.current.createEscrow(params);

        expect(mockContract.createEscrow).toHaveBeenCalledWith(
            params.sellerAddress,
            params.escrowAgent,
            '0.5_parsed',
            expect.any(Number) // timestamp + expirationTime
        );
    });

    it('should handle various expiration times', async () => {
        const { result } = renderHook(() => useSecureSend());

        const mockTransaction = {
            hash: '0xtime123',
            wait: jest.fn().mockResolvedValue({
                transactionHash: '0xtime123',
            })
        };

        mockContract.extendExpirationTime.mockResolvedValue(mockTransaction);
        mockWallet.signTransaction.mockResolvedValue(mockTransaction);

        // Test 1 week extension
        await result.current.extendExpirationTime('escrow-1', 604800); // 1 week
        expect(mockContract.extendExpirationTime).toHaveBeenCalledWith('escrow-1', expect.any(Number));

        // Test 1 month extension
        await result.current.extendExpirationTime('escrow-1', 2592000); // 30 days
        expect(mockContract.extendExpirationTime).toHaveBeenCalledWith('escrow-1', expect.any(Number));
    });
}); 