import React from 'react';
import styled from 'styled-components';
import { SearchFilters } from '../../types/listing';

const FiltersContainer = styled.div`
  padding: 1rem;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FilterGroup = styled.div`
  margin-bottom: 1rem;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 0.875rem;
  background: white;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const PriceRange = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.5rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
  }
`;

interface ListingFiltersProps {
    filters: SearchFilters;
    onFilterChange: (filters: SearchFilters) => void;
    onReset: () => void;
}

export const ListingFilters: React.FC<ListingFiltersProps> = ({
    filters,
    onFilterChange,
    onReset,
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFilterChange({
            ...filters,
            [name]: value,
        });
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onFilterChange({
            ...filters,
            priceRange: {
                ...filters.priceRange,
                [name]: value ? Number(value) : undefined,
            },
        });
    };

    return (
        <FiltersContainer>
            <FilterGroup>
                <FilterLabel htmlFor="filter-type">Type</FilterLabel>
                <Select
                    id="filter-type"
                    name="type"
                    value={filters.type ?? ''}
                    onChange={handleInputChange}
                >
                    <option value="">All Types</option>
                    <option value="product">Products</option>
                    <option value="service">Services</option>
                </Select>
            </FilterGroup>

            <FilterGroup>
                <FilterLabel htmlFor="filter-category">Category</FilterLabel>
                <Input
                    id="filter-category"
                    type="text"
                    name="category"
                    value={filters.category ?? ''}
                    onChange={handleInputChange}
                    placeholder="Enter category"
                />
            </FilterGroup>

            <FilterGroup>
                <FilterLabel htmlFor="filter-price-range">Price Range</FilterLabel>
                <PriceRange id="filter-price-range">
                    <Input
                        id="filter-price-min"
                        type="number"
                        name="min"
                        value={filters.priceRange?.min ?? ''}
                        onChange={handlePriceChange}
                        placeholder="Min"
                        aria-label="Minimum price"
                    />
                    <Input
                        id="filter-price-max"
                        type="number"
                        name="max"
                        value={filters.priceRange?.max ?? ''}
                        onChange={handlePriceChange}
                        placeholder="Max"
                        aria-label="Maximum price"
                    />
                </PriceRange>
            </FilterGroup>

            <FilterGroup>
                <FilterLabel htmlFor="filter-location">Location</FilterLabel>
                <Input
                    id="filter-location"
                    type="text"
                    name="location.city"
                    value={filters.location?.city ?? ''}
                    onChange={handleInputChange}
                    placeholder="City"
                />
            </FilterGroup>

            <FilterGroup>
                <FilterLabel htmlFor="filter-sortby">Sort By</FilterLabel>
                <Select
                    id="filter-sortby"
                    name="sortBy"
                    value={filters.sortBy ?? ''}
                    onChange={handleInputChange}
                >
                    <option value="price">Price</option>
                    <option value="rating">Rating</option>
                    <option value="date">Date</option>
                    <option value="popularity">Popularity</option>
                </Select>
            </FilterGroup>

            <FilterGroup>
                <FilterLabel htmlFor="filter-sortorder">Order</FilterLabel>
                <Select
                    id="filter-sortorder"
                    name="sortOrder"
                    value={filters.sortOrder ?? ''}
                    onChange={handleInputChange}
                >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </Select>
            </FilterGroup>

            <Button onClick={onReset}>Reset Filters</Button>
        </FiltersContainer>
    );
}; 