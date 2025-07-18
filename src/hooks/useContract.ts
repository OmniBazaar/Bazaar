import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@omniwallet/react';

export const useContract = (address: string, abi: ethers.Interface | readonly string[]) => {
  const { provider } = useWallet();

  return useMemo(() => {
    if (!provider || !address || !abi) return null;

    try {
      return new ethers.Contract(address, abi, provider.getSigner());
    } catch {
      return null;
    }
  }, [address, abi, provider]);
}; 