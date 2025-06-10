import { useState, useCallback } from 'react';
import { ListingMetadata, SearchFilters } from '../types/listing';
import { APIClient, APIError } from '../api/client';

const api = new APIClient();

export function useListings() {
    const [listings, setListings] = useState<ListingMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchListings = useCallback(async (filters: SearchFilters) => {
        try {
            setLoading(true);
            setError(null);
            const { listings: results } = await api.searchListings(filters);
            setListings(results);
        } catch (err) {
            setError(err instanceof APIError ? err.message : 'Failed to search listings');
        } finally {
            setLoading(false);
        }
    }, []);

    const getListing = useCallback(async (cid: string) => {
        try {
            setLoading(true);
            setError(null);
            const listing = await api.getListing(cid);
            return listing;
        } catch (err) {
            setError(err instanceof APIError ? err.message : 'Failed to get listing');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createListing = useCallback(async (listing: ListingMetadata) => {
        try {
            setLoading(true);
            setError(null);
            const { cid } = await api.createListing(listing);
            return cid;
        } catch (err) {
            setError(err instanceof APIError ? err.message : 'Failed to create listing');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateListing = useCallback(async (cid: string, listing: ListingMetadata) => {
        try {
            setLoading(true);
            setError(null);
            const { cid: newCid } = await api.updateListing(cid, listing);
            return newCid;
        } catch (err) {
            setError(err instanceof APIError ? err.message : 'Failed to update listing');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteListing = useCallback(async (cid: string) => {
        try {
            setLoading(true);
            setError(null);
            await api.deleteListing(cid);
            setListings(listings.filter(l => l.cid !== cid));
        } catch (err) {
            setError(err instanceof APIError ? err.message : 'Failed to delete listing');
        } finally {
            setLoading(false);
        }
    }, [listings]);

    return {
        listings,
        loading,
        error,
        searchListings,
        getListing,
        createListing,
        updateListing,
        deleteListing,
    };
} 