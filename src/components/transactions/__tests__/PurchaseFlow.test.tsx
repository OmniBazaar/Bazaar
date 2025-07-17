import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PurchaseFlow } from '../PurchaseFlow';
import { ThemeProvider } from '../../common/ThemeProvider';
import { ListingMetadata } from '../../../types/listing';

const mockListing: ListingMetadata = {
    cid: 'test-cid-123',
    title: 'Test Product',
    description: 'A test product for purchase',
    type: 'product',
    price: 100,
    currency: 'USD',
    category: 'electronics',
    tags: ['test'],
    images: ['test-image.jpg'],
    location: {
        country: 'USA',
        city: 'New York'
    },
    seller: {
        id: 'seller-123',
        name: 'Test Seller',
        avatar: 'seller-avatar.jpg',
        rating: 4.5,
        contactInfo: {
            email: 'seller@test.com'
        }
    },
    status: 'active'
};

// Mock SecureSend component
jest.mock('../../SecureSend/SecureSend', () => ({
    SecureSend: ({ onSuccess, onCancel }: any) => (
        <div data-testid="secure-send">
            <button onClick={onSuccess}>Complete SecureSend</button>
            <button onClick={onCancel}>Cancel SecureSend</button>
        </div>
    )
}));

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('PurchaseFlow', () => {
    const mockOnComplete = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the initial review step', () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByText('Review Purchase')).toBeInTheDocument();
        expect(screen.getByText('Please review the details of your purchase')).toBeInTheDocument();
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('100 USD')).toBeInTheDocument();
        expect(screen.getByText('Seller: Test Seller')).toBeInTheDocument();
    });

    it('renders step indicators correctly', () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByText('Review')).toBeInTheDocument();
        expect(screen.getByText('Payment')).toBeInTheDocument();
        expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('displays SecureSend checkbox checked by default', () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
        expect(screen.getByText(/Use SecureSend for transaction protection/)).toBeInTheDocument();
        expect(screen.getByText(/SecureSend provides escrow protection/)).toBeInTheDocument();
    });

    it('hides SecureSend description when checkbox is unchecked', () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(checkbox).not.toBeChecked();
        expect(screen.queryByText(/SecureSend provides escrow protection/)).not.toBeInTheDocument();
    });

    it('changes button text when SecureSend is disabled', () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(screen.getByText('Purchase Now')).toBeInTheDocument();
        expect(screen.queryByText('Continue with SecureSend')).not.toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        fireEvent.click(screen.getByText('Cancel'));
        expect(mockOnCancel).toHaveBeenCalled();
    });

    it('progresses to SecureSend step when SecureSend is enabled', () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        fireEvent.click(screen.getByText('Continue with SecureSend'));
        expect(screen.getByTestId('secure-send')).toBeInTheDocument();
    });

    it('completes purchase through SecureSend flow', () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        // Go to SecureSend step
        fireEvent.click(screen.getByText('Continue with SecureSend'));
        
        // Complete SecureSend
        fireEvent.click(screen.getByText('Complete SecureSend'));

        expect(screen.getByText('Purchase Complete!')).toBeInTheDocument();
        expect(screen.getByText('Your transaction has been processed successfully')).toBeInTheDocument();
        expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('handles direct purchase without SecureSend', async () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        // Disable SecureSend
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        // Click Purchase Now
        fireEvent.click(screen.getByText('Purchase Now'));

        // Should show processing
        expect(screen.getByText('Processing Payment')).toBeInTheDocument();
        expect(screen.getByText('Please wait while we process your payment...')).toBeInTheDocument();

        // Wait for completion
        await waitFor(() => {
            expect(screen.getByText('Purchase Complete!')).toBeInTheDocument();
        }, { timeout: 1500 });

        expect(mockOnComplete).toHaveBeenCalledWith(expect.stringMatching(/^txn_\d+$/));
    });

    it('allows going back from SecureSend step', () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        // Go to SecureSend step
        fireEvent.click(screen.getByText('Continue with SecureSend'));
        expect(screen.getByTestId('secure-send')).toBeInTheDocument();
        
        // Cancel SecureSend (go back)
        fireEvent.click(screen.getByText('Cancel SecureSend'));
        
        // Should be back at review step
        expect(screen.getByText('Review Purchase')).toBeInTheDocument();
    });

    it('displays listing image in preview', () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        const image = screen.getByAltText('Test Product');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'test-image.jpg');
    });

    it('shows continue shopping button on completion', () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        // Complete SecureSend flow
        fireEvent.click(screen.getByText('Continue with SecureSend'));
        fireEvent.click(screen.getByText('Complete SecureSend'));

        const continueButton = screen.getByText('Continue Shopping');
        expect(continueButton).toBeInTheDocument();
        
        fireEvent.click(continueButton);
        expect(mockOnComplete).toHaveBeenCalledWith(expect.stringMatching(/^txn_\d+$/));
    });

    it('displays confirmation messages on completion', () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        // Complete SecureSend flow
        fireEvent.click(screen.getByText('Continue with SecureSend'));
        fireEvent.click(screen.getByText('Complete SecureSend'));

        expect(screen.getByText('You will receive an email confirmation shortly.')).toBeInTheDocument();
        expect(screen.getByText('The seller has been notified and will process your order.')).toBeInTheDocument();
    });

    it('renders with proper step highlighting', () => {
        renderWithTheme(
            <PurchaseFlow
                listing={mockListing}
                onComplete={mockOnComplete}
                onCancel={mockOnCancel}
            />
        );

        // Initial state - step 1 should be active
        const steps = screen.getAllByText(/^[123]$/);
        expect(steps).toHaveLength(3);
    });
}); 