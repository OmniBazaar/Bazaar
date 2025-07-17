import { renderHook } from '@testing-library/react';
import { useContract } from '../useContract';

// Mock ethers
jest.mock('ethers', () => ({
    Contract: jest.fn().mockImplementation((address, abi, signer) => ({
        address,
        abi,
        signer,
        connect: jest.fn(),
        functions: {},
        // Mock some common contract methods
        balanceOf: jest.fn(),
        transfer: jest.fn(),
        approve: jest.fn(),
    })),
}));

describe('useContract', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    const mockAbi = [
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a contract instance', () => {
        const { result } = renderHook(() => useContract(mockAddress, mockAbi));
        
        expect(result.current).toBeDefined();
        expect(result.current).not.toBeNull();
        expect((result.current as any).address).toBe(mockAddress);
        expect((result.current as any).abi).toBe(mockAbi);
    });

    it('should handle valid address and ABI', () => {
        const { result } = renderHook(() => useContract(mockAddress, mockAbi));
        
        expect(result.current).toMatchObject({
            address: mockAddress,
            abi: mockAbi,
        });
    });

    it('should return the same contract instance for same inputs', () => {
        const { result, rerender } = renderHook(() => useContract(mockAddress, mockAbi));
        
        const firstResult = result.current;
        
        rerender();
        
        expect(result.current).toBe(firstResult);
    });

    it('should create new contract instance when address changes', () => {
        const { result, rerender } = renderHook(
            ({ address }) => useContract(address, mockAbi),
            { initialProps: { address: mockAddress } }
        );
        
        const firstResult = result.current;
        
        const newAddress = '0x9876543210987654321098765432109876543210';
        rerender({ address: newAddress });
        
        expect(result.current).not.toBe(firstResult);
        expect(result.current).not.toBeNull();
        expect((result.current as any).address).toBe(newAddress);
    });

    it('should create new contract instance when ABI changes', () => {
        const { result, rerender } = renderHook(
            ({ abi }) => useContract(mockAddress, abi),
            { initialProps: { abi: mockAbi } }
        );
        
        const firstResult = result.current;
        
        const newAbi = [
            {
                "inputs": [],
                "name": "name",
                "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        
        rerender({ abi: newAbi });
        
        expect(result.current).not.toBe(firstResult);
        expect(result.current).not.toBeNull();
        expect((result.current as any).abi).toBe(newAbi);
    });

    it('should handle empty ABI', () => {
        const emptyAbi: any[] = [];
        const { result } = renderHook(() => useContract(mockAddress, emptyAbi));
        
        expect(result.current).toBeDefined();
        expect(result.current).not.toBeNull();
        expect((result.current as any).abi).toBe(emptyAbi);
    });

    it('should work with different contract addresses', () => {
        const address1 = '0x1111111111111111111111111111111111111111';
        const address2 = '0x2222222222222222222222222222222222222222';
        
        const { result: result1 } = renderHook(() => useContract(address1, mockAbi));
        const { result: result2 } = renderHook(() => useContract(address2, mockAbi));
        
        expect(result1.current).not.toBeNull();
        expect(result2.current).not.toBeNull();
        expect((result1.current as any).address).toBe(address1);
        expect((result2.current as any).address).toBe(address2);
        expect(result1.current).not.toBe(result2.current);
    });

    it('should handle contract method calls', () => {
        const { result } = renderHook(() => useContract(mockAddress, mockAbi));
        
        expect(result.current).not.toBeNull();
        expect((result.current as any).balanceOf).toBeDefined();
        expect(typeof (result.current as any).balanceOf).toBe('function');
    });

    it('should maintain contract instance across re-renders with same props', () => {
        const { result, rerender } = renderHook(() => useContract(mockAddress, mockAbi));
        
        const originalContract = result.current;
        
        // Re-render multiple times
        rerender();
        rerender();
        rerender();
        
        expect(result.current).toBe(originalContract);
    });

    it('should handle undefined address gracefully', () => {
        const { result } = renderHook(() => useContract(undefined as any, mockAbi));
        
        expect(result.current).toBeDefined();
        expect((result.current as any).address).toBeUndefined();
    });

    it('should handle null ABI gracefully', () => {
        const { result } = renderHook(() => useContract(mockAddress, null as any));
        
        expect(result.current).toBeDefined();
        expect((result.current as any).abi).toBeNull();
    });

    it('should work with complex ABI', () => {
        const complexAbi = [
            {
                "inputs": [
                    {"internalType": "string", "name": "_name", "type": "string"},
                    {"internalType": "string", "name": "_symbol", "type": "string"}
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
                    {"indexed": true, "internalType": "address", "name": "spender", "type": "address"},
                    {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
                ],
                "name": "Approval",
                "type": "event"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "to", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "transfer",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];
        
        const { result } = renderHook(() => useContract(mockAddress, complexAbi));
        
        expect(result.current).toBeDefined();
        expect((result.current as any).abi).toBe(complexAbi);
    });

    it('should memoize contract instance properly', () => {
        let renderCount = 0;
        
        const { result, rerender } = renderHook(() => {
            renderCount++;
            return useContract(mockAddress, mockAbi);
        });
        
        const firstContract = result.current;
        expect(renderCount).toBe(1);
        
        // Re-render with same props
        rerender();
        expect(renderCount).toBe(2);
        expect(result.current).toBe(firstContract); // Should be same instance
    });
}); 