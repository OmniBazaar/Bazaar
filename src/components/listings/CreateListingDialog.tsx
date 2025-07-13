import React, { useState } from 'react';
import styled from 'styled-components';
import { ListingMetadata } from '../../types/listing';

interface CreateListingDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (listing: ListingMetadata) => void;
}

const Dialog = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing[6]};
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Title = styled.h2`
  margin: 0 0 ${props => props.theme.spacing[4]};
  color: ${props => props.theme.colors.text.primary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const Label = styled.label`
  color: ${props => props.theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing[4]};
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: none;
  border-radius: ${props => props.theme.borderRadius.base};
  background: ${props => props.$primary ? props.theme.colors.primary : props.theme.colors.background};
  color: ${props => props.$primary ? props.theme.colors.background : props.theme.colors.text.primary};
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

export function CreateListingDialog({ open, onClose, onSubmit }: CreateListingDialogProps) {
    const [formData, setFormData] = useState<Partial<ListingMetadata>>({
        title: '',
        description: '',
        price: 0,
        currency: 'USD',
        type: 'product',
        category: '',
        tags: [],
        images: [],
        location: {
            country: '',
            city: '',
            coordinates: { latitude: 0, longitude: 0 }
        },
        seller: {
            id: 'temp-id',
            name: '',
            avatar: '',
            rating: 0,
            contactInfo: {
                email: '',
                phone: ''
            }
        },
        status: 'active'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData as ListingMetadata);
    };

    const updateNestedField = (obj: Record<string, unknown>, keys: string[], value: string): Record<string, unknown> => {
        if (keys.length === 1) {
            const key = keys[0];
            if (key) {
                return { ...obj, [key]: value };
            }
            return obj;
        }

        const [firstKey, ...remainingKeys] = keys;
        if (!firstKey) {
            return obj;
        }

        const nested = (obj[firstKey] as Record<string, unknown>) || {};
        return {
            ...obj,
            [firstKey]: updateNestedField(nested, remainingKeys, value)
        };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Handle nested form fields
        if (name.includes('.')) {
            const keys = name.split('.');
            setFormData(prev => {
                const result = updateNestedField(prev as Record<string, unknown>, keys, value);
                return result as Partial<ListingMetadata>;
            });
        } else {
            // Handle simple fields
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    if (!open) {
        return null;
    }

    return (
        <Dialog>
            <DialogContent>
                <Title>Create New Listing</Title>
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="description">Description</Label>
                        <TextArea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="type">Type</Label>
                        <Input
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            name="location.country"
                            value={formData.location?.country}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            name="location.city"
                            value={formData.location?.city}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="sellerName">Seller Name</Label>
                        <Input
                            id="sellerName"
                            name="seller.name"
                            value={formData.seller?.name}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="seller.contactInfo.email"
                            type="email"
                            value={formData.seller?.contactInfo?.email}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            name="seller.contactInfo.phone"
                            type="tel"
                            value={formData.seller?.contactInfo?.phone}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <ButtonGroup>
                        <Button type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" $primary>
                            Create Listing
                        </Button>
                    </ButtonGroup>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 