import { BigNumber } from 'ethers';

export interface PriceRange {
    min?: number;
    max?: number;
}

export interface Location {
    city?: string;
    state?: string;
    country?: string;
}

export interface ContactInfo {
    email: string;
    phone?: string;
    website?: string;
}

export interface Seller {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    contactInfo: ContactInfo;
}

export interface User {
    id: string;
    username: string;
    reputation: number;
    avatar?: string;
}

export interface ProductDetails {
    condition: 'new' | 'used' | 'refurbished';
    brand?: string;
    model?: string;
    specifications?: string;
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: 'cm' | 'inch';
    };
    weight?: {
        value: number;
        unit: 'kg' | 'lb';
    };
}

export interface ServiceDetails {
    type: string;
    duration?: string;
    location?: string;
    requirements?: string[];
}

export interface Shipping {
    method: string;
    cost: number;
    estimatedDelivery: string;
    restrictions?: string[];
}

export interface ListingNode {
    address: string;
    ipfsGateway: string;
    reputation: number;
    status: 'active' | 'inactive';
    lastSeen: number;
}

export interface ListingMetadata {
    name: string;
    description: string;
    images: string[]; // IPFS hashes
    attributes: {
        condition: string;
        brand?: string;
        model?: string;
        specifications?: Record<string, string>;
        dimensions?: {
            length?: number;
            width?: number;
            height?: number;
            unit?: string;
        };
        weight?: {
            value: number;
            unit: string;
        };
    };
    seller: {
        address: string;
        name?: string;
        reputation?: number;
    };
    price: {
        amount: string;
        currency: string;
    };
    quantity: number;
    category: string;
    tags: string[];
    location: {
        country: string;
        city?: string;
        state?: string;
    };
    shipping: {
        methods: {
            name: string;
            price: string;
            currency: string;
            estimatedDays: number;
        }[];
        freeShipping: boolean;
    };
    blockchain: {
        tokenId: string;
        contractAddress: string;
    };
}

export interface SearchFilters {
    type?: 'product' | 'service';
    category?: string;
    priceRange?: PriceRange;
    location?: Location;
    sortBy?: 'price' | 'rating' | 'date' | 'popularity';
    sortOrder?: 'asc' | 'desc';
}

export interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: 'omnicoin' | 'bitcoin' | 'ethereum';
    quantity: number;
    images: string[];
    seller: User;
    category: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    details: ProductDetails | ServiceDetails;
    shipping: Shipping;
    status: 'active' | 'sold' | 'inactive';
    blockchainData?: {
        transactionHash: string;
        blockNumber: number;
        timestamp: string;
    };
}

export interface ListingTransaction {
    listingId: string;
    seller: string;
    buyer: string;
    price: BigNumber;
    currency: string;
    quantity: number;
    status: 'pending' | 'completed' | 'cancelled';
    escrowId?: string;
    createdAt: number;
    updatedAt: number;
}

export interface ListingFilters {
    category?: string;
    priceRange?: {
        min: string;
        max: string;
        currency: string;
    };
    condition?: string;
    location?: {
        country?: string;
        city?: string;
        state?: string;
    };
    seller?: string;
    tags?: string[];
    sortBy?: 'price' | 'date' | 'reputation';
    sortOrder?: 'asc' | 'desc';
} 