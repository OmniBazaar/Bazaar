import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListingFilters } from '../ListingFilters';
import { SearchFilters } from '../../../types/listing';

const mockFilters: SearchFilters = {
    type: 'product',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
};

describe('ListingFilters', () => {
    it('renders all filter inputs', () => {
        const handleFilterChange = jest.fn();
        const handleReset = jest.fn();

        render(
            <ListingFilters
                filters={mockFilters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
            />
        );

        expect(screen.getByLabelText('Type')).toBeInTheDocument();
        expect(screen.getByLabelText('Category')).toBeInTheDocument();
        expect(screen.getByLabelText('Price Range')).toBeInTheDocument();
        expect(screen.getByLabelText('Location')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
        expect(screen.getByLabelText('Order')).toBeInTheDocument();
    });

    it('calls onFilterChange when inputs change', () => {
        const handleFilterChange = jest.fn();
        const handleReset = jest.fn();

        render(
            <ListingFilters
                filters={mockFilters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
            />
        );

        fireEvent.change(screen.getByLabelText('Type'), {
            target: { name: 'type', value: 'service' },
        });

        expect(handleFilterChange).toHaveBeenCalledWith({
            ...mockFilters,
            type: 'service',
        });
    });

    it('calls onReset when reset button is clicked', () => {
        const handleFilterChange = jest.fn();
        const handleReset = jest.fn();

        render(
            <ListingFilters
                filters={mockFilters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
            />
        );

        fireEvent.click(screen.getByText('Reset Filters'));
        expect(handleReset).toHaveBeenCalled();
    });

    it('handles price range changes correctly', () => {
        const handleFilterChange = jest.fn();
        const handleReset = jest.fn();

        render(
            <ListingFilters
                filters={mockFilters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
            />
        );

        fireEvent.change(screen.getByPlaceholderText('Min'), {
            target: { name: 'min', value: '100' },
        });

        expect(handleFilterChange).toHaveBeenCalledWith({
            ...mockFilters,
            priceRange: {
                min: 100,
            },
        });
    });

    it('renders filter controls', () => {
        const mockFilters: SearchFilters = {};
        const mockOnFilterChange = jest.fn();
        const mockOnReset = jest.fn();

        render(
            <ListingFilters
                filters={mockFilters}
                onFilterChange={mockOnFilterChange}
                onReset={mockOnReset}
            />
        );

        expect(screen.getByRole('combobox', { name: /type/i })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /category/i })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /sort by/i })).toBeInTheDocument();
    });
}); 