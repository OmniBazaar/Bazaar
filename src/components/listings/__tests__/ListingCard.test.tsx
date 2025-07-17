import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListingCard } from '../ListingCard';
import { ListingMetadata } from '../../../types/listing';
import { ThemeProvider } from '../../common/ThemeProvider';

describe('ListingCard', () => {
    const mockListing: ListingMetadata = {
        cid: 'test-cid',
        title: 'Test Listing',
        description: 'Test Description',
        type: 'product',
        price: 100,
        currency: 'USD',
        category: 'Electronics',
        tags: ['test'],
        images: ['test.jpg'],
        location: {
            city: 'Test City',
            country: 'Test Country'
        },
        seller: {
            id: 'seller-1',
            name: 'Test Seller',
            avatar: 'avatar.jpg',
            rating: 4.5,
            contactInfo: {
                email: 'test@example.com'
            }
        },
        status: 'active'
    };

    const renderWithTheme = (component: React.ReactElement) => {
        return render(
            <ThemeProvider>
                {component}
            </ThemeProvider>
        );
    };

    it('renders listing information', () => {
        renderWithTheme(<ListingCard listing={mockListing} />);

        expect(screen.getByText(mockListing.title)).toBeInTheDocument();
        expect(screen.getByText(mockListing.description)).toBeInTheDocument();
        expect(screen.getByText(`${mockListing.price} ${mockListing.currency}`)).toBeInTheDocument();
    });

    it('renders listing information correctly', () => {
        const listingWithDetails = {
            ...mockListing,
            productDetails: {
                condition: 'new' as const,
                brand: 'Test Brand'
            }
        };
        
        renderWithTheme(<ListingCard listing={listingWithDetails} />);

        expect(screen.getByText(listingWithDetails.title)).toBeInTheDocument();
        expect(screen.getByText(`${listingWithDetails.price} ${listingWithDetails.currency}`)).toBeInTheDocument();
        expect(screen.getByText(listingWithDetails.description)).toBeInTheDocument();
        expect(screen.getByText(`Condition: ${listingWithDetails.productDetails.condition}`)).toBeInTheDocument();
        expect(screen.getByText(`${listingWithDetails.location.city}, ${listingWithDetails.location.country}`)).toBeInTheDocument();
        expect(screen.getByText(listingWithDetails.seller.name)).toBeInTheDocument();
        expect(screen.getByText(`⭐ ${listingWithDetails.seller.rating}`)).toBeInTheDocument();
    });

    it('calls onClick handler when clicked', () => {
        const handleClick = jest.fn();
        renderWithTheme(<ListingCard listing={mockListing} onClick={handleClick} />);

        fireEvent.click(screen.getByRole('article'));
        expect(handleClick).toHaveBeenCalledWith(mockListing);
    });

    it('renders service listing correctly', () => {
        const serviceListing: ListingMetadata = {
            ...mockListing,
            type: 'service',
            serviceDetails: {
                serviceType: 'Consulting',
                availability: {
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                },
            },
        };

        renderWithTheme(<ListingCard listing={serviceListing} />);
        expect(screen.getByText(`Service Type: ${serviceListing.serviceDetails?.serviceType}`)).toBeInTheDocument();
    });
}); 