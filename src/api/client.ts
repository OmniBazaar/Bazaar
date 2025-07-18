import { ListingMetadata, SearchFilters } from '../types/listing';

const API_URL = process.env['REACT_APP_STORAGE_API_URL'] ?? 'http://localhost:3000/api';

export class APIError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'APIError';
    }
}

export class APIClient {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new APIError('API request failed', response.status);
        }

        return response.json();
    }

    async createListing(listing: ListingMetadata): Promise<{ cid: string }> {
        return this.request('/listings', {
            method: 'POST',
            body: JSON.stringify(listing),
        });
    }

    async getListing(cid: string): Promise<ListingMetadata> {
        return this.request(`/listings/${cid}`);
    }

    async updateListing(cid: string, listing: ListingMetadata): Promise<{ cid: string }> {
        return this.request(`/listings/${cid}`, {
            method: 'PUT',
            body: JSON.stringify(listing),
        });
    }

    async deleteListing(cid: string): Promise<void> {
        await this.request(`/listings/${cid}`, {
            method: 'DELETE',
        });
    }

    async searchListings(filters: SearchFilters): Promise<{ listings: ListingMetadata[] }> {
        return this.request('/listings/search', {
            method: 'POST',
            body: JSON.stringify(filters),
        });
    }
} 