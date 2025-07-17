export const formatPrice = (price: number, currency?: string): string => {
    if (typeof price !== 'number' || isNaN(price)) {
        return '0.00';
    }
    
    const formattedPrice = price.toFixed(6).replace(/\.?0+$/, '');
    const currencySymbol = currency ?? 'omnicoin';
    
    return `${formattedPrice} ${currencySymbol}`;
}; 