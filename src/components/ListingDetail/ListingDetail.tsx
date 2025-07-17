import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@omniwallet/react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/scss/image-gallery.scss';

import { useListing } from '../../hooks/useListing';
import { useTransfer } from '../../hooks/useTransfer';
import { Listing } from '../../types/listing';
import { formatPrice } from '../../utils/format';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { UserProfile } from '../UserProfile/UserProfile';
import { PurchaseForm } from './PurchaseForm';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GalleryContainer = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
`;

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2ecc71;
`;

const Description = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  color: #666;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

export const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { account } = useWallet();
  const { getListing, loading, error } = useListing();
  const { initiatePurchase } = useTransfer();
  const [listing, setListing] = useState<Listing | null>(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      const data = await getListing(id);
      setListing(data);
    };
    fetchListing();
  }, [id, getListing]);

  const handlePurchase = async (quantity: number) => {
    if (!listing || !account) return;

    try {
      await initiatePurchase({
        listingId: listing.id,
        quantity,
        buyerAddress: account.address
      });
      toast.success('Purchase initiated successfully!');
      setShowPurchaseForm(false);
    } catch {
      toast.error('Failed to initiate purchase. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading listing: {error.message}</div>;
  if (!listing) return <div>Listing not found</div>;

  const images = listing.images.map(url => ({
    original: url,
    thumbnail: url
  }));

  return (
    <Container>
      <GalleryContainer>
        <ImageGallery
          items={images}
          showPlayButton={false}
          showFullscreenButton={true}
          showNav={true}
          showThumbnails={true}
        />
      </GalleryContainer>

      <DetailsContainer>
        <Title>{listing.title}</Title>
        <Price>{formatPrice(listing.price)}</Price>
        
        <Section>
          <SectionTitle>Description</SectionTitle>
          <Description>{listing.description}</Description>
        </Section>

        <Section>
          <SectionTitle>Seller</SectionTitle>
          <UserProfile user={listing.seller} />
        </Section>

        <Section>
          <SectionTitle>Details</SectionTitle>
          <div>Condition: {listing.details.condition}</div>
          {listing.details.brand && <div>Brand: {listing.details.brand}</div>}
          {listing.details.model && <div>Model: {listing.details.model}</div>}
          {listing.details.specifications && (
            <div>Specifications: {listing.details.specifications}</div>
          )}
        </Section>

        <Section>
          <SectionTitle>Shipping</SectionTitle>
          <div>Method: {listing.shipping.method}</div>
          <div>Cost: {formatPrice(listing.shipping.cost)}</div>
          <div>Estimated Delivery: {listing.shipping.estimatedDelivery}</div>
        </Section>

        <ActionButtons>
          <Button
            primary
            onClick={() => setShowPurchaseForm(true)}
            disabled={!account}
          >
            {account ? 'Buy Now' : 'Connect Wallet to Buy'}
          </Button>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </ActionButtons>

        {showPurchaseForm && (
          <PurchaseForm
            listing={listing}
            onSubmit={handlePurchase}
            onCancel={() => setShowPurchaseForm(false)}
          />
        )}
      </DetailsContainer>
    </Container>
  );
}; 