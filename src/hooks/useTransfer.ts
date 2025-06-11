import { useState } from 'react';
import { useWallet } from '@omniwallet/react';
import { api } from '../services/api';

interface PurchaseParams {
  listingId: string;
  quantity: number;
  buyerAddress: string;
}

interface TransferParams {
  toAddress: string;
  amount: number;
  currency: 'omnicoin' | 'bitcoin' | 'ethereum';
}

export const useTransfer = () => {
  const { signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initiatePurchase = async (params: PurchaseParams) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Create purchase transaction
      const response = await api.post('/purchases', params);
      const { transaction } = response.data;

      // 2. Sign transaction with wallet
      const signedTx = await signTransaction(transaction);

      // 3. Submit signed transaction
      await api.post('/purchases/confirm', {
        purchaseId: response.data.id,
        signedTransaction: signedTx
      });

      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initiate purchase');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const transfer = async (params: TransferParams) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Create transfer transaction
      const response = await api.post('/transfers', params);
      const { transaction } = response.data;

      // 2. Sign transaction with wallet
      const signedTx = await signTransaction(transaction);

      // 3. Submit signed transaction
      await api.post('/transfers/confirm', {
        transferId: response.data.id,
        signedTransaction: signedTx
      });

      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to transfer');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    initiatePurchase,
    transfer
  };
}; 