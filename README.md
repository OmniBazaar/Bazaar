# OmniBazaar Marketplace

The OmniBazaar marketplace module provides the user interface and business logic for the decentralized marketplace platform. It uses IPFS for storage and NFTs for listing representation.

## Features

- Create and manage marketplace listings
- Secure escrow system for transactions
- IPFS-based storage for listing data
- NFT-based listing representation
- Multi-signature transaction support

## Directory Structure

```text
src/
├── components/
│   ├── CreateListing/  # Listing creation interface
│   ├── listings/       # Listing-related components
│   ├── nft/           # NFT display and management
│   └── marketplace/   # Core marketplace UI
├── hooks/             # Custom React hooks
├── services/          # Service layer
│   ├── ipfs.ts       # IPFS operations
│   └── listing.ts    # Listing management
└── types/            # TypeScript type definitions
```

## Components

### CreateListing

- `CreateListing.tsx`: Form for creating new marketplace listings
- Handles image uploads to IPFS
- Manages listing metadata
- Integrates with smart contracts

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

- `useSecureSend.ts`: Manage escrow transactions
- `useContract.ts`: Handle smart contract interactions
- `useListings.ts`: Manage listing data and search
- `useNFTs.ts`: Handle NFT operations
- `useMarketplace.ts`: Core marketplace functionality

## Services

- `ipfs.ts`: IPFS file upload and retrieval
- `listing.ts`: Listing creation and management

## Types

- `listing.ts`: Listing-related type definitions
- `nft.ts`: NFT-related type definitions

## Smart Contracts

- `ListingNFT.sol`: ERC721 contract for listing representation
- `SecureSend.sol`: Escrow system for secure transactions

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
