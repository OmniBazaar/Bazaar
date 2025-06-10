import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateListingDialog } from '../CreateListingDialog';
import { ThemeProvider } from '../../common/ThemeProvider';

describe('CreateListingDialog', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders when open', () => {
        render(
            <ThemeProvider>
                <CreateListingDialog
                    open={true}
                    onClose={mockOnClose}
                    onSubmit={mockOnSubmit}
                />
            </ThemeProvider>
        );

        expect(screen.getByText('Create New Listing')).toBeInTheDocument();
        expect(screen.getByLabelText('Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Price')).toBeInTheDocument();
        expect(screen.getByLabelText('Type')).toBeInTheDocument();
        expect(screen.getByLabelText('Country')).toBeInTheDocument();
        expect(screen.getByLabelText('City')).toBeInTheDocument();
        expect(screen.getByLabelText('Seller Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <ThemeProvider>
                <CreateListingDialog
                    open={false}
                    onClose={mockOnClose}
                    onSubmit={mockOnSubmit}
                />
            </ThemeProvider>
        );

        expect(screen.queryByText('Create New Listing')).not.toBeInTheDocument();
    });

    it('calls onClose when cancel button is clicked', () => {
        render(
            <ThemeProvider>
                <CreateListingDialog
                    open={true}
                    onClose={mockOnClose}
                    onSubmit={mockOnSubmit}
                />
            </ThemeProvider>
        );

        fireEvent.click(screen.getByText('Cancel'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onSubmit with form data when form is submitted', () => {
        render(
            <ThemeProvider>
                <CreateListingDialog
                    open={true}
                    onClose={mockOnClose}
                    onSubmit={mockOnSubmit}
                />
            </ThemeProvider>
        );

        fireEvent.change(screen.getByLabelText('Title'), {
            target: { name: 'title', value: 'Test Listing' }
        });

        fireEvent.change(screen.getByLabelText('Description'), {
            target: { name: 'description', value: 'Test Description' }
        });

        fireEvent.change(screen.getByLabelText('Price'), {
            target: { name: 'price', value: '100' }
        });

        fireEvent.change(screen.getByLabelText('Type'), {
            target: { name: 'type', value: 'product' }
        });

        fireEvent.change(screen.getByLabelText('Country'), {
            target: { name: 'location.country', value: 'Test Country' }
        });

        fireEvent.change(screen.getByLabelText('City'), {
            target: { name: 'location.city', value: 'Test City' }
        });

        fireEvent.change(screen.getByLabelText('Seller Name'), {
            target: { name: 'seller.name', value: 'Test Seller' }
        });

        fireEvent.change(screen.getByLabelText('Email'), {
            target: { name: 'seller.contactInfo.email', value: 'test@example.com' }
        });

        fireEvent.change(screen.getByLabelText('Phone'), {
            target: { name: 'seller.contactInfo.phone', value: '1234567890' }
        });

        fireEvent.click(screen.getByText('Create Listing'));

        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Test Listing',
            description: 'Test Description',
            price: 100,
            type: 'product',
            location: {
                country: 'Test Country',
                city: 'Test City',
                coordinates: { lat: 0, lng: 0 }
            },
            seller: {
                name: 'Test Seller',
                rating: 0,
                contactInfo: {
                    email: 'test@example.com',
                    phone: '1234567890'
                }
            }
        }));
    });
}); 