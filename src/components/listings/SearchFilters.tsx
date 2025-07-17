import React, { useState } from 'react';
import styled from 'styled-components';
import { SearchFilters as Filters } from '../../types/listing';

interface SearchFiltersProps {
    filters: Filters;
    onFiltersChange: (filters: Filters) => void;
    onClearFilters: () => void;
}

const Container = styled.div`
    background: ${props => props.theme.colors.background};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.lg};
    padding: ${props => props.theme.spacing[6]};
    margin-bottom: ${props => props.theme.spacing[6]};
`;

const Title = styled.h3`
    margin: 0 0 ${props => props.theme.spacing[4]};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.lg};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const FilterSection = styled.div`
    margin-bottom: ${props => props.theme.spacing[5]};
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const FilterLabel = styled.label`
    display: block;
    margin-bottom: ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text.secondary};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const Select = styled.select`
    width: 100%;
    padding: ${props => props.theme.spacing[3]};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.base};
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.base};

    &:focus {
        outline: none;
        border-color: ${props => props.theme.colors.primary};
    }
`;

const Input = styled.input`
    width: 100%;
    padding: ${props => props.theme.spacing[3]};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.base};
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.base};

    &:focus {
        outline: none;
        border-color: ${props => props.theme.colors.primary};
    }
`;

const PriceRange = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing[3]};
    align-items: center;
`;

const PriceInput = styled(Input)`
    flex: 1;
`;

const PriceLabel = styled.span`
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing[3]};
    justify-content: flex-end;
    margin-top: ${props => props.theme.spacing[5]};
`;

const Button = styled.button<{ $primary?: boolean }>`
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    border: 1px solid ${props => props.$primary ? props.theme.colors.primary : props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.base};
    background: ${props => props.$primary ? props.theme.colors.primary : props.theme.colors.background};
    color: ${props => props.$primary ? props.theme.colors.background : props.theme.colors.text.primary};
    cursor: pointer;
    font-size: ${props => props.theme.typography.fontSize.base};
    transition: all ${props => props.theme.transitions.base};

    &:hover {
        opacity: 0.8;
    }
`;

const categories = [
    { value: '', label: 'All Categories' },
    { value: 'for-sale', label: 'For Sale' },
    { value: 'services', label: 'Services' },
    { value: 'jobs', label: 'Jobs' },
    { value: 'crypto', label: 'CryptoBazaar' },
];

const sortOptions = [
    { value: 'date', label: 'Date Listed' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'popularity', label: 'Popularity' },
];

export function SearchFilters({ filters, onFiltersChange, onClearFilters }: SearchFiltersProps) {
    const [localFilters, setLocalFilters] = useState<Filters>(filters);

    const handleFilterChange = (key: keyof Filters, value: string | undefined) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
        const numValue = value === '' ? undefined : Number(value);
        setLocalFilters(prev => ({
            ...prev,
            priceRange: {
                ...prev.priceRange,
                [field]: numValue
            }
        }));
    };

    const handleLocationChange = (field: 'city' | 'state' | 'country', value: string) => {
        setLocalFilters(prev => ({
            ...prev,
            location: {
                ...prev.location,
                [field]: value || undefined
            }
        }));
    };

    const handleApplyFilters = () => {
        onFiltersChange(localFilters);
    };

    const handleClearFilters = () => {
        const clearedFilters: Filters = {};
        setLocalFilters(clearedFilters);
        onClearFilters();
    };

    return (
        <Container>
            <Title>Search Filters</Title>
            
            <FilterSection>
                <FilterLabel>Type</FilterLabel>
                <Select
                    value={localFilters.type ?? ''}
                    onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                >
                    <option value="">All Types</option>
                    <option value="product">Products</option>
                    <option value="service">Services</option>
                </Select>
            </FilterSection>

            <FilterSection>
                <FilterLabel>Category</FilterLabel>
                <Select
                    value={localFilters.category ?? ''}
                    onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                >
                    {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </Select>
            </FilterSection>

            <FilterSection>
                <FilterLabel>Price Range</FilterLabel>
                <PriceRange>
                    <PriceInput
                        type="number"
                        placeholder="Min"
                        value={localFilters.priceRange?.min ?? ''}
                        onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                    />
                    <PriceLabel>to</PriceLabel>
                    <PriceInput
                        type="number"
                        placeholder="Max"
                        value={localFilters.priceRange?.max ?? ''}
                        onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                    />
                </PriceRange>
            </FilterSection>

            <FilterSection>
                <FilterLabel>Location</FilterLabel>
                <Input
                    type="text"
                    placeholder="City"
                    value={localFilters.location?.city ?? ''}
                    onChange={(e) => handleLocationChange('city', e.target.value)}
                />
                <Input
                    type="text"
                    placeholder="State"
                    value={localFilters.location?.state ?? ''}
                    onChange={(e) => handleLocationChange('state', e.target.value)}
                    style={{ marginTop: '8px' }}
                />
                <Input
                    type="text"
                    placeholder="Country"
                    value={localFilters.location?.country ?? ''}
                    onChange={(e) => handleLocationChange('country', e.target.value)}
                    style={{ marginTop: '8px' }}
                />
            </FilterSection>

            <FilterSection>
                <FilterLabel>Sort By</FilterLabel>
                <Select
                    value={localFilters.sortBy ?? 'date'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </Select>
            </FilterSection>

            <FilterSection>
                <FilterLabel>Sort Order</FilterLabel>
                <Select
                    value={localFilters.sortOrder ?? 'desc'}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                </Select>
            </FilterSection>

            <ButtonGroup>
                <Button onClick={handleClearFilters}>
                    Clear Filters
                </Button>
                <Button $primary onClick={handleApplyFilters}>
                    Apply Filters
                </Button>
            </ButtonGroup>
        </Container>
    );
} 