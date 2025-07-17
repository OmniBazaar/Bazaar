import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useListings } from '../hooks/useListings';
import { ListingCard } from '../components/listings/ListingCard';
import { CreateListingDialog } from '../components/listings/CreateListingDialog';
import { ListingMetadata } from '../types/listing';

const Container = styled.div`
  padding: ${props => props.theme.spacing[6]};
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
`;

const CreateButton = styled.button`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[6]};
`;

const Loading = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.error};
`;

const Empty = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.text.secondary};
`;

export function MarketplacePage() {
    const { listings, loading, error, searchListings, createListing } = useListings();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    useEffect(() => {
        searchListings({}).catch(console.error);
    }, [searchListings]);

    const handleCreateListing = async (listing: ListingMetadata) => {
        try {
            const cid = await createListing(listing);
            if (cid) {
                setIsCreateDialogOpen(false);
                await searchListings({});
            }
        } catch (error) {
            console.error('Failed to create listing:', error);
        }
    };

    if (loading) {
        return <Loading>Loading listings...</Loading>;
    }

    if (error) {
        return <ErrorMessage>{error}</ErrorMessage>;
    }

    return (
        <Container>
            <Header>
                <Title>Marketplace</Title>
                <CreateButton onClick={() => setIsCreateDialogOpen(true)}>
                    Create Listing
                </CreateButton>
            </Header>

            {listings.length === 0 ? (
                <Empty>No listings found. Be the first to create one!</Empty>
            ) : (
                <Grid>
                    {listings.map(listing => (
                        <ListingCard
                            key={listing.cid ?? listing.title}
                            listing={listing}
                            onClick={() => {/* TODO: Navigate to listing detail */ }}
                        />
                    ))}
                </Grid>
            )}

            <CreateListingDialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSubmit={(listing) => void handleCreateListing(listing)}
            />
        </Container>
    );
} 