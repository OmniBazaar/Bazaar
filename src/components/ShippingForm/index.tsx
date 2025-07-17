import React from 'react';

interface ShippingFormProps {
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    name?: string;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({
    onChange,
    name,
    ...props
}) => {
    return (
        <div>
            <select name={name} onChange={onChange} {...props}>
                <option value="">Select shipping method</option>
                <option value="standard">Standard Shipping</option>
                <option value="express">Express Shipping</option>
                <option value="overnight">Overnight Shipping</option>
            </select>
        </div>
    );
}; 