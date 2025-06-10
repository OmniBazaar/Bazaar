import React from 'react';
import styled, { DefaultTheme } from 'styled-components';
import { ListingMetadata } from '../../types/listing';

interface StyledProps {
    theme: DefaultTheme;
}

const Card = styled.div<StyledProps>`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const Content = styled.div`
  padding: 1rem;
`;

const Title = styled.h3<StyledProps>`
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Price = styled.div<StyledProps>`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const Details = styled.div<StyledProps>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Location = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SellerInfo = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const SellerAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const SellerName = styled.span<StyledProps>`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Rating = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ theme }) => theme.colors.primary};
`;

interface ListingCardProps {
    listing: ListingMetadata;
    onClick?: (listing: ListingMetadata) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
    const handleClick = (): void => {
        if (onClick) {
            onClick(listing);
        }
    };

    return (
        <Card onClick={handleClick} role="article">
            <Image
                src={listing.images[0]}
                alt={listing.title}
            />
            <Content>
                <Title>{listing.title}</Title>
                <Price>
                    {listing.price} {listing.currency}
                </Price>
                <Details>
                    <div>{listing.description}</div>
                    {listing.type === 'product' && listing.productDetails && (
                        <div>Condition: {listing.productDetails.condition}</div>
                    )}
                    {listing.type === 'service' && listing.serviceDetails && (
                        <div>Service Type: {listing.serviceDetails.serviceType}</div>
                    )}
                </Details>
                <Location>
                    📍 {listing.location.city}, {listing.location.country}
                </Location>
                <SellerInfo>
                    <SellerAvatar
                        src={listing.seller.avatar}
                        alt={listing.seller.name}
                    />
                    <SellerName>{listing.seller.name}</SellerName>
                    <Rating>
                        ⭐ {listing.seller.rating}
                    </Rating>
                </SellerInfo>
            </Content>
        </Card>
    );
}; 