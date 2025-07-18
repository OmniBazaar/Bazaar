import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${props => props.theme.spacing[3]};
    margin-top: ${props => props.theme.spacing[6]};
`;

const PageButton = styled.button<{ $active?: boolean }>`
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.base};
    background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.background};
    color: ${props => props.$active ? props.theme.colors.background : props.theme.colors.text.primary};
    cursor: pointer;
    transition: all ${props => props.theme.transitions.base};

    &:hover {
        background: ${props => props.$active ? props.theme.colors.primaryHover : props.theme.colors.hover};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export function SearchResultsPage() {
    const { listings, loading, error, searchListings } = useListings();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Filters>({});
    const [sortBy, setSortBy] = useState('date');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page on new search
        const searchParams = {
            query,
            ...filters,
            sortBy: sortBy as string,
            page: 1,
            limit: itemsPerPage
        };
        searchListings(searchParams);
    };

    const handleFiltersChange = (newFilters: Filters) => {
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        setFilters({
            type: undefined,
            category: undefined,
            priceRange: undefined,
            location: undefined,
            sortBy: 'newest',
            sortOrder: 'desc'
        });
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [sortBy, sortOrder] = e.target.value.split('-') as ['newest' | 'price' | 'rating' | 'popularity', 'asc' | 'desc'];
        setFilters(prev => ({ ...prev, sortBy, sortOrder }));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            location: {
                ...prev.location,
                [name]: value
            }
        }));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            priceRange: {
                ...prev.priceRange,
                [name]: value ? Number(value) : undefined
            }
        }));
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
            <>
                <ResultsGrid>
                    {listings.map(listing => (
                        <ListingCard
                            key={listing.cid}
                            listing={listing}
                            onClick={() => {
                                // TODO: Navigate to listing detail
                                console.log('Navigate to listing:', listing.cid);
                            }}
                        />
                    ))}
                </ResultsGrid>
                {renderPagination()}
            </>
        );
    };

    const renderPagination = () => {
        // Mock pagination - in real app this would come from API response
        const totalPages = Math.ceil(listings.length / itemsPerPage);
        if (totalPages <= 1) return null;

        const pages = [];
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            pages.push(i);
        }

        return (
            <Pagination>
                <PageButton
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    Previous
                </PageButton>
                {pages.map(page => (
                    <PageButton
                        key={page}
                        $active={page === currentPage}
                        onClick={() => handlePageChange(page)}
                    >
                        {page}
                    </PageButton>
                ))}
                <PageButton
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Next
                </PageButton>
            </Pagination>
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