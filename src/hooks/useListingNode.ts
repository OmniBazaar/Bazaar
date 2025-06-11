import { useState, useEffect } from 'react';
import { useWallet } from '@omniwallet/react';
import { ListingNode } from '../types/listing';

export const useListingNode = () => {
  const [listingNode, setListingNode] = useState<ListingNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useWallet();

  useEffect(() => {
    const connectToListingNode = async () => {
      if (!account) {
        setIsLoading(false);
        return;
      }

      try {
        // TODO: Implement actual listing node connection
        // For now, we'll use a mock listing node
        const mockListingNode: ListingNode = {
          address: '0x1234567890123456789012345678901234567890',
          ipfsGateway: 'https://ipfs.infura.io:5001',
          reputation: 100,
          status: 'active',
          lastSeen: Date.now()
        };

        setListingNode(mockListingNode);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to connect to listing node'));
      } finally {
        setIsLoading(false);
      }
    };

    connectToListingNode();
  }, [account]);

  return { listingNode, isLoading, error };
}; 