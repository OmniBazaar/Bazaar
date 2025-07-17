import React from 'react';

interface LocationSelectorProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ 
    value, 
    onChange, 
    name, 
    ...props 
}) => {
    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            name={name}
            placeholder="Enter location"
            {...props}
        />
    );
}; 