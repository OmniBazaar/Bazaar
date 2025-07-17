import React from 'react';

// Mock for @omniwallet/react package
export const useWallet = jest.fn(() => ({
    account: {
        address: '0x1234567890123456789012345678901234567890',
        balance: '1000000000000000000000',
    },
    isConnected: true,
    connect: jest.fn(),
    disconnect: jest.fn(),
    signTransaction: jest.fn(),
    sendTransaction: jest.fn(),
}));

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return React.createElement('div', { 'data-testid': 'wallet-provider' }, children);
}; 