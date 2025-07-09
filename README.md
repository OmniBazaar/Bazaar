# OmniBazaar Marketplace

The OmniBazaar marketplace module provides the user interface and business logic for the decentralized marketplace platform. This module recreates and enhances all functionality from the legacy OmniCoin-v1--UI application while modernizing the technology stack for our unified browser extension.

## Development Status

✅ **Phase 1 Complete** - Foundation & Architecture infrastructure has been successfully implemented:

- **Development Environment**: TypeScript v5.5.4, Jest with React 18, ESLint 9, Webpack, Storybook
- **Testing Framework**: Complete test suite with 6 test files running successfully
- **Build System**: Browser extension build pipeline with proper TypeScript compilation
- **Code Quality**: ESLint linting, Prettier formatting, and strict TypeScript configuration
- **WSL2 Integration**: Full Linux development environment with Node.js v18.19.1 and npm v9.2.0

**Ready for Phase 2**: Core Marketplace Components development

## Features

### Core Marketplace
- **Multi-Category System**: For Sale, Services, Jobs, and CryptoBazaar with comprehensive subcategories
- **Listing Management**: Create, edit, and manage marketplace listings with rich media support
- **Advanced Search**: Text search, category filtering, location-based search, and saved searches
- **Featured Listings**: Priority fee system for promoted listings

### SecureSend (Escrow)
- **Secure Transactions**: Multi-signature escrow protection for buyers and sellers
- **Escrow Agents**: Trusted third-party dispute resolution
- **Automated Release**: Smart contract-based payment release mechanisms
- **Dispute Resolution**: Community-driven conflict resolution system

### Community Features
- **User Reputation**: Rating and feedback system for trust building
- **Community Policing**: Decentralized content moderation
- **Processors System**: Active and standby processors for governance
- **Voting Mechanisms**: Community participation in platform decisions

### Integration Features
- **Wallet Integration**: Multi-currency payment support (OmniCoin, Bitcoin, Ethereum)
- **IPFS Storage**: Distributed storage for listing data and images
- **DEX Integration**: Token swapping and trading functionality
- **Cross-Chain Support**: Multi-blockchain transaction capabilities

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

### Prerequisites

- Node.js v18.19.1+ 
- npm v9.2.0+
- WSL2 (recommended for Windows development)

### Setup

1. Install dependencies:

   ```bash
   npm install --legacy-peer-deps
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Run tests:

   ```bash
   npm test
   ```

4. Build for production:

   ```bash
   npm run build
   ```

5. Run Storybook:

   ```bash
   npm run storybook
   ```

### Testing

- **Unit Tests**: Jest with React Testing Library
- **Coverage**: Run `npm run test:coverage` for coverage reports
- **Test Files**: All test files are in the `/tests` directory with `.test.tsx` extension

### Build System

- **TypeScript**: Strict mode enabled for type safety
- **Webpack**: Browser extension build pipeline
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting

## Contributing

Please refer to the project's RULES.md for development guidelines and standards.

## Architecture

See [MARKETPLACE_DEVELOPMENT_PLAN.md](./MARKETPLACE_DEVELOPMENT_PLAN.md) for comprehensive development roadmap and [DOCUMENTATION.md](./DOCUMENTATION.md) for user documentation.
