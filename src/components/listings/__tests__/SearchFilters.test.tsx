import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchFilters } from '../SearchFilters';
import { SearchFilters as Filters } from '../../../types/listing';
import { ThemeProvider } from '../../common/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('SearchFilters', () => {
    const mockOnFiltersChange = jest.fn();
    const mockOnClearFilters = jest.fn();
    const mockFilters: Filters = {
        type: 'product',
        category: 'for-sale',
        priceRange: { min: 10, max: 100 },
        location: { city: 'New York', state: 'NY', country: 'USA' },
        sortBy: 'price',
        sortOrder: 'asc'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the title', () => {
        renderWithTheme(
            <SearchFilters
                filters={{}}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        expect(screen.getByText('Search Filters')).toBeInTheDocument();
    });

    it('renders all filter sections', () => {
        renderWithTheme(
            <SearchFilters
                filters={{}}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('Category')).toBeInTheDocument();
        expect(screen.getByText('Price Range')).toBeInTheDocument();
        expect(screen.getByText('Location')).toBeInTheDocument();
        expect(screen.getByText('Sort By')).toBeInTheDocument();
        expect(screen.getByText('Sort Order')).toBeInTheDocument();
    });

    it('displays current filter values', () => {
        renderWithTheme(
            <SearchFilters
                filters={mockFilters}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        expect(screen.getByDisplayValue('product')).toBeInTheDocument();
        expect(screen.getByDisplayValue('for-sale')).toBeInTheDocument();
        expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // Min price
        expect(screen.getByDisplayValue('100')).toBeInTheDocument(); // Max price
        expect(screen.getByDisplayValue('New York')).toBeInTheDocument();
        expect(screen.getByDisplayValue('NY')).toBeInTheDocument();
        expect(screen.getByDisplayValue('USA')).toBeInTheDocument();
        expect(screen.getByDisplayValue('price')).toBeInTheDocument();
        expect(screen.getByDisplayValue('asc')).toBeInTheDocument();
    });

    it('calls onFiltersChange when Apply Filters is clicked after type changes', () => {
        renderWithTheme(
            <SearchFilters
                filters={{}}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        const typeSelect = screen.getByDisplayValue('All Types');
        fireEvent.change(typeSelect, { target: { value: 'service' } });

        const applyButton = screen.getByText('Apply Filters');
        fireEvent.click(applyButton);

        expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'service' })
        );
    });

    it('calls onFiltersChange when Apply Filters is clicked after category changes', () => {
        renderWithTheme(
            <SearchFilters
                filters={{}}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        const categorySelect = screen.getByDisplayValue('All Categories');
        fireEvent.change(categorySelect, { target: { value: 'services' } });

        const applyButton = screen.getByText('Apply Filters');
        fireEvent.click(applyButton);

        expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({ category: 'services' })
        );
    });

    it('calls onFiltersChange when Apply Filters is clicked after price range changes', () => {
        renderWithTheme(
            <SearchFilters
                filters={{}}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        const minPriceInput = screen.getByPlaceholderText('Min');
        const maxPriceInput = screen.getByPlaceholderText('Max');

        fireEvent.change(minPriceInput, { target: { value: '50' } });
        fireEvent.change(maxPriceInput, { target: { value: '200' } });

        const applyButton = screen.getByText('Apply Filters');
        fireEvent.click(applyButton);

        expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({
                priceRange: { min: 50, max: 200 }
            })
        );
    });

    it('calls onFiltersChange when Apply Filters is clicked after location changes', () => {
        renderWithTheme(
            <SearchFilters
                filters={{}}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        const cityInput = screen.getByPlaceholderText('City');
        const stateInput = screen.getByPlaceholderText('State');
        const countryInput = screen.getByPlaceholderText('Country');

        fireEvent.change(cityInput, { target: { value: 'Los Angeles' } });
        fireEvent.change(stateInput, { target: { value: 'CA' } });
        fireEvent.change(countryInput, { target: { value: 'USA' } });

        const applyButton = screen.getByText('Apply Filters');
        fireEvent.click(applyButton);

        expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({
                location: { city: 'Los Angeles', state: 'CA', country: 'USA' }
            })
        );
    });

    it('calls onFiltersChange when Apply Filters is clicked after sort options change', () => {
        renderWithTheme(
            <SearchFilters
                filters={{}}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        const sortBySelect = screen.getByDisplayValue('Date Listed');
        const sortOrderSelect = screen.getByDisplayValue('Descending');

        fireEvent.change(sortBySelect, { target: { value: 'rating' } });
        fireEvent.change(sortOrderSelect, { target: { value: 'asc' } });

        const applyButton = screen.getByText('Apply Filters');
        fireEvent.click(applyButton);

        expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({ sortBy: 'rating', sortOrder: 'asc' })
        );
    });

    it('calls onClearFilters when clear button is clicked', () => {
        renderWithTheme(
            <SearchFilters
                filters={mockFilters}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        const clearButton = screen.getByText('Clear Filters');
        fireEvent.click(clearButton);

        expect(mockOnClearFilters).toHaveBeenCalled();
    });

    it('renders apply filters button', () => {
        renderWithTheme(
            <SearchFilters
                filters={{}}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        expect(screen.getByText('Apply Filters')).toBeInTheDocument();
    });

    it('handles empty price input values', () => {
        renderWithTheme(
            <SearchFilters
                filters={{}}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        const minPriceInput = screen.getByPlaceholderText('Min');
        fireEvent.change(minPriceInput, { target: { value: '' } });

        const applyButton = screen.getByText('Apply Filters');
        fireEvent.click(applyButton);

        expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({
                priceRange: { min: undefined }
            })
        );
    });

    it('handles empty location input values', () => {
        renderWithTheme(
            <SearchFilters
                filters={{ location: { city: 'Test' } }}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        const cityInput = screen.getByPlaceholderText('City');
        fireEvent.change(cityInput, { target: { value: '' } });

        const applyButton = screen.getByText('Apply Filters');
        fireEvent.click(applyButton);

        expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({
                location: { city: undefined }
            })
        );
    });

    it('renders category options correctly', () => {
        renderWithTheme(
            <SearchFilters
                filters={{}}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        const categorySelect = screen.getByDisplayValue('All Categories');
        expect(categorySelect).toContainHTML('<option value="">All Categories</option>');
        expect(categorySelect).toContainHTML('<option value="for-sale">For Sale</option>');
        expect(categorySelect).toContainHTML('<option value="services">Services</option>');
        expect(categorySelect).toContainHTML('<option value="jobs">Jobs</option>');
        expect(categorySelect).toContainHTML('<option value="crypto">CryptoBazaar</option>');
    });

    it('renders sort options correctly', () => {
        renderWithTheme(
            <SearchFilters
                filters={{}}
                onFiltersChange={mockOnFiltersChange}
                onClearFilters={mockOnClearFilters}
            />
        );

        const sortBySelect = screen.getByDisplayValue('Date Listed');
        expect(sortBySelect).toContainHTML('<option value="date">Date Listed</option>');
        expect(sortBySelect).toContainHTML('<option value="price">Price</option>');
        expect(sortBySelect).toContainHTML('<option value="rating">Rating</option>');
        expect(sortBySelect).toContainHTML('<option value="popularity">Popularity</option>');
    });
}); 