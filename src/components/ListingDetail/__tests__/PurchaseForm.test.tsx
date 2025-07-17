import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PurchaseForm } from '../PurchaseForm';
import { ThemeProvider } from '../../common/ThemeProvider';
import { Listing } from '../../../types/listing';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
    },
}));

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('PurchaseForm', () => {
    const mockListing: Listing = {
        id: 'listing-123',
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        currency: 'omnicoin',
        quantity: 5,
        images: ['https://example.com/image.jpg'],
        seller: {
            id: 'seller-1',
            username: 'johndoe',
            reputation: 95,
            avatar: 'https://example.com/avatar.jpg'
        },
        category: 'Electronics',
        tags: ['test'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        details: {
            condition: 'new',
            brand: 'Test Brand'
        },
        shipping: {
            method: 'Standard',
            cost: 15,
            estimatedDelivery: '3-5 days'
        },
        status: 'active'
    };

    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const defaultProps = {
        listing: mockListing,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
    };

    it('renders the purchase form correctly', () => {
        renderWithTheme(<PurchaseForm {...defaultProps} />);

        expect(screen.getByText('Complete Your Purchase')).toBeInTheDocument();
        expect(screen.getByText('Price per item:')).toBeInTheDocument();
        expect(screen.getByText('Quantity:')).toBeInTheDocument();
        expect(screen.getByText('Subtotal:')).toBeInTheDocument();
        expect(screen.getByText('Shipping:')).toBeInTheDocument();
        expect(screen.getByText('Total:')).toBeInTheDocument();
    });

    it('displays correct price information', () => {
        renderWithTheme(<PurchaseForm {...defaultProps} />);

        expect(screen.getByText('100 omnicoin')).toBeInTheDocument(); // Price per item
        expect(screen.getByText('15 omnicoin')).toBeInTheDocument(); // Shipping cost
    });

    it('calculates subtotal and total correctly', () => {
        renderWithTheme(<PurchaseForm {...defaultProps} />);

        // Initial calculation with quantity 1
        expect(screen.getByText('100 omnicoin')).toBeInTheDocument(); // Subtotal
        expect(screen.getByText('115 omnicoin')).toBeInTheDocument(); // Total (100 + 15)
    });

    it('updates calculations when quantity changes', () => {
        renderWithTheme(<PurchaseForm {...defaultProps} />);

        const quantityInput = screen.getByRole('spinbutton');
        fireEvent.change(quantityInput, { target: { value: '3' } });

        // Should show updated calculations
        expect(screen.getByText('300 omnicoin')).toBeInTheDocument(); // Subtotal (100 * 3)
        expect(screen.getByText('315 omnicoin')).toBeInTheDocument(); // Total (300 + 15)
    });

    it('validates quantity input', async () => {
        renderWithTheme(<PurchaseForm {...defaultProps} />);

        const quantityInput = screen.getByRole('spinbutton');
        const submitButton = screen.getByText('Confirm Purchase');

        // Test invalid quantity
        fireEvent.change(quantityInput, { target: { value: '0' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Please select a valid quantity');
        });
    });

    it('enforces maximum quantity limit', () => {
        renderWithTheme(<PurchaseForm {...defaultProps} />);

        const quantityInput = screen.getByRole('spinbutton');
        
        expect(quantityInput).toHaveAttribute('max', mockListing.quantity.toString());
        expect(quantityInput).toHaveAttribute('min', '1');
    });

    it('calls onSubmit with correct quantity when form is submitted', async () => {
        mockOnSubmit.mockResolvedValue(undefined);

        renderWithTheme(<PurchaseForm {...defaultProps} />);

        const quantityInput = screen.getByRole('spinbutton');
        fireEvent.change(quantityInput, { target: { value: '2' } });

        const submitButton = screen.getByText('Confirm Purchase');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(2);
        });
    });

    it('disables submit button while submitting', async () => {
        mockOnSubmit.mockImplementation(() => 
            new Promise(resolve => setTimeout(resolve, 100))
        );

        renderWithTheme(<PurchaseForm {...defaultProps} />);

        const submitButton = screen.getByText('Confirm Purchase');
        fireEvent.click(submitButton);

        expect(screen.getByText('Processing...')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();

        await waitFor(() => {
            expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
        });
    });

    it('calls onCancel when cancel button is clicked', () => {
        renderWithTheme(<PurchaseForm {...defaultProps} />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('disables buttons during submission', async () => {
        mockOnSubmit.mockImplementation(() => 
            new Promise(resolve => setTimeout(resolve, 100))
        );

        renderWithTheme(<PurchaseForm {...defaultProps} />);

        const submitButton = screen.getByText('Confirm Purchase');
        const cancelButton = screen.getByText('Cancel');

        fireEvent.click(submitButton);

        expect(submitButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
            expect(cancelButton).not.toBeDisabled();
        });
    });

    it('handles submission errors gracefully', async () => {
        mockOnSubmit.mockRejectedValue(new Error('Purchase failed'));

        renderWithTheme(<PurchaseForm {...defaultProps} />);

        const submitButton = screen.getByText('Confirm Purchase');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to process purchase');
        });
    });

    it('displays formatted currency correctly', () => {
        const listingWithDifferentCurrency = {
            ...mockListing,
            price: 0.5,
            currency: 'bitcoin' as const,
            shipping: {
                ...mockListing.shipping,
                cost: 0.01
            }
        };

        renderWithTheme(
            <PurchaseForm 
                {...defaultProps} 
                listing={listingWithDifferentCurrency} 
            />
        );

        expect(screen.getByText('0.5 bitcoin')).toBeInTheDocument();
        expect(screen.getByText('0.01 bitcoin')).toBeInTheDocument();
    });

    it('validates quantity against available stock', () => {
        const limitedStockListing = {
            ...mockListing,
            quantity: 2
        };

        renderWithTheme(
            <PurchaseForm 
                {...defaultProps} 
                listing={limitedStockListing} 
            />
        );

        const quantityInput = screen.getByRole('spinbutton');
        expect(quantityInput).toHaveAttribute('max', '2');
    });

    it('shows correct default quantity', () => {
        renderWithTheme(<PurchaseForm {...defaultProps} />);

        const quantityInput = screen.getByRole('spinbutton');
        expect(quantityInput).toHaveValue(1);
    });

    it('prevents form submission during processing', async () => {
        let resolvePromise: () => void;
        const promise = new Promise<void>(resolve => {
            resolvePromise = resolve;
        });

        mockOnSubmit.mockReturnValue(promise);

        renderWithTheme(<PurchaseForm {...defaultProps} />);

        const submitButton = screen.getByText('Confirm Purchase');
        
        // First submission
        fireEvent.click(submitButton);
        expect(submitButton).toBeDisabled();

        // Try to submit again while processing
        fireEvent.click(submitButton);
        
        // Should only be called once
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);

        // Resolve the promise to finish processing
        resolvePromise!();
        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
        });
    });

    it('formats large numbers correctly', () => {
        const expensiveListing = {
            ...mockListing,
            price: 1500.50,
            shipping: {
                ...mockListing.shipping,
                cost: 50.25
            }
        };

        renderWithTheme(
            <PurchaseForm 
                {...defaultProps} 
                listing={expensiveListing} 
            />
        );

        expect(screen.getByText('1500.5 omnicoin')).toBeInTheDocument();
        expect(screen.getByText('1550.75 omnicoin')).toBeInTheDocument(); // Total
    });
}); 