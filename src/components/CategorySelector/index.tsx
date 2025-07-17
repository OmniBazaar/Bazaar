import React, { forwardRef } from 'react';

interface CategorySelectorProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    name?: string;
}

export const CategorySelector = forwardRef<HTMLSelectElement, CategorySelectorProps>(
    ({ value, onChange, name, ...props }, ref) => {
        return (
            <select
                ref={ref}
                value={value}
                onChange={onChange}
                name={name}
                {...props}
            >
                <option value="">Select Category</option>
                <option value="for-sale">For Sale</option>
                <option value="services">Services</option>
                <option value="jobs">Jobs</option>
                <option value="cryptobazaar">CryptoBazaar</option>
                <option value="electronics">Electronics</option>
                <option value="vehicles">Vehicles</option>
                <option value="furniture">Furniture</option>
            </select>
        );
    }
);

CategorySelector.displayName = 'CategorySelector'; 