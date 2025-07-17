import { renderHook, waitFor } from '@testing-library/react';
import { useTransfer } from '../useTransfer';

// Mock dependencies
jest.mock('@omniwallet/react', () => ({
    useWallet: jest.fn(),
}));

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock API
const mockApiPost = jest.fn();
jest.mock('../../api', () => ({
    api: {
        post: mockApiPost,
    },
}));

import { useWallet } from '@omniwallet/react';
const mockUseWallet = useWallet as jest.Mock;

describe('useTransfer', () => {
    const mockSignTransaction = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseWallet.mockReturnValue({
            signTransaction: mockSignTransaction,
        });
    });

    it('should initialize with correct default state', () => {
        const { result } = renderHook(() => useTransfer());

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(typeof result.current.initiatePurchase).toBe('function');
        expect(typeof result.current.transfer).toBe('function');
    });

    describe('initiatePurchase', () => {
        const mockPurchaseParams = {
            listingId: 'listing-123',
            quantity: 2,
            buyerAddress: '0x123456789',
        };

        it('should successfully initiate a purchase', async () => {
            const mockTransaction = { to: '0xabc', value: '1000' };
            const mockPurchaseResponse = {
                data: {
                    id: 'purchase-123',
                    transaction: mockTransaction,
                },
            };
            const mockConfirmResponse = { data: { success: true } };
            const mockSignedTx = 'signed-transaction-data';

            mockApiPost
                .mockResolvedValueOnce(mockPurchaseResponse)
                .mockResolvedValueOnce(mockConfirmResponse);
            mockSignTransaction.mockResolvedValue(mockSignedTx);

            const { result } = renderHook(() => useTransfer());

            const purchaseResult = await result.current.initiatePurchase(mockPurchaseParams);

            expect(mockApiPost).toHaveBeenCalledWith('/purchases', mockPurchaseParams);
            expect(mockSignTransaction).toHaveBeenCalledWith(mockTransaction);
            expect(mockApiPost).toHaveBeenCalledWith('/purchases/confirm', {
                purchaseId: 'purchase-123',
                signedTransaction: mockSignedTx,
            });
            expect(purchaseResult).toEqual(mockPurchaseResponse.data);
        });

        it('should set loading state during purchase', async () => {
            let resolveApiCall: (value: any) => void;
            const apiPromise = new Promise(resolve => {
                resolveApiCall = resolve;
            });

            mockApiPost.mockReturnValue(apiPromise);

            const { result } = renderHook(() => useTransfer());

            const purchasePromise = result.current.initiatePurchase(mockPurchaseParams);

            expect(result.current.loading).toBe(true);

            resolveApiCall!({
                data: {
                    id: 'purchase-123',
                    transaction: { to: '0xabc', value: '1000' },
                },
            });

            mockSignTransaction.mockResolvedValue('signed-tx');
            mockApiPost.mockResolvedValue({ data: { success: true } });

            await purchasePromise;

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });

        it('should handle purchase API errors', async () => {
            const error = new Error('API error');
            mockApiPost.mockRejectedValue(error);

            const { result } = renderHook(() => useTransfer());

            await expect(result.current.initiatePurchase(mockPurchaseParams))
                .rejects.toThrow('API error');

            expect(result.current.error).toEqual(error);
            expect(result.current.loading).toBe(false);
        });

        it('should handle signing errors', async () => {
            const mockTransaction = { to: '0xabc', value: '1000' };
            const mockPurchaseResponse = {
                data: {
                    id: 'purchase-123',
                    transaction: mockTransaction,
                },
            };

            mockApiPost.mockResolvedValue(mockPurchaseResponse);
            const signingError = new Error('Signing failed');
            mockSignTransaction.mockRejectedValue(signingError);

            const { result } = renderHook(() => useTransfer());

            await expect(result.current.initiatePurchase(mockPurchaseParams))
                .rejects.toThrow('Signing failed');

            expect(result.current.error).toEqual(signingError);
        });

        it('should handle confirmation errors', async () => {
            const mockTransaction = { to: '0xabc', value: '1000' };
            const mockPurchaseResponse = {
                data: {
                    id: 'purchase-123',
                    transaction: mockTransaction,
                },
            };
            const mockSignedTx = 'signed-transaction-data';

            mockApiPost
                .mockResolvedValueOnce(mockPurchaseResponse)
                .mockRejectedValueOnce(new Error('Confirmation failed'));
            mockSignTransaction.mockResolvedValue(mockSignedTx);

            const { result } = renderHook(() => useTransfer());

            await expect(result.current.initiatePurchase(mockPurchaseParams))
                .rejects.toThrow('Confirmation failed');
        });

        it('should reset error state on successful purchase', async () => {
            const { result } = renderHook(() => useTransfer());

            // First, cause an error
            mockApiPost.mockRejectedValue(new Error('First error'));
            
            try {
                await result.current.initiatePurchase(mockPurchaseParams);
            } catch {
                // Expected to fail
            }

            expect(result.current.error).toBeTruthy();

            // Now make a successful call
            const mockTransaction = { to: '0xabc', value: '1000' };
            const mockPurchaseResponse = {
                data: {
                    id: 'purchase-123',
                    transaction: mockTransaction,
                },
            };
            const mockSignedTx = 'signed-transaction-data';

            mockApiPost
                .mockResolvedValueOnce(mockPurchaseResponse)
                .mockResolvedValueOnce({ data: { success: true } });
            mockSignTransaction.mockResolvedValue(mockSignedTx);

            await result.current.initiatePurchase(mockPurchaseParams);

            expect(result.current.error).toBe(null);
        });
    });

    describe('transfer', () => {
        const mockTransferParams = {
            toAddress: '0x987654321',
            amount: 50,
            currency: 'omnicoin' as const,
        };

        it('should successfully complete a transfer', async () => {
            const mockTransaction = { to: '0xdef', value: '5000' };
            const mockTransferResponse = {
                data: {
                    id: 'transfer-123',
                    transaction: mockTransaction,
                },
            };
            const mockConfirmResponse = { data: { success: true } };
            const mockSignedTx = 'signed-transfer-data';

            mockApiPost
                .mockResolvedValueOnce(mockTransferResponse)
                .mockResolvedValueOnce(mockConfirmResponse);
            mockSignTransaction.mockResolvedValue(mockSignedTx);

            const { result } = renderHook(() => useTransfer());

            const transferResult = await result.current.transfer(mockTransferParams);

            expect(mockApiPost).toHaveBeenCalledWith('/transfers', mockTransferParams);
            expect(mockSignTransaction).toHaveBeenCalledWith(mockTransaction);
            expect(mockApiPost).toHaveBeenCalledWith('/transfers/confirm', {
                transferId: 'transfer-123',
                signedTransaction: mockSignedTx,
            });
            expect(transferResult).toEqual(mockTransferResponse.data);
        });

        it('should handle different currency types', async () => {
            const bitcoinTransferParams = {
                toAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
                amount: 0.001,
                currency: 'bitcoin' as const,
            };

            const mockTransaction = { to: '0xdef', value: '100000' };
            const mockTransferResponse = {
                data: {
                    id: 'transfer-bitcoin',
                    transaction: mockTransaction,
                },
            };

            mockApiPost.mockResolvedValueOnce(mockTransferResponse);
            mockApiPost.mockResolvedValueOnce({ data: { success: true } });
            mockSignTransaction.mockResolvedValue('signed-bitcoin-tx');

            const { result } = renderHook(() => useTransfer());

            await result.current.transfer(bitcoinTransferParams);

            expect(mockApiPost).toHaveBeenCalledWith('/transfers', bitcoinTransferParams);
        });

        it('should set loading state during transfer', async () => {
            let resolveApiCall: (value: any) => void;
            const apiPromise = new Promise(resolve => {
                resolveApiCall = resolve;
            });

            mockApiPost.mockReturnValue(apiPromise);

            const { result } = renderHook(() => useTransfer());

            const transferPromise = result.current.transfer(mockTransferParams);

            expect(result.current.loading).toBe(true);

            resolveApiCall!({
                data: {
                    id: 'transfer-123',
                    transaction: { to: '0xdef', value: '5000' },
                },
            });

            mockSignTransaction.mockResolvedValue('signed-tx');
            mockApiPost.mockResolvedValue({ data: { success: true } });

            await transferPromise;

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });

        it('should handle transfer errors', async () => {
            const error = new Error('Transfer failed');
            mockApiPost.mockRejectedValue(error);

            const { result } = renderHook(() => useTransfer());

            await expect(result.current.transfer(mockTransferParams))
                .rejects.toThrow('Transfer failed');

            expect(result.current.error).toEqual(error);
            expect(result.current.loading).toBe(false);
        });

        it('should handle large amounts correctly', async () => {
            const largeTransferParams = {
                toAddress: '0x987654321',
                amount: 1000000,
                currency: 'ethereum' as const,
            };

            const mockTransaction = { to: '0xdef', value: '1000000000000000000000000' };
            const mockTransferResponse = {
                data: {
                    id: 'transfer-large',
                    transaction: mockTransaction,
                },
            };

            mockApiPost.mockResolvedValueOnce(mockTransferResponse);
            mockApiPost.mockResolvedValueOnce({ data: { success: true } });
            mockSignTransaction.mockResolvedValue('signed-large-tx');

            const { result } = renderHook(() => useTransfer());

            const transferResult = await result.current.transfer(largeTransferParams);

            expect(transferResult).toEqual(mockTransferResponse.data);
        });
    });

    describe('error handling', () => {
        it('should provide descriptive error messages', async () => {
            const { result } = renderHook(() => useTransfer());

            mockApiPost.mockRejectedValue(new Error('Network error'));

            try {
                await result.current.initiatePurchase({
                    listingId: 'test',
                    quantity: 1,
                    buyerAddress: '0x123',
                });
            } catch {
                // Expected to fail
            }

            expect(result.current.error?.message).toBe('Network error');
        });

        it('should handle generic errors gracefully', async () => {
            const { result } = renderHook(() => useTransfer());

            mockApiPost.mockRejectedValue('String error');

            try {
                await result.current.transfer({
                    toAddress: '0x123',
                    amount: 10,
                    currency: 'omnicoin',
                });
            } catch {
                // Expected to fail
            }

            expect(result.current.error?.message).toBe('Failed to transfer');
        });
    });

    describe('wallet integration', () => {
        it('should work with different wallet implementations', async () => {
            const customSignTransaction = jest.fn().mockResolvedValue('custom-signature');
            
            mockUseWallet.mockReturnValue({
                signTransaction: customSignTransaction,
            });

            const { result } = renderHook(() => useTransfer());

            const mockTransaction = { to: '0xabc', value: '1000' };
            mockApiPost
                .mockResolvedValueOnce({
                    data: { id: 'purchase-123', transaction: mockTransaction },
                })
                .mockResolvedValueOnce({ data: { success: true } });

            await result.current.initiatePurchase({
                listingId: 'test',
                quantity: 1,
                buyerAddress: '0x123',
            });

            expect(customSignTransaction).toHaveBeenCalledWith(mockTransaction);
        });

        it('should handle wallet connection issues', async () => {
            mockUseWallet.mockReturnValue({
                signTransaction: jest.fn().mockRejectedValue(new Error('Wallet not connected')),
            });

            const { result } = renderHook(() => useTransfer());

            mockApiPost.mockResolvedValue({
                data: { id: 'purchase-123', transaction: { to: '0xabc', value: '1000' } },
            });

            await expect(result.current.initiatePurchase({
                listingId: 'test',
                quantity: 1,
                buyerAddress: '0x123',
            })).rejects.toThrow('Wallet not connected');
        });
    });
}); 