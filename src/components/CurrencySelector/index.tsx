import React, { forwardRef } from 'react';

interface CurrencySelectorProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    name?: string;
}

export const CurrencySelector = forwardRef<HTMLSelectElement, CurrencySelectorProps>(
    ({ value, onChange, name, ...props }, ref) => {
        return (
            <select
                ref={ref}
                value={value}
                onChange={onChange}
                name={name}
                {...props}
            >
                <option value="omnicoin">OmniCoin</option>
                <option value="bitcoin">Bitcoin</option>
                <option value="ethereum">Ethereum</option>
                <option value="usd">USD</option>
            </select>
        );
    }
);

CurrencySelector.displayName = 'CurrencySelector'; 