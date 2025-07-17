import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchResultsPage } from '../SearchResultsPage';
import { ThemeProvider } from '../../components/common/ThemeProvider';
import { useListings } from '../../hooks/useListings';
import { ListingMetadata } from '../../types/listing';

// Mock the useListings hook
jest.mock('../../hooks/useListings');
const mockUseListings = useListings as jest.MockedFunction<typeof useListings>;

// Mock the SearchBar, SearchFilters, and ListingCard components
jest.mock('../../components/listings/SearchBar', () => ({
    SearchBar: ({ onSearch, placeholder, initialValue }: any) => (
        <div data-testid="search-bar">
            <input
                placeholder={placeholder}
                defaultValue={initialValue}
                onChange={(e) => onSearch(e.target.value)}
            />
        </div>
    )
}));

jest.mock('../../components/listings/SearchFilters', () => ({
    SearchFilters: ({ _filters, onFiltersChange, onClearFilters }: any) => (
        <div data-testid="search-filters">
            <button onClick={() => onFiltersChange({ type: 'product' })}>Apply Filters</button>
            <button onClick={onClearFilters}>Clear Filters</button>
        </div>
    )
}));

jest.mock('../../components/listings/ListingCard', () => ({
    ListingCard: ({ listing, onClick }: any) => (
        <div data-testid="listing-card" onClick={() => onClick(listing)}>
            {listing.title}
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

describe('SearchResultsPage', () => {
    const mockSearchListings = jest.fn();
    
    const mockListings: ListingMetadata[] = [
        {
            cid: 'listing-1',
            title: 'Test Listing 1',
            description: 'Test Description 1',
            type: 'product',
            price: 100,
            currency: 'USD',
            category: 'Electronics',
            tags: ['test'],
            images: ['image1.jpg'],
            location: { city: 'Test City', country: 'Test Country' },
            seller: {
                id: '1',
                name: 'Test Seller 1',
                avatar: 'avatar1.jpg',
                rating: 4.5,
                contactInfo: { email: 'test1@example.com' }
            },
            status: 'active'
        },
        {
            cid: 'listing-2',
            title: 'Test Listing 2',
            description: 'Test Description 2',
            type: 'service',
            price: 50,
            currency: 'USD',
            category: 'Services',
            tags: ['test'],
            images: ['image2.jpg'],
            location: { city: 'Test City', country: 'Test Country' },
            seller: {
                id: '2',
                name: 'Test Seller 2',
                avatar: 'avatar2.jpg',
                rating: 4.0,
                contactInfo: { email: 'test2@example.com' }
            },
            status: 'active'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseListings.mockReturnValue({
            listings: [],
            loading: false,
            error: null,
            searchListings: mockSearchListings,
            getListing: jest.fn(),
            createListing: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn()
        });
    });

    it('renders page title', () => {
        renderWithTheme(<SearchResultsPage />);
        expect(screen.getByText('Search Marketplace')).toBeInTheDocument();
    });

    it('renders search bar', () => {
        renderWithTheme(<SearchResultsPage />);
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('renders search filters', () => {
        renderWithTheme(<SearchResultsPage />);
        expect(screen.getByTestId('search-filters')).toBeInTheDocument();
    });

    it('calls searchListings on mount', () => {
        renderWithTheme(<SearchResultsPage />);
        expect(mockSearchListings).toHaveBeenCalledWith({
            query: '',
            sortBy: 'date',
            page: 1,
            limit: 20
        });
    });

    it('displays loading state', () => {
        mockUseListings.mockReturnValue({
            listings: [],
            loading: true,
            error: null,
            searchListings: mockSearchListings,
            getListing: jest.fn(),
            createListing: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn()
        });

        renderWithTheme(<SearchResultsPage />);
        expect(screen.getByText('Searching listings...')).toBeInTheDocument();
    });

    it('displays error state', () => {
        mockUseListings.mockReturnValue({
            listings: [],
            loading: false,
            error: 'Search failed',
            searchListings: mockSearchListings,
            getListing: jest.fn(),
            createListing: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn()
        });

        renderWithTheme(<SearchResultsPage />);
        expect(screen.getByText('Error: Search failed')).toBeInTheDocument();
    });

    it('displays no results message when listings are empty', () => {
        mockUseListings.mockReturnValue({
            listings: [],
            loading: false,
            error: null,
            searchListings: mockSearchListings,
            getListing: jest.fn(),
            createListing: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn()
        });

        renderWithTheme(<SearchResultsPage />);
        expect(screen.getByText(/No listings found matching your criteria/)).toBeInTheDocument();
        expect(screen.getByText(/Try adjusting your search or filters/)).toBeInTheDocument();
    });

    it('displays listings when available', () => {
        mockUseListings.mockReturnValue({
            listings: mockListings,
            loading: false,
            error: null,
            searchListings: mockSearchListings,
            getListing: jest.fn(),
            createListing: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn()
        });

        renderWithTheme(<SearchResultsPage />);
        
        expect(screen.getByText('Test Listing 1')).toBeInTheDocument();
        expect(screen.getByText('Test Listing 2')).toBeInTheDocument();
        expect(screen.getAllByTestId('listing-card')).toHaveLength(2);
    });

    it('displays correct results count', () => {
        mockUseListings.mockReturnValue({
            listings: mockListings,
            loading: false,
            error: null,
            searchListings: mockSearchListings,
            getListing: jest.fn(),
            createListing: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn()
        });

        renderWithTheme(<SearchResultsPage />);
        expect(screen.getByText('2 listings found')).toBeInTheDocument();
    });

    it('calls searchListings when search query changes', () => {
        renderWithTheme(<SearchResultsPage />);
        
        const searchInput = screen.getByPlaceholderText('Search for products, services, or jobs...');
        fireEvent.change(searchInput, { target: { value: 'test query' } });

        expect(mockSearchListings).toHaveBeenCalledWith({
            query: 'test query',
            sortBy: 'date',
            page: 1,
            limit: 20
        });
    });

    it('calls searchListings when filters change', () => {
        renderWithTheme(<SearchResultsPage />);
        
        const applyFiltersButton = screen.getByText('Apply Filters');
        fireEvent.click(applyFiltersButton);

        expect(mockSearchListings).toHaveBeenCalledWith({
            query: '',
            type: 'product',
            sortBy: 'date',
            page: 1,
            limit: 20
        });
    });

    it('calls searchListings when filters are cleared', () => {
        renderWithTheme(<SearchResultsPage />);
        
        const clearFiltersButton = screen.getByText('Clear Filters');
        fireEvent.click(clearFiltersButton);

        expect(mockSearchListings).toHaveBeenCalledWith({
            query: '',
            sortBy: 'date',
            page: 1,
            limit: 20
        });
    });

    it('calls searchListings when sort option changes', () => {
        renderWithTheme(<SearchResultsPage />);
        
        const sortSelect = screen.getByDisplayValue('Newest First');
        fireEvent.change(sortSelect, { target: { value: 'price' } });

        expect(mockSearchListings).toHaveBeenCalledWith({
            query: '',
            sortBy: 'price',
            page: 1,
            limit: 20
        });
    });

    it('renders sort options correctly', () => {
        renderWithTheme(<SearchResultsPage />);
        
        const sortSelect = screen.getByDisplayValue('Newest First');
        expect(sortSelect).toContainHTML('<option value="date">Newest First</option>');
        expect(sortSelect).toContainHTML('<option value="price">Price: Low to High</option>');
        expect(sortSelect).toContainHTML('<option value="rating">Highest Rated</option>');
        expect(sortSelect).toContainHTML('<option value="popularity">Most Popular</option>');
    });

    it('handles listing card clicks', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        mockUseListings.mockReturnValue({
            listings: mockListings,
            loading: false,
            error: null,
            searchListings: mockSearchListings,
            getListing: jest.fn(),
            createListing: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn()
        });

        renderWithTheme(<SearchResultsPage />);
        
        const firstListingCard = screen.getByText('Test Listing 1');
        fireEvent.click(firstListingCard);

        expect(consoleSpy).toHaveBeenCalledWith('Navigate to listing:', 'listing-1');
        
        consoleSpy.mockRestore();
    });

    it('resets page to 1 when search parameters change', () => {
        renderWithTheme(<SearchResultsPage />);
        
        // Change search query
        const searchInput = screen.getByPlaceholderText('Search for products, services, or jobs...');
        fireEvent.change(searchInput, { target: { value: 'new search' } });

        expect(mockSearchListings).toHaveBeenCalledWith({
            query: 'new search',
            sortBy: 'date',
            page: 1,
            limit: 20
        });
    });

    it('shows searching state in results count when loading', () => {
        mockUseListings.mockReturnValue({
            listings: [],
            loading: true,
            error: null,
            searchListings: mockSearchListings,
            getListing: jest.fn(),
            createListing: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn()
        });

        renderWithTheme(<SearchResultsPage />);
        expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
}); 