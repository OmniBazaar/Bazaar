import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@omniwallet/react';

export const useContract = (address: string, abi: any) => {
  const { provider } = useWallet();

  return useMemo(() => {
    if (!address || !abi || !provider) return null;

    try {
      return new ethers.Contract(address, abi, provider.getSigner());
    } catch (error) {
      console.error('Failed to create contract instance:', error);
      return null;
    }
  }, [address, abi, provider]);
}; 