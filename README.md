# OmniBazaar Marketplace

The OmniBazaar marketplace module provides the user interface and business logic for the decentralized marketplace platform.

## Directory Structure

```
src/
├── components/
│   ├── listings/     # Listing-related components
│   ├── nft/         # NFT display and management
│   └── marketplace/ # Core marketplace UI
├── hooks/           # Custom React hooks
└── types/           # TypeScript type definitions
```

## Components

### Listings
- `ListingSearch.tsx`: Search and filter interface for marketplace listings
- `ListingResults.tsx`: Grid display of search results
- `ListingCard.tsx`: Individual listing display component
- `ListingFilters.tsx`: Advanced filtering options

### NFT
- `NFTGallery.tsx`: Display NFT collections
- `NFTDisplay.tsx`: Individual NFT view
- `NFTTransfer.tsx`: NFT transfer interface

### Marketplace
- `MarketplaceHeader.tsx`: Main marketplace navigation
- `MarketplaceLayout.tsx`: Core layout structure

## Hooks

- `useListings.ts`: Manage listing data and search
- `useNFTs.ts`: Handle NFT operations
- `useMarketplace.ts`: Core marketplace functionality

## Types

- `listing.ts`: Listing-related type definitions
- `nft.ts`: NFT-related type definitions

## Integration

This module integrates with:
- Storage module for IPFS operations
- Wallet module for transactions
- Smart contracts for on-chain operations

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Contributing

Please refer to the project's RULES.md for development guidelines and standards.
