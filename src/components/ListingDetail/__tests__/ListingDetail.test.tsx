import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ListingDetail } from '../ListingDetail';
import { ThemeProvider } from '../../common/ThemeProvider';
import { Listing, ProductDetails } from '../../../types/listing';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('@omniwallet/react', () => ({
    useWallet: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useNavigate: jest.fn(),
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../../../hooks/useListing', () => ({
    useListing: jest.fn(),
}));

jest.mock('../../../hooks/useTransfer', () => ({
    useTransfer: jest.fn(),
}));

// Import the mocked modules
import { useWallet } from '@omniwallet/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListing } from '../../../hooks/useListing';
import { useTransfer } from '../../../hooks/useTransfer';

const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockUseListing = useListing as jest.MockedFunction<typeof useListing>;
const mockUseTransfer = useTransfer as jest.MockedFunction<typeof useTransfer>;

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <MemoryRouter>
            <ThemeProvider>
                {component}
            </ThemeProvider>
        </MemoryRouter>
    );
};

describe('ListingDetail', () => {
    const mockListing: Listing = {
        id: 'listing-123',
        title: 'iPhone 15 Pro',
        description: 'Brand new iPhone 15 Pro in excellent condition',
        price: 999,
        currency: 'omnicoin',
        quantity: 1,
        images: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg'
        ],
        seller: {
            id: 'seller-1',
            username: 'johndoe',
            reputation: 98,
            avatar: 'https://example.com/avatar.jpg'
        },
        category: 'Electronics',
        tags: ['smartphone', 'apple', 'electronics'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        details: {
            condition: 'new',
            brand: 'Apple',
            model: 'iPhone 15 Pro'
        } as ProductDetails,
        shipping: {
            method: 'Standard',
            cost: 10,
            estimatedDelivery: '3-5 business days'
        },
        status: 'active'
    };

    const mockNavigate = jest.fn();
    const mockGetListing = jest.fn();
    const mockInitiatePurchase = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockUseParams.mockReturnValue({ id: 'listing-123' });
        mockUseNavigate.mockReturnValue(mockNavigate);
        
        mockUseWallet.mockReturnValue({
            account: { address: '0x123456789' }
        });

        mockUseListing.mockReturnValue({
            getListing: mockGetListing,
            loading: false,
            error: null
        });

        mockUseTransfer.mockReturnValue({
            initiatePurchase: mockInitiatePurchase
        });

        mockGetListing.mockResolvedValue(mockListing);
    });

    it('renders listing details correctly', async () => {
        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText(mockListing.title)).toBeInTheDocument();
            expect(screen.getByText(mockListing.description)).toBeInTheDocument();
            expect(screen.getByText('999 omnicoin')).toBeInTheDocument();
        });
    });

    it('shows loading state initially', () => {
        mockUseListing.mockReturnValue({
            getListing: mockGetListing,
            loading: true,
            error: null
        });

        renderWithTheme(<ListingDetail />);
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('shows error state when listing fails to load', () => {
        const errorMessage = 'Failed to load listing';
        mockUseListing.mockReturnValue({
            getListing: mockGetListing,
            loading: false,
            error: { message: errorMessage }
        });

        renderWithTheme(<ListingDetail />);
        expect(screen.getByText(`Error loading listing: ${errorMessage}`)).toBeInTheDocument();
    });

    it('shows not found message when listing is null', async () => {
        mockGetListing.mockResolvedValue(null);

        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText('Listing not found')).toBeInTheDocument();
        });
    });

    it('displays seller information', async () => {
        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText(mockListing.seller.username)).toBeInTheDocument();
            expect(screen.getByText(`⭐ ${mockListing.seller.reputation}`)).toBeInTheDocument();
        });
    });

    it('displays listing details section', async () => {
        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText('Details')).toBeInTheDocument();
            expect(screen.getByText(`Condition: ${mockListing.details.condition}`)).toBeInTheDocument();
            expect(screen.getByText(`Brand: ${mockListing.details.brand}`)).toBeInTheDocument();
            expect(screen.getByText(`Model: ${mockListing.details.model}`)).toBeInTheDocument();
        });
    });

    it('displays shipping information', async () => {
        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText('Shipping')).toBeInTheDocument();
            expect(screen.getByText(`Method: ${mockListing.shipping.method}`)).toBeInTheDocument();
            expect(screen.getByText(`Cost: ${mockListing.shipping.cost} omnicoin`)).toBeInTheDocument();
            expect(screen.getByText(`Estimated Delivery: ${mockListing.shipping.estimatedDelivery}`)).toBeInTheDocument();
        });
    });

    it('shows buy now button when wallet is connected', async () => {
        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText('Buy Now')).toBeInTheDocument();
        });
    });

    it('shows connect wallet message when wallet is not connected', async () => {
        mockUseWallet.mockReturnValue({ account: null });

        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText('Connect Wallet to Buy')).toBeInTheDocument();
        });
    });

    it('opens purchase form when buy now is clicked', async () => {
        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            const buyButton = screen.getByText('Buy Now');
            fireEvent.click(buyButton);
        });

        expect(screen.getByText('Complete Your Purchase')).toBeInTheDocument();
    });

    it('handles purchase flow successfully', async () => {
        mockInitiatePurchase.mockResolvedValue({});

        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            const buyButton = screen.getByText('Buy Now');
            fireEvent.click(buyButton);
        });

        const confirmButton = screen.getByText('Confirm Purchase');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(mockInitiatePurchase).toHaveBeenCalledWith({
                listingId: mockListing.id,
                quantity: 1,
                buyerAddress: '0x123456789'
            });
        });
    });

    it('handles purchase errors gracefully', async () => {
        mockInitiatePurchase.mockRejectedValue(new Error('Purchase failed'));

        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            const buyButton = screen.getByText('Buy Now');
            fireEvent.click(buyButton);
        });

        const confirmButton = screen.getByText('Confirm Purchase');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to initiate purchase. Please try again.');
        });
    });

    it('navigates back when back button is clicked', async () => {
        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            const backButton = screen.getByText('Back');
            fireEvent.click(backButton);
        });

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('fetches listing on component mount', async () => {
        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            expect(mockGetListing).toHaveBeenCalledWith('listing-123');
        });
    });

    it('displays image gallery when images are available', async () => {
        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            // Check that ImageGallery component receives correct props
            const galleryContainer = screen.getByTestId('gallery-container');
            expect(galleryContainer).toBeInTheDocument();
        });
    });

    it('handles quantity selection in purchase form', async () => {
        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            const buyButton = screen.getByText('Buy Now');
            fireEvent.click(buyButton);
        });

        const quantityInput = screen.getByRole('spinbutton');
        fireEvent.change(quantityInput, { target: { value: '2' } });

        const confirmButton = screen.getByText('Confirm Purchase');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(mockInitiatePurchase).toHaveBeenCalledWith({
                listingId: mockListing.id,
                quantity: 2,
                buyerAddress: '0x123456789'
            });
        });
    });

    it('closes purchase form when cancel is clicked', async () => {
        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            const buyButton = screen.getByText('Buy Now');
            fireEvent.click(buyButton);
        });

        expect(screen.getByText('Complete Your Purchase')).toBeInTheDocument();

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(screen.queryByText('Complete Your Purchase')).not.toBeInTheDocument();
    });

    it('disables buy button when wallet is not connected', async () => {
        mockUseWallet.mockReturnValue({ account: null });

        renderWithTheme(<ListingDetail />);

        await waitFor(() => {
            const buyButton = screen.getByText('Connect Wallet to Buy');
            expect(buyButton).toBeDisabled();
        });
    });
}); 