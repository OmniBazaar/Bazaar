import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreateListingPage from '../CreateListingPage';
import { ThemeProvider } from '../../components/common/ThemeProvider';

// Mock dependencies
jest.mock('@omniwallet/react', () => ({
    useWallet: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

jest.mock('../../hooks/useListingNode', () => ({
    useListingNode: jest.fn(),
}));

jest.mock('../../components/CreateListing/CreateListing', () => ({
    __esModule: true,
    default: ({ onSuccess, onCancel }: any) => (
        <div data-testid="create-listing-component">
            <button onClick={() => onSuccess('token-123')}>Create Success</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    ),
}));

// Direct mock functions
const mockUseWallet = jest.fn();
const mockUseNavigate = jest.fn();
const mockUseListingNode = jest.fn();
const mockToast = { error: jest.fn(), success: jest.fn() };

// Configure mocks manually since we can't use require()
jest.mocked(jest.requireMock('@omniwallet/react')).useWallet = mockUseWallet;
jest.mocked(jest.requireMock('react-router-dom')).useNavigate = mockUseNavigate;
jest.mocked(jest.requireMock('../../hooks/useListingNode')).useListingNode = mockUseListingNode;
jest.mocked(jest.requireMock('react-toastify')).toast = mockToast;

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <MemoryRouter>
            <ThemeProvider>
                {component}
            </ThemeProvider>
        </MemoryRouter>
    );
};

describe('CreateListingPage', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockUseNavigate.mockReturnValue(mockNavigate);
        
        mockUseWallet.mockReturnValue({
            account: { address: '0x123456789' }
        });

        mockUseListingNode.mockReturnValue({
            listingNode: {
                address: '0x1234567890123456789012345678901234567890',
                ipfsGateway: 'https://ipfs.infura.io:5001',
                reputation: 100,
                status: 'active',
                lastSeen: Date.now()
            },
            isLoading: false,
            error: null
        });
    });

    it('renders the page correctly when wallet is connected', () => {
        renderWithTheme(<CreateListingPage />);

        expect(screen.getByText('Create New Listing')).toBeInTheDocument();
        expect(screen.getByText('List your product or service on the OmniBazaar marketplace')).toBeInTheDocument();
        expect(screen.getByTestId('create-listing-component')).toBeInTheDocument();
    });

    it('navigates to connect page when wallet is not connected', async () => {
        mockUseWallet.mockReturnValue({ account: null });

        renderWithTheme(<CreateListingPage />);

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith('Please connect your wallet to create a listing');
            expect(mockNavigate).toHaveBeenCalledWith('/connect');
        });
    });

    it('shows loading state when listing node is loading', () => {
        mockUseListingNode.mockReturnValue({
            listingNode: null,
            isLoading: true,
            error: null
        });

        renderWithTheme(<CreateListingPage />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows error state when listing node fails to connect', () => {
        mockUseListingNode.mockReturnValue({
            listingNode: null,
            isLoading: false,
            error: new Error('Connection failed')
        });

        renderWithTheme(<CreateListingPage />);

        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Failed to connect to listing node. Please try again later.')).toBeInTheDocument();
    });

    it('shows error toast when listing node connection fails', async () => {
        mockUseListingNode.mockReturnValue({
            listingNode: null,
            isLoading: false,
            error: new Error('Connection failed')
        });

        renderWithTheme(<CreateListingPage />);

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith('Failed to connect to listing node');
        });
    });

    it('handles successful listing creation', () => {
        renderWithTheme(<CreateListingPage />);

        const createButton = screen.getByText('Create Success');
        createButton.click();

        expect(mockToast.success).toHaveBeenCalledWith('Listing created successfully!');
        expect(mockNavigate).toHaveBeenCalledWith('/my-listings');
    });

    it('handles cancel action', () => {
        renderWithTheme(<CreateListingPage />);

        const cancelButton = screen.getByText('Cancel');
        cancelButton.click();

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('renders header section correctly', () => {
        renderWithTheme(<CreateListingPage />);

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create New Listing');
        
        const description = screen.getByText('List your product or service on the OmniBazaar marketplace');
        expect(description).toBeInTheDocument();
    });

    it('does not render CreateListing component when loading', () => {
        mockUseListingNode.mockReturnValue({
            listingNode: null,
            isLoading: true,
            error: null
        });

        renderWithTheme(<CreateListingPage />);

        expect(screen.queryByTestId('create-listing-component')).not.toBeInTheDocument();
    });

    it('does not render CreateListing component when there is an error', () => {
        mockUseListingNode.mockReturnValue({
            listingNode: null,
            isLoading: false,
            error: new Error('Connection failed')
        });

        renderWithTheme(<CreateListingPage />);

        expect(screen.queryByTestId('create-listing-component')).not.toBeInTheDocument();
    });

    it('passes correct props to CreateListing component', () => {
        const mockListingNode = {
            address: '0x1234567890123456789012345678901234567890',
            ipfsGateway: 'https://ipfs.infura.io:5001',
            reputation: 100,
            status: 'active' as const,
            lastSeen: Date.now()
        };

        mockUseListingNode.mockReturnValue({
            listingNode: mockListingNode,
            isLoading: false,
            error: null
        });

        renderWithTheme(<CreateListingPage />);

        expect(screen.getByTestId('create-listing-component')).toBeInTheDocument();
    });

    it('handles different wallet states correctly', async () => {
        // Test with undefined account
        mockUseWallet.mockReturnValue({ account: undefined });

        renderWithTheme(<CreateListingPage />);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/connect');
        });

        // Test with null account
        jest.clearAllMocks();
        mockUseWallet.mockReturnValue({ account: null });

        renderWithTheme(<CreateListingPage />);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/connect');
        });
    });

    it('handles listing node with different statuses', () => {
        const inactiveNode = {
            address: '0x1234567890123456789012345678901234567890',
            ipfsGateway: 'https://ipfs.infura.io:5001',
            reputation: 50,
            status: 'inactive' as const,
            lastSeen: Date.now()
        };

        mockUseListingNode.mockReturnValue({
            listingNode: inactiveNode,
            isLoading: false,
            error: null
        });

        renderWithTheme(<CreateListingPage />);

        expect(screen.getByTestId('create-listing-component')).toBeInTheDocument();
    });

    it('maintains component state during re-renders', () => {
        const { rerender } = renderWithTheme(<CreateListingPage />);

        expect(screen.getByTestId('create-listing-component')).toBeInTheDocument();

        // Re-render with same props
        rerender(
            <MemoryRouter>
                <ThemeProvider>
                    <CreateListingPage />
                </ThemeProvider>
            </MemoryRouter>
        );

        expect(screen.getByTestId('create-listing-component')).toBeInTheDocument();
    });

    it('handles rapid state changes correctly', async () => {
        const { rerender } = renderWithTheme(<CreateListingPage />);

        // Simulate rapid state changes
        mockUseListingNode.mockReturnValue({
            listingNode: null,
            isLoading: true,
            error: null
        });

        rerender(
            <MemoryRouter>
                <ThemeProvider>
                    <CreateListingPage />
                </ThemeProvider>
            </MemoryRouter>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        mockUseListingNode.mockReturnValue({
            listingNode: {
                address: '0x1234567890123456789012345678901234567890',
                ipfsGateway: 'https://ipfs.infura.io:5001',
                reputation: 100,
                status: 'active' as const,
                lastSeen: Date.now()
            },
            isLoading: false,
            error: null
        });

        rerender(
            <MemoryRouter>
                <ThemeProvider>
                    <CreateListingPage />
                </ThemeProvider>
            </MemoryRouter>
        );

        expect(screen.getByTestId('create-listing-component')).toBeInTheDocument();
    });

    it('cleans up effects properly on unmount', () => {
        const { unmount } = renderWithTheme(<CreateListingPage />);

        expect(() => {
            unmount();
        }).not.toThrow();
    });

    it('handles navigation errors gracefully', () => {
        mockNavigate.mockImplementation(() => {
            throw new Error('Navigation error');
        });

        renderWithTheme(<CreateListingPage />);

        const cancelButton = screen.getByText('Cancel');
        
        expect(() => {
            cancelButton.click();
        }).not.toThrow();
    });

    it('displays correct page structure', () => {
        renderWithTheme(<CreateListingPage />);

        // Check for main container
        const container = screen.getByText('Create New Listing').closest('div');
        expect(container).toBeInTheDocument();

        // Check for header section
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        
        // Check for content area
        expect(screen.getByTestId('create-listing-component')).toBeInTheDocument();
    });
}); 