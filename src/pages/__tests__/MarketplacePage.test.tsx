import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarketplacePage } from '../MarketplacePage';
import { useListings } from '../../hooks/useListings';
import { ThemeProvider } from '../../components/common/ThemeProvider';
import { ListingMetadata } from '../../types/listing';

// Mock the useListings hook
jest.mock('../../hooks/useListings');

const mockListing: ListingMetadata = {
    cid: 'test-cid',
    title: 'Test Listing',
    description: 'Test Description',
    type: 'product',
    price: 100,
    currency: 'USD',
    category: 'Electronics',
    tags: ['test', 'electronics'],
    images: ['https://example.com/image.jpg'],
    location: {
        city: 'Test City',
        country: 'Test Country',
    },
    seller: {
        id: '1',
        name: 'Test Seller',
        avatar: 'https://example.com/avatar.jpg',
        rating: 4.5,
        contactInfo: {
            email: 'test@example.com',
        },
    },
    productDetails: {
        condition: 'new',
        brand: 'Test Brand',
        model: 'Test Model',
    },
    status: 'active',
};

describe('MarketplacePage', () => {
    const mockSearchListings = jest.fn();
    const mockCreateListing = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useListings as jest.Mock).mockReturnValue({
            listings: [],
            loading: false,
            error: null,
            searchListings: mockSearchListings,
            createListing: mockCreateListing,
            getListing: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn(),
        });
    });

    it('renders page title', () => {
        render(
            <ThemeProvider>
                <MarketplacePage />
            </ThemeProvider>
        );

        expect(screen.getByText('Marketplace')).toBeInTheDocument();
    });

    it('renders loading state', () => {
        (useListings as jest.Mock).mockReturnValue({
            listings: [],
            loading: true,
            error: null,
            searchListings: mockSearchListings,
            createListing: mockCreateListing,
            getListing: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn(),
        });

        render(
            <ThemeProvider>
                <MarketplacePage />
            </ThemeProvider>
        );

        expect(screen.getByText('Loading listings...')).toBeInTheDocument();
    });

    it('renders error state', () => {
        const errorMessage = 'Failed to load listings';
        (useListings as jest.Mock).mockReturnValue({
            listings: [],
            loading: false,
            error: errorMessage,
            searchListings: mockSearchListings,
            createListing: mockCreateListing,
            getListing: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn(),
        });

        render(
            <ThemeProvider>
                <MarketplacePage />
            </ThemeProvider>
        );

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('renders empty state', () => {
        render(
            <ThemeProvider>
                <MarketplacePage />
            </ThemeProvider>
        );

        expect(screen.getByText('No listings found. Be the first to create one!')).toBeInTheDocument();
    });

    it('renders listings', () => {
        (useListings as jest.Mock).mockReturnValue({
            listings: [mockListing],
            loading: false,
            error: null,
            searchListings: mockSearchListings,
            createListing: mockCreateListing,
            getListing: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn(),
        });

        render(
            <ThemeProvider>
                <MarketplacePage />
            </ThemeProvider>
        );

        expect(screen.getByText(mockListing.title)).toBeInTheDocument();
        expect(screen.getByText(`${mockListing.price} ${mockListing.currency}`)).toBeInTheDocument();
        expect(screen.getByText(mockListing.description)).toBeInTheDocument();
    });

    it('opens create listing dialog when create button is clicked', () => {
        render(
            <ThemeProvider>
                <MarketplacePage />
            </ThemeProvider>
        );

        const createButton = screen.getByRole('button', { name: /create listing/i });
        fireEvent.click(createButton);

        expect(screen.getByText('Create New Listing')).toBeInTheDocument();
    });

    it('creates a new listing successfully', async () => {
        const mockCid = 'test-cid-123';
        mockCreateListing.mockResolvedValue(mockCid);

        render(
            <ThemeProvider>
                <MarketplacePage />
            </ThemeProvider>
        );

        // Open the dialog
        const createButton = screen.getByRole('button', { name: /create listing/i });
        fireEvent.click(createButton);

        // Check that dialog is open
        expect(screen.getByText('Create New Listing')).toBeInTheDocument();

        // Fill in the form
        fireEvent.change(screen.getByLabelText(/title/i), {
            target: { name: 'title', value: mockListing.title }
        });

        fireEvent.change(screen.getByLabelText(/description/i), {
            target: { name: 'description', value: mockListing.description }
        });

        fireEvent.change(screen.getByLabelText(/price/i), {
            target: { name: 'price', value: mockListing.price.toString() }
        });

        fireEvent.change(screen.getByLabelText(/type/i), {
            target: { name: 'type', value: mockListing.type }
        });

        fireEvent.change(screen.getByLabelText(/country/i), {
            target: { name: 'location.country', value: mockListing.location.country }
        });

        if (mockListing.location.city) {
            fireEvent.change(screen.getByLabelText(/city/i), {
                target: { name: 'location.city', value: mockListing.location.city }
            });
        }

        fireEvent.change(screen.getByLabelText(/seller name/i), {
            target: { name: 'seller.name', value: mockListing.seller.name }
        });

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { name: 'seller.contactInfo.email', value: mockListing.seller.contactInfo.email }
        });

        // Submit the form
        const submitButton = screen.getByRole('button', { name: /^create listing$/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockCreateListing).toHaveBeenCalledWith(expect.objectContaining({
                title: mockListing.title,
                description: mockListing.description,
                price: mockListing.price,
                type: mockListing.type,
            }));
        }, { timeout: 3000 });
    });
}); 