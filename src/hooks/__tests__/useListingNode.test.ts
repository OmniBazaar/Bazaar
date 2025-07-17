import { renderHook, waitFor } from '@testing-library/react';
import { useListingNode } from '../useListingNode';

// Mock dependencies
jest.mock('@omniwallet/react', () => ({
    useWallet: jest.fn(),
}));

import { useWallet } from '@omniwallet/react';
const mockUseWallet = useWallet as jest.Mock;

describe('useListingNode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with correct default state', () => {
        mockUseWallet.mockReturnValue({ account: null });

        const { result } = renderHook(() => useListingNode());

        expect(result.current.listingNode).toBe(null);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should start loading when wallet account is provided', () => {
        mockUseWallet.mockReturnValue({ 
            account: { address: '0x123456789' } 
        });

        const { result } = renderHook(() => useListingNode());

        expect(result.current.isLoading).toBe(true);
    });

    it('should successfully connect to listing node', async () => {
        mockUseWallet.mockReturnValue({ 
            account: { address: '0x123456789' } 
        });

        const { result } = renderHook(() => useListingNode());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.listingNode).toEqual({
            address: '0x1234567890123456789012345678901234567890',
            ipfsGateway: 'https://ipfs.infura.io:5001',
            reputation: 100,
            status: 'active',
            lastSeen: expect.any(Number),
        });
        expect(result.current.error).toBe(null);
    });

    it('should not attempt connection when wallet is not connected', async () => {
        mockUseWallet.mockReturnValue({ account: null });

        const { result } = renderHook(() => useListingNode());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.listingNode).toBe(null);
        expect(result.current.error).toBe(null);
    });

    it('should update when wallet account changes', async () => {
        const { result, rerender } = renderHook(() => useListingNode());

        // Initially no wallet
        mockUseWallet.mockReturnValue({ account: null });
        rerender();

        expect(result.current.listingNode).toBe(null);
        expect(result.current.isLoading).toBe(false);

        // Wallet connects
        mockUseWallet.mockReturnValue({ 
            account: { address: '0x123456789' } 
        });
        rerender();

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.listingNode).toBeTruthy();
        });
    });

    it('should handle different wallet addresses', async () => {
        const walletAddresses = [
            '0x123456789',
            '0x987654321',
            '0xabcdefghi'
        ];

        for (const address of walletAddresses) {
            mockUseWallet.mockReturnValue({ 
                account: { address } 
            });

            const { result } = renderHook(() => useListingNode());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.listingNode).toEqual({
                address: '0x1234567890123456789012345678901234567890',
                ipfsGateway: 'https://ipfs.infura.io:5001',
                reputation: 100,
                status: 'active',
                lastSeen: expect.any(Number),
            });
        }
    });

    it('should provide consistent listing node data', async () => {
        mockUseWallet.mockReturnValue({ 
            account: { address: '0x123456789' } 
        });

        const { result: result1 } = renderHook(() => useListingNode());
        const { result: result2 } = renderHook(() => useListingNode());

        await waitFor(() => {
            expect(result1.current.isLoading).toBe(false);
            expect(result2.current.isLoading).toBe(false);
        });

        expect(result1.current.listingNode?.address).toBe(result2.current.listingNode?.address);
        expect(result1.current.listingNode?.ipfsGateway).toBe(result2.current.listingNode?.ipfsGateway);
        expect(result1.current.listingNode?.reputation).toBe(result2.current.listingNode?.reputation);
        expect(result1.current.listingNode?.status).toBe(result2.current.listingNode?.status);
    });

    it('should handle edge case with invalid account object', async () => {
        mockUseWallet.mockReturnValue({ 
            account: {} // Missing address
        });

        const { result } = renderHook(() => useListingNode());

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.listingNode).toBeTruthy();
        expect(result.current.error).toBe(null);
    });

    it('should maintain referential stability for null states', () => {
        mockUseWallet.mockReturnValue({ account: null });

        const { result, rerender } = renderHook(() => useListingNode());

        const firstRender = {
            listingNode: result.current.listingNode,
            error: result.current.error,
        };

        rerender();

        expect(result.current.listingNode).toBe(firstRender.listingNode);
        expect(result.current.error).toBe(firstRender.error);
    });

    it('should work with different wallet hook return formats', async () => {
        // Test with account as direct object
        mockUseWallet.mockReturnValue({ 
            account: '0x123456789' 
        });

        const { result } = renderHook(() => useListingNode());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.listingNode).toBeTruthy();
    });

    it('should handle rapid wallet changes', async () => {
        const { result, rerender } = renderHook(() => useListingNode());

        // Rapid succession of wallet changes
        mockUseWallet.mockReturnValue({ account: null });
        rerender();

        mockUseWallet.mockReturnValue({ account: { address: '0x111' } });
        rerender();

        mockUseWallet.mockReturnValue({ account: null });
        rerender();

        mockUseWallet.mockReturnValue({ account: { address: '0x222' } });
        rerender();

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.listingNode).toBeTruthy();
    });

    it('should provide valid IPFS gateway URL', async () => {
        mockUseWallet.mockReturnValue({ 
            account: { address: '0x123456789' } 
        });

        const { result } = renderHook(() => useListingNode());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const ipfsGateway = result.current.listingNode?.ipfsGateway;
        expect(ipfsGateway).toMatch(/^https?:\/\/.+/);
        expect(ipfsGateway).toContain('ipfs');
    });

    it('should provide realistic node status', async () => {
        mockUseWallet.mockReturnValue({ 
            account: { address: '0x123456789' } 
        });

        const { result } = renderHook(() => useListingNode());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(['active', 'inactive']).toContain(result.current.listingNode?.status);
        expect(result.current.listingNode?.reputation).toBeGreaterThanOrEqual(0);
        expect(result.current.listingNode?.reputation).toBeLessThanOrEqual(100);
    });

    it('should provide recent lastSeen timestamp', async () => {
        const testStartTime = Date.now();
        
        mockUseWallet.mockReturnValue({ 
            account: { address: '0x123456789' } 
        });

        const { result } = renderHook(() => useListingNode());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const lastSeen = result.current.listingNode?.lastSeen;
        expect(lastSeen).toBeGreaterThanOrEqual(testStartTime);
        expect(lastSeen).toBeLessThanOrEqual(Date.now());
    });

    it('should handle wallet hook errors gracefully', async () => {
        // Mock wallet hook to throw an error
        mockUseWallet.mockImplementation(() => {
            throw new Error('Wallet hook error');
        });

        expect(() => {
            renderHook(() => useListingNode());
        }).not.toThrow();
    });

    it('should clean up properly on unmount', async () => {
        mockUseWallet.mockReturnValue({ 
            account: { address: '0x123456789' } 
        });

        const { result, unmount } = renderHook(() => useListingNode());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(() => {
            unmount();
        }).not.toThrow();
    });

    it('should work with undefined account', async () => {
        mockUseWallet.mockReturnValue({ 
            account: undefined 
        });

        const { result } = renderHook(() => useListingNode());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.listingNode).toBe(null);
        expect(result.current.error).toBe(null);
    });
}); 