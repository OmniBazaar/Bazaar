import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

import { Listing } from '../../types/listing';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { formatPrice } from '../../utils/format';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.label`
  font-weight: 500;
`;

const Value = styled.span`
  font-weight: 600;
`;

const Buttons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

interface PurchaseFormProps {
  listing: Listing;
  onSubmit: (quantity: number) => Promise<void>;
  onCancel: () => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  listing,
  onSubmit,
  onCancel
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 1) {
      toast.error('Please select a valid quantity');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(quantity);
    } catch {
      toast.error('Failed to process purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = listing.price * quantity;
  const totalWithShipping = totalPrice + listing.shipping.cost;

  return (
    <Card>
      <Form onSubmit={handleSubmit}>
        <h3>Complete Your Purchase</h3>

        <Row>
          <Label>Price per item:</Label>
          <Value>{formatPrice(listing.price)}</Value>
        </Row>

        <Row>
          <Label>Quantity:</Label>
          <Input
            type="number"
            min="1"
            max={listing.quantity}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            style={{ width: '100px' }}
          />
        </Row>

        <Row>
          <Label>Subtotal:</Label>
          <Value>{formatPrice(totalPrice)}</Value>
        </Row>

        <Row>
          <Label>Shipping:</Label>
          <Value>{formatPrice(listing.shipping.cost)}</Value>
        </Row>

        <Row>
          <Label>Total:</Label>
          <Value>{formatPrice(totalWithShipping)}</Value>
        </Row>

        <Buttons>
          <Button
            type="submit"
            primary
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </Buttons>
      </Form>
    </Card>
  );
}; 