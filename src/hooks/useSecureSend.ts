import { useState } from 'react';
import { useWallet } from '@omniwallet/react';
import { useContract } from './useContract';
import { SECURE_SEND_ABI } from '../constants/abis';
import { SECURE_SEND_ADDRESS } from '../constants/addresses';

interface CreateEscrowParams {
  sellerAddress: string;
  escrowAgent: string;
  amount: string;
  expirationTime: number;
  _listingId: string;
}

interface EscrowDetails {
  buyer: string;
  seller: string;
  escrowAgent: string;
  amount: string;
  expirationTime: number;
  isReleased: boolean;
  isRefunded: boolean;
  positiveVotes: number;
  negativeVotes: number;
}

export const useSecureSend = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account, signTransaction } = useWallet();
  const contract = useContract(SECURE_SEND_ADDRESS, SECURE_SEND_ABI);

  const createEscrow = async ({
    sellerAddress,
    escrowAgent,
    amount,
    expirationTime,
    _listingId,
  }: CreateEscrowParams): Promise<string> => {
    if (!contract || !account) {
      throw new Error('Contract or account not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // Convert amount to wei
      const amountInWei = ethers.utils.parseEther(amount);

      // Create escrow transaction
      const tx = await contract.createEscrow(
        sellerAddress,
        escrowAgent,
        amountInWei,
        Math.floor(Date.now() / 1000) + expirationTime
      );

      // Sign and send transaction
      const signedTx = await signTransaction(tx);
      const receipt = await signedTx.wait();

      // Get escrow ID from event
      const event = receipt.events?.find(
        (e: any) => e.event === 'EscrowCreated'
      );
      if (!event) {
        throw new Error('Escrow creation event not found');
      }

      return event.args.escrowId;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create escrow';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const vote = async (
    escrowId: string,
    isPositive: boolean
  ): Promise<void> => {
    if (!contract || !account) {
      throw new Error('Contract or account not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.vote(escrowId, isPositive);
      const signedTx = await signTransaction(tx);
      await signedTx.wait();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEscrowDetails = async (
    escrowId: string
  ): Promise<EscrowDetails> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const details = await contract.getEscrowDetails(escrowId);
      return {
        buyer: details.buyer,
        seller: details.seller,
        escrowAgent: details.escrowAgent,
        amount: ethers.utils.formatEther(details.amount),
        expirationTime: details.expirationTime.toNumber(),
        isReleased: details.isReleased,
        isRefunded: details.isRefunded,
        positiveVotes: details.positiveVotes.toNumber(),
        negativeVotes: details.negativeVotes.toNumber(),
      };
    } catch (err: any) {
      setError(err.message ?? 'Failed to get escrow details');
      throw err;
    }
  };

  const extendExpirationTime = async (
    escrowId: string,
    newExpirationTime: number
  ): Promise<void> => {
    if (!contract || !account) {
      throw new Error('Contract or account not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.extendExpirationTime(
        escrowId,
        Math.floor(Date.now() / 1000) + newExpirationTime
      );
      const signedTx = await signTransaction(tx);
      await signedTx.wait();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extend expiration time';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createEscrow,
    vote,
    getEscrowDetails,
    extendExpirationTime,
    loading,
    error,
  };
}; 