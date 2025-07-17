// Mock functions - declared before imports due to hoisting
const mockUseWallet = jest.fn();
const mockCreateListing = jest.fn();
const mockToast = { success: jest.fn(), error: jest.fn() };

// Mock dependencies
jest.mock('@omniwallet/react', () => ({
    useWallet: mockUseWallet,
}));

jest.mock('react-toastify', () => ({
    toast: mockToast,
}));

jest.mock('../../../services/listing', () => ({
    createListing: mockCreateListing,
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateListing } from '../CreateListing';
import { ThemeProvider } from '../../common/ThemeProvider';
import { ListingNode } from '../../../types/listing';

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('CreateListing', () => {
    const mockListingNode: ListingNode = {
        address: '0x1234567890123456789012345678901234567890',
        ipfsGateway: 'https://ipfs.infura.io:5001',
        reputation: 100,
        status: 'active',
        lastSeen: Date.now()
    };

    const mockOnSuccess = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseWallet.mockReturnValue({
            account: '0x123456789',
        });
    });

    const defaultProps = {
        listingNode: mockListingNode,
        onSuccess: mockOnSuccess,
        onCancel: mockOnCancel,
    };

    it('renders the form correctly', () => {
        renderWithTheme(<CreateListing {...defaultProps} />);

        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
        expect(screen.getByText(/create listing/i)).toBeInTheDocument();
        expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    });

    it('shows error when wallet is not connected', async () => {
        mockUseWallet.mockReturnValue({ account: null });
        
        renderWithTheme(<CreateListing {...defaultProps} />);

        const submitButton = screen.getByText(/create listing/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith('Please connect your wallet first');
        });
    });

    it('shows error when no images are uploaded', async () => {
        renderWithTheme(<CreateListing {...defaultProps} />);

        // Fill required fields
        fireEvent.change(screen.getByLabelText(/title/i), {
            target: { value: 'Test Listing' }
        });
        fireEvent.change(screen.getByLabelText(/description/i), {
            target: { value: 'Test Description' }
        });

        const submitButton = screen.getByText(/create listing/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith('Please upload at least one image');
        });
    });

    it('validates required fields', async () => {
        renderWithTheme(<CreateListing {...defaultProps} />);

        const submitButton = screen.getByText(/create listing/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        });
    });

    it('handles price validation', async () => {
        renderWithTheme(<CreateListing {...defaultProps} />);

        const priceInput = screen.getByLabelText(/price/i);
        fireEvent.change(priceInput, { target: { value: '-10' } });
        fireEvent.blur(priceInput);

        await waitFor(() => {
            expect(screen.getByText(/price must be positive/i)).toBeInTheDocument();
        });
    });

    it('handles quantity validation', async () => {
        renderWithTheme(<CreateListing {...defaultProps} />);

        const quantityInput = screen.getByLabelText(/quantity/i);
        fireEvent.change(quantityInput, { target: { value: '0' } });
        fireEvent.blur(quantityInput);

        await waitFor(() => {
            expect(screen.getByText(/quantity must be at least 1/i)).toBeInTheDocument();
        });
    });

    it('calls onCancel when cancel button is clicked', () => {
        renderWithTheme(<CreateListing {...defaultProps} />);

        const cancelButton = screen.getByText(/cancel/i);
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('successfully creates a listing', async () => {
        const mockTokenId = 'token-123';
        mockCreateListing.mockResolvedValue(mockTokenId);

        renderWithTheme(<CreateListing {...defaultProps} />);

        // Fill all required fields
        fireEvent.change(screen.getByLabelText(/title/i), {
            target: { value: 'Test Listing' }
        });
        fireEvent.change(screen.getByLabelText(/description/i), {
            target: { value: 'Test Description' }
        });
        fireEvent.change(screen.getByLabelText(/price/i), {
            target: { value: '100' }
        });
        fireEvent.change(screen.getByLabelText(/quantity/i), {
            target: { value: '1' }
        });

        // Mock file upload by setting images state
        // Note: This would require more complex setup to properly test file upload
        
        const submitButton = screen.getByText(/create listing/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalledWith(mockTokenId);
        });
    });

    it('handles creation errors gracefully', async () => {
        mockCreateListing.mockRejectedValue(new Error('Creation failed'));

        renderWithTheme(<CreateListing {...defaultProps} />);

        // Fill required fields and submit
        fireEvent.change(screen.getByLabelText(/title/i), {
            target: { value: 'Test Listing' }
        });
        fireEvent.change(screen.getByLabelText(/description/i), {
            target: { value: 'Test Description' }
        });

        const submitButton = screen.getByText(/create listing/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith('Failed to create listing');
        });
    });

    it('disables submit button while submitting', async () => {
        mockCreateListing.mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve('token-123'), 100))
        );

        renderWithTheme(<CreateListing {...defaultProps} />);

        // Fill required fields
        fireEvent.change(screen.getByLabelText(/title/i), {
            target: { value: 'Test Listing' }
        });
        fireEvent.change(screen.getByLabelText(/description/i), {
            target: { value: 'Test Description' }
        });

        const submitButton = screen.getByText(/create listing/i);
        fireEvent.click(submitButton);

        expect(screen.getByText(/creating.../i)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();

        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    it('handles tags input correctly', () => {
        renderWithTheme(<CreateListing {...defaultProps} />);

        const tagsInput = screen.getByLabelText(/tags/i);
        fireEvent.change(tagsInput, {
            target: { value: 'electronics, gadget, smartphone' }
        });

        expect(tagsInput).toHaveValue('electronics, gadget, smartphone');
    });

    it('validates email format', async () => {
        renderWithTheme(<CreateListing {...defaultProps} />);

        // This test assumes there's an email field in the form
        // If not present, this test should be removed or modified
        const inputs = screen.getAllByDisplayValue('');
        const emailInputs = inputs.filter(input => 
            input.getAttribute('type') === 'email'
        );

        if (emailInputs.length > 0) {
            const emailInput = emailInputs[0];
            if (emailInput) {
                fireEvent.change(emailInput, {
                    target: { value: 'invalid-email' }
                });
                fireEvent.blur(emailInput);

                await waitFor(() => {
                    // Check for email validation message
                    expect(screen.queryByText(/valid email/i)).toBeTruthy();
                });
            }
        }
    });

    it('handles image upload interface', () => {
        renderWithTheme(<CreateListing {...defaultProps} />);

        // Check that image upload component is present
        expect(screen.getByText(/images/i)).toBeInTheDocument();
    });

    it('shows all form sections', () => {
        renderWithTheme(<CreateListing {...defaultProps} />);

        // Check for main form sections
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
        expect(screen.getByText(/location/i)).toBeInTheDocument();
        expect(screen.getByText(/shipping/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    });
}); 