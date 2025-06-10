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

export interface ProductDetails {
    condition: 'new' | 'used' | 'refurbished';
    brand?: string;
    model?: string;
    specifications?: Record<string, string>;
}

export interface ServiceDetails {
    serviceType: string;
    availability: {
        startDate: string;
        endDate: string;
    };
    qualifications?: string[];
}

export interface ListingNode {
    id: string;
    tokenId: string;
    contractAddress: string;
    owner: string;
    metadata: ListingMetadata;
    createdAt: string;
    updatedAt: string;
}

export interface ListingMetadata {
    cid: string;
    title: string;
    description: string;
    type: 'product' | 'service';
    price: number;
    currency: string;
    category: string;
    tags: string[];
    images: string[];
    location: Location;
    seller: Seller;
    productDetails?: ProductDetails;
    serviceDetails?: ServiceDetails;
    status: 'active' | 'sold' | 'expired';
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
    type: 'product' | 'service';
    category: string;
    price: number;
    location: Location;
    seller: {
        id: string;
        name: string;
        rating: number;
    };
    images: string[];
    createdAt: string;
    updatedAt: string;
    status: 'active' | 'sold' | 'inactive';
} 