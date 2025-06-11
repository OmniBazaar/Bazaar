import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@omniwallet/react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import CreateListing from '../components/CreateListing/CreateListing';
import { useListingNode } from '../hooks/useListingNode';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  line-height: 1.5;
`;

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { account } = useWallet();
  const { listingNode, isLoading, error } = useListingNode();

  React.useEffect(() => {
    if (!account) {
      toast.error('Please connect your wallet to create a listing');
      navigate('/connect');
    }
  }, [account, navigate]);

  React.useEffect(() => {
    if (error) {
      toast.error('Failed to connect to listing node');
    }
  }, [error]);

  const handleSuccess = () => {
    toast.success('Listing created successfully!');
    navigate('/my-listings');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Title>Loading...</Title>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Title>Error</Title>
        <Description>
          Failed to connect to listing node. Please try again later.
        </Description>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>Create New Listing</Title>
        <Description>
          Create a new listing to sell your items on OmniBazaar. Fill out the form below with your item details.
        </Description>
      </Header>

      {listingNode && (
        <CreateListing
          listingNode={listingNode}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </PageContainer>
  );
};

export default CreateListingPage; 