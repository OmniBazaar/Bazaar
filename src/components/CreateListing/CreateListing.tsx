import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { useWallet } from '@omniwallet/react';
import { createListing } from '../../services/listing';
import { ListingMetadata, ListingNode } from '../../types/listing';
import { ImageUpload } from '../ImageUpload';
import { CurrencySelector } from '../CurrencySelector';
import { CategorySelector } from '../CategorySelector';
import { LocationSelector } from '../LocationSelector';
import { ShippingForm } from '../ShippingForm';

const Form = styled.form`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #0066cc;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #0066cc;
  }
`;

const Button = styled.button`
  background-color: #0066cc;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0052a3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

interface FormData {
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  category: string;
  tags: string;
  country: string;
  city: string;
  coordinates?: string;
  username: string;
  condition: string;
  brand?: string;
  model?: string;
  specifications?: string;
  dimensions?: string;
  weight?: string;
  shippingMethod: string;
  shippingCost: number;
  estimatedDelivery: string;
  shippingRestrictions?: string;
}

interface CreateListingProps {
  listingNode: ListingNode;
  onSuccess: (tokenId: string) => void;
  onCancel: () => void;
}

export const CreateListing: React.FC<CreateListingProps> = ({
  listingNode,
  onSuccess,
  onCancel,
}) => {
  const { account } = useWallet();
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);

    try {
      const metadata: Omit<ListingMetadata, 'blockchainData'> = {
        name: data.name,
        description: data.description,
        image: '', // Will be set after IPFS upload
        images: [], // Will be set after IPFS upload
        attributes: {
          condition: data.condition,
          brand: data.brand,
          model: data.model,
          specifications: data.specifications,
          dimensions: data.dimensions,
          weight: data.weight,
        },
        seller: {
          address: account,
          username: data.username,
          reputation: 0, // Will be fetched from blockchain
        },
        price: {
          amount: data.price,
          currency: data.currency,
        },
        quantity: parseInt(data.quantity),
        category: data.category,
        tags: data.tags.split(',').map((tag: string) => tag.trim()),
        location: {
          country: data.country,
          city: data.city,
          coordinates: data.coordinates,
        },
        shipping: {
          method: data.shippingMethod,
          cost: data.shippingCost,
          estimatedDelivery: data.estimatedDelivery,
          restrictions: data.shippingRestrictions,
        },
      };

      const tokenId = await createListing(metadata, images, listingNode);
      onSuccess(tokenId);
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormGroup>
        <Label>Title</Label>
        <Input
          {...register('name', { required: 'Title is required' })}
          placeholder="Enter listing title"
        />
        {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
      </FormGroup>

      <FormGroup>
        <Label>Description</Label>
        <TextArea
          {...register('description', { required: 'Description is required' })}
          placeholder="Enter listing description"
        />
        {errors.description && (
          <ErrorMessage>{errors.description.message}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label>Images</Label>
        <ImageUpload
          onImagesSelected={setImages}
          maxImages={10}
          maxSize={5 * 1024 * 1024} // 5MB
        />
      </FormGroup>

      <FormGroup>
        <Label>Price</Label>
        <Input
          type="number"
          step="0.000001"
          {...register('price', {
            required: 'Price is required',
            min: { value: 0, message: 'Price must be positive' },
          })}
          placeholder="Enter price"
        />
        {errors.price && <ErrorMessage>{errors.price.message}</ErrorMessage>}
      </FormGroup>

      <FormGroup>
        <Label>Currency</Label>
        <CurrencySelector
          {...register('currency', { required: 'Currency is required' })}
        />
        {errors.currency && (
          <ErrorMessage>{errors.currency.message}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label>Quantity</Label>
        <Input
          type="number"
          {...register('quantity', {
            required: 'Quantity is required',
            min: { value: 1, message: 'Quantity must be at least 1' },
          })}
          placeholder="Enter quantity"
        />
        {errors.quantity && (
          <ErrorMessage>{errors.quantity.message}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label>Category</Label>
        <CategorySelector
          {...register('category', { required: 'Category is required' })}
        />
        {errors.category && (
          <ErrorMessage>{errors.category.message}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label>Location</Label>
        <LocationSelector
          {...register('location', { required: 'Location is required' })}
        />
        {errors.location && (
          <ErrorMessage>{errors.location.message}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label>Shipping</Label>
        <ShippingForm
          {...register('shipping', { required: 'Shipping details are required' })}
        />
        {errors.shipping && (
          <ErrorMessage>{errors.shipping.message}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label>Tags</Label>
        <Input
          {...register('tags')}
          placeholder="Enter tags (comma-separated)"
        />
      </FormGroup>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Listing'}
        </Button>
        <Button type="button" onClick={onCancel} style={{ backgroundColor: '#6c757d' }}>
          Cancel
        </Button>
      </div>
    </Form>
  );
}; 