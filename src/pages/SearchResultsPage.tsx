import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useListings } from '../hooks/useListings';
import { SearchBar } from '../components/listings/SearchBar';
import { SearchFilters } from '../components/listings/SearchFilters';
import { ListingCard } from '../components/listings/ListingCard';
import { SearchFilters as Filters } from '../types/listing';

const Container = styled.div`
    padding: ${props => props.theme.spacing[6]};
    max-width: 1400px;
    margin: 0 auto;
`;

const Header = styled.div`
    margin-bottom: ${props => props.theme.spacing[6]};
`;

const Title = styled.h1`
    margin: 0 0 ${props => props.theme.spacing[4]};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize['3xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const SearchSection = styled.div`
    margin-bottom: ${props => props.theme.spacing[6]};
`;

const Content = styled.div`
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: ${props => props.theme.spacing[6]};
    
    @media (max-width: ${props => props.theme.breakpoints.md}) {
        grid-template-columns: 1fr;
    }
`;

const FiltersContainer = styled.div`
    @media (max-width: ${props => props.theme.breakpoints.md}) {
        order: 2;
    }
`;

const ResultsContainer = styled.div`
    @media (max-width: ${props => props.theme.breakpoints.md}) {
        order: 1;
    }
`;

const ResultsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${props => props.theme.spacing[4]};
`;

const ResultsCount = styled.div`
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.base};
`;

const SortOptions = styled.select`
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.base};
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text.primary};
`;

const ResultsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: ${props => props.theme.spacing[5]};
`;

const Loading = styled.div`
    text-align: center;
    padding: ${props => props.theme.spacing[10]};
    color: ${props => props.theme.colors.text.secondary};
`;

const NoResults = styled.div`
    text-align: center;
    padding: ${props => props.theme.spacing[10]};
    color: ${props => props.theme.colors.text.secondary};
`;

const Error = styled.div`
    text-align: center;
    padding: ${props => props.theme.spacing[10]};
    color: ${props => props.theme.colors.error};
`;

export function SearchResultsPage() {
    const { listings, loading, error, searchListings } = useListings();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Filters>({});
    const [sortBy, setSortBy] = useState('date');

    useEffect(() => {
        // Initial search
        handleSearch('');
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const searchParams = {
            query,
            ...filters,
            sortBy: sortBy as any
        };
        searchListings(searchParams);
    };

    const handleFiltersChange = (newFilters: Filters) => {
        setFilters(newFilters);
        const searchParams = {
            query: searchQuery,
            ...newFilters,
            sortBy: sortBy as any
        };
        searchListings(searchParams);
    };

    const handleClearFilters = () => {
        setFilters({});
        const searchParams = {
            query: searchQuery,
            sortBy: sortBy as any
        };
        searchListings(searchParams);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortBy = e.target.value;
        setSortBy(newSortBy);
        const searchParams = {
            query: searchQuery,
            ...filters,
            sortBy: newSortBy as any
        };
        searchListings(searchParams);
    };

    const renderResults = () => {
        if (loading) {
            return <Loading>Searching listings...</Loading>;
        }

        if (error) {
            return <Error>Error: {error}</Error>;
        }

        if (listings.length === 0) {
            return (
                <NoResults>
                    No listings found matching your criteria.
                    <br />
                    Try adjusting your search or filters.
                </NoResults>
            );
        }

        return (
            <ResultsGrid>
                {listings.map(listing => (
                    <ListingCard
                        key={listing.cid}
                        listing={listing}
                        onClick={() => {/* TODO: Navigate to listing detail */}}
                    />
                ))}
            </ResultsGrid>
        );
    };

    return (
        <Container>
            <Header>
                <Title>Search Marketplace</Title>
                <SearchSection>
                    <SearchBar 
                        onSearch={handleSearch}
                        initialValue={searchQuery}
                        placeholder="Search for products, services, or jobs..."
                    />
                </SearchSection>
            </Header>

            <Content>
                <FiltersContainer>
                    <SearchFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onClearFilters={handleClearFilters}
                    />
                </FiltersContainer>

                <ResultsContainer>
                    <ResultsHeader>
                        <ResultsCount>
                            {loading ? 'Searching...' : `${listings.length} listings found`}
                        </ResultsCount>
                        <SortOptions value={sortBy} onChange={handleSortChange}>
                            <option value="date">Newest First</option>
                            <option value="price">Price: Low to High</option>
                            <option value="rating">Highest Rated</option>
                            <option value="popularity">Most Popular</option>
                        </SortOptions>
                    </ResultsHeader>

                    {renderResults()}
                </ResultsContainer>
            </Content>
        </Container>
    );
} 