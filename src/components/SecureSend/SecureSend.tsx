import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useWallet } from '@omniwallet/react';
import { useSecureSend } from '../../hooks/useSecureSend';
import { toast } from 'react-toastify';

const Container = styled.div`
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #666;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 10px 0;
`;

interface SecureSendProps {
  listingId: string;
  sellerAddress: string;
  amount: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SecureSend: React.FC<SecureSendProps> = ({
  listingId,
  sellerAddress,
  amount,
  onSuccess,
  onCancel,
}) => {
  const { account, connect } = useWallet();
  const { createEscrow, loading, error } = useSecureSend();
  const [escrowAgent, setEscrowAgent] = useState('');
  const [expirationTime, setExpirationTime] = useState('90'); // Default 90 days

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      await connect();
      return;
    }

    try {
      const escrowId = await createEscrow({
        sellerAddress,
        escrowAgent,
        amount,
        expirationTime: parseInt(expirationTime) * 24 * 60 * 60, // Convert days to seconds
        listingId,
      });

      toast.success('SecureSend escrow created successfully!');
      onSuccess?.();
    } catch (err) {
      toast.error('Failed to create SecureSend escrow');
    }
  };

  return (
    <Container>
      <Title>SecureSend Payment Protection</Title>
      <InfoText>
        SecureSend provides protection for both buyers and sellers by holding funds in escrow
        until the transaction is completed successfully. A 1% fee applies to all SecureSend
        transactions.
      </InfoText>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Escrow Agent</Label>
          <Select
            value={escrowAgent}
            onChange={(e) => setEscrowAgent(e.target.value)}
            required
          >
            <option value="">Select an escrow agent</option>
            {/* Add escrow agent options here */}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Expiration Time (days)</Label>
          <Input
            type="number"
            value={expirationTime}
            onChange={(e) => setExpirationTime(e.target.value)}
            min="1"
            max="180"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Amount</Label>
          <Input type="text" value={amount} disabled />
        </FormGroup>

        <Button type="submit" disabled={loading || !account}>
          {!account ? 'Connect Wallet' : loading ? 'Creating...' : 'Create SecureSend'}
        </Button>

        <Button type="button" onClick={onCancel} style={{ background: '#6c757d' }}>
          Cancel
        </Button>
      </Form>
    </Container>
  );
}; 