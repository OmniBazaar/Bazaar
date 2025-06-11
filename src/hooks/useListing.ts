import { useState } from 'react';
import { Listing } from '../types/listing';
import { api } from '../services/api';

export const useListing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getListing = async (id: string): Promise<Listing> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch listing');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createListing = async (listing: Omit<Listing, 'id'>): Promise<Listing> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/listings', listing);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create listing');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateListing = async (id: string, listing: Partial<Listing>): Promise<Listing> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/listings/${id}`, listing);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update listing');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/listings/${id}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete listing');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getListing,
    createListing,
    updateListing,
    deleteListing
  };
}; 