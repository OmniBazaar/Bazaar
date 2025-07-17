# Bazaar Validator Integration

This document outlines the integration between the Bazaar module and the OmniBazaar Validator services.

## Overview

The Bazaar module is a React-based marketplace application that integrates with Validator services to provide:
- IPFS storage for listing data and images
- P2P chat for buyer-seller communication
- Blockchain transaction processing
- Fee distribution for marketplace operations

## Architecture

```
Bazaar Module (React)
├── src/
│   ├── services/
│   │   ├── ValidatorIntegration.ts     # Main integration service
│   │   ├── ValidatorIPFS.ts           # IPFS service wrapper
│   │   └── ValidatorChat.ts           # Chat service wrapper
│   ├── hooks/
│   │   └── useValidatorServices.ts    # React hooks for validator services
│   └── __tests__/
│       └── validator-integration.test.ts  # Integration tests
```

## Services

### ValidatorIntegrationService

The main service that orchestrates all validator integrations:

```typescript
import { ValidatorIntegrationService } from './services/ValidatorIntegration';

const service = new ValidatorIntegrationService({
  validatorEndpoint: 'https://validator.omnibazaar.network',
  networkId: 'omnibazaar-mainnet',
  userId: 'user-123',
  enableChat: true,
  enableFeeDistribution: true
});

await service.initialize();
```

### ValidatorIPFSService

Handles IPFS operations through the Validator service:

```typescript
import { ValidatorIPFSService } from './services/ValidatorIPFS';

const ipfsService = new ValidatorIPFSService({
  validatorEndpoint: 'https://validator.omnibazaar.network',
  networkId: 'omnibazaar-mainnet',
  userId: 'user-123',
  enablePinning: true,
  maxFileSize: 10 * 1024 * 1024 // 10MB
});

// Upload listing images
const imageHash = await ipfsService.uploadToIPFS(imageFile);

// Upload listing metadata
const metadataHash = await ipfsService.uploadMetadataToIPFS(metadata);

// Retrieve data
const data = await ipfsService.getFromIPFS(hash);
```

### ValidatorChatService

Manages P2P chat functionality:

```typescript
import { ValidatorChatService } from './services/ValidatorChat';

const chatService = new ValidatorChatService({
  validatorEndpoint: 'https://validator.omnibazaar.network',
  networkId: 'omnibazaar-mainnet',
  userId: 'user-123',
  enableNotifications: true,
  maxMessageLength: 1000
});

// Create chat room for listing
const room = await chatService.createListingChatRoom(
  listingId,
  sellerId,
  buyerId,
  listingTitle
);

// Send message
const message = await chatService.sendMessage(room.id, 'Hello!');

// Get messages
const messages = await chatService.getMessages(room.id);
```

## React Hooks

### useValidatorStatus

Manages validator connection and status:

```typescript
import { useValidatorStatus } from './hooks/useValidatorServices';

function App() {
  const { status, isInitializing, initializeValidator, disconnect } = useValidatorStatus();
  
  useEffect(() => {
    initializeValidator('user-123');
  }, []);
  
  if (!status.isInitialized) {
    return <div>Connecting to validator...</div>;
  }
  
  return <div>Connected to {status.networkId}</div>;
}
```

### useListingUpload

Handles listing data and image uploads:

```typescript
import { useListingUpload } from './hooks/useValidatorServices';

function CreateListing() {
  const { uploadState, uploadListing, resetUploadState } = useListingUpload();
  
  const handleSubmit = async (metadata, images) => {
    try {
      const { metadataHash, imageHashes } = await uploadListing(metadata, images);
      console.log('Listing uploaded:', metadataHash);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  return (
    <div>
      {uploadState.isUploading && (
        <div>Uploading... {uploadState.progress}%</div>
      )}
      <button onClick={handleSubmit}>Create Listing</button>
    </div>
  );
}
```

### useValidatorChat

Manages chat functionality:

```typescript
import { useValidatorChat } from './hooks/useValidatorServices';

function ChatComponent() {
  const { 
    chatState, 
    unreadCount, 
    createListingChat, 
    loadMessages, 
    sendMessage 
  } = useValidatorChat();
  
  const handleCreateChat = async () => {
    await createListingChat(listingId, sellerId, buyerId, listingTitle);
  };
  
  return (
    <div>
      {unreadCount > 0 && <div>Unread messages: {unreadCount}</div>}
      <div>
        {chatState.messages.map(msg => (
          <div key={msg.id}>{msg.content}</div>
        ))}
      </div>
    </div>
  );
}
```

### useMarketplaceStats

Provides marketplace statistics:

```typescript
import { useMarketplaceStats } from './hooks/useValidatorServices';

function Stats() {
  const { stats, isLoading, error } = useMarketplaceStats();
  
  if (isLoading) return <div>Loading stats...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <p>Total Listings: {stats.totalListings}</p>
      <p>Active Listings: {stats.activeListings}</p>
      <p>Total Volume: {stats.totalVolume}</p>
    </div>
  );
}
```

### useFeeCalculation

Calculates and distributes marketplace fees:

```typescript
import { useFeeCalculation } from './hooks/useValidatorServices';

function PurchaseForm() {
  const { calculateFees, distributeFees } = useFeeCalculation();
  
  const handlePurchase = async (amount) => {
    const fees = await calculateFees(amount, 'fixed');
    console.log('Fees:', fees);
    
    // After transaction completes
    await distributeFees(fees, transactionId);
  };
  
  return <button onClick={() => handlePurchase('100')}>Purchase</button>;
}
```

### useValidatorSearch

Provides search functionality:

```typescript
import { useValidatorSearch } from './hooks/useValidatorServices';

function SearchComponent() {
  const { searchResults, isSearching, searchListings } = useValidatorSearch();
  
  const handleSearch = async (query) => {
    await searchListings(query, { category: 'Electronics' });
  };
  
  return (
    <div>
      {isSearching && <div>Searching...</div>}
      {searchResults.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
```

## Integration Examples

### Complete Listing Creation Flow

```typescript
import { useListingUpload, useValidatorStatus } from './hooks/useValidatorServices';

function CreateListingPage() {
  const { status } = useValidatorStatus();
  const { uploadState, uploadListing } = useListingUpload();
  
  const handleCreateListing = async (formData) => {
    if (!status.isInitialized) {
      alert('Please connect to validator first');
      return;
    }
    
    const { title, description, price, category } = formData;
    const images = formData.images; // File[]
    
    try {
      // Upload listing to validator IPFS
      const { metadataHash, imageHashes } = await uploadListing({
        title,
        description,
        price,
        category,
        seller: status.userId,
        timestamp: Date.now()
      }, images);
      
      // Create NFT on blockchain (using existing contract integration)
      const tokenId = await createListingNFT(metadataHash);
      
      console.log('Listing created:', { tokenId, metadataHash, imageHashes });
    } catch (error) {
      console.error('Failed to create listing:', error);
    }
  };
  
  return (
    <form onSubmit={handleCreateListing}>
      {/* Form fields */}
      {uploadState.isUploading && (
        <div>Uploading to validator... {uploadState.progress}%</div>
      )}
    </form>
  );
}
```

### Buyer-Seller Chat Integration

```typescript
import { useValidatorChat } from './hooks/useValidatorServices';

function ListingDetail({ listing }) {
  const { createListingChat, sendMessage } = useValidatorChat();
  
  const handleContactSeller = async () => {
    try {
      const room = await createListingChat(
        listing.id,
        listing.seller,
        currentUser.id,
        listing.title
      );
      
      await sendMessage(room.id, 'Hi, I\'m interested in this item');
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };
  
  return (
    <div>
      <h1>{listing.title}</h1>
      <p>{listing.description}</p>
      <button onClick={handleContactSeller}>Contact Seller</button>
    </div>
  );
}
```

### Purchase Flow with Fee Distribution

```typescript
import { useFeeCalculation } from './hooks/useValidatorServices';

function PurchaseFlow({ listing, quantity }) {
  const { calculateFees, distributeFees } = useFeeCalculation();
  
  const handlePurchase = async () => {
    const amount = (parseFloat(listing.price) * quantity).toString();
    
    try {
      // Calculate fees
      const fees = await calculateFees(amount, 'fixed');
      const totalAmount = parseFloat(amount) + fees.totalFees;
      
      // Show fee breakdown to user
      console.log('Purchase breakdown:', {
        itemCost: amount,
        marketplaceFee: fees.marketplaceFee,
        processingFee: fees.processingFee,
        validatorFee: fees.validatorFee,
        total: totalAmount
      });
      
      // Process transaction through validator
      const txResult = await validatorIntegration.processTransaction({
        to: listing.seller,
        value: amount,
        data: encodePurchaseData(listing.id, quantity)
      });
      
      if (txResult.success) {
        // Distribute fees to validators
        await distributeFees(fees, txResult.txHash);
        
        console.log('Purchase completed:', txResult.txHash);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };
  
  return <button onClick={handlePurchase}>Purchase for {listing.price}</button>;
}
```

## Configuration

### Environment Variables

```bash
# Validator Configuration
REACT_APP_VALIDATOR_ENDPOINT=https://validator.omnibazaar.network
REACT_APP_NETWORK_ID=omnibazaar-mainnet

# IPFS Configuration
REACT_APP_IPFS_API_URL=https://ipfs.omnibazaar.network:5001
REACT_APP_IPFS_GATEWAY_URL=https://ipfs.omnibazaar.network

# Chat Configuration
REACT_APP_CHAT_ENABLED=true
REACT_APP_CHAT_NOTIFICATIONS=true
REACT_APP_CHAT_MAX_MESSAGE_LENGTH=1000

# Fee Configuration
REACT_APP_MARKETPLACE_FEE_RATE=0.02
REACT_APP_PROCESSING_FEE_RATE=0.005
REACT_APP_VALIDATOR_FEE_RATE=0.001
```

### Webpack Configuration

Update webpack.config.js to handle the new services:

```javascript
module.exports = {
  // ... existing config
  resolve: {
    alias: {
      '@validator': path.resolve(__dirname, '../Validator/src'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@hooks': path.resolve(__dirname, 'src/hooks')
    }
  }
};
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run validator integration tests
npm run test:validator

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
src/__tests__/
└── validator-integration.test.ts
    ├── ValidatorIntegrationService Tests
    ├── ValidatorIPFSService Tests
    ├── ValidatorChatService Tests
    ├── React Hooks Tests
    ├── Error Handling Tests
    └── Integration Flow Tests
```

## Integration Guide

### Setting Up Validator Services

1. **Import validator services**:
```typescript
import { validatorIPFS } from './services/ValidatorIPFS';
import { validatorChat } from './services/ValidatorChat';
import { validatorIntegration } from './services/ValidatorIntegration';
```

2. **Initialize services**:
```typescript
// Initialize all validator services
await validatorIntegration.initialize();
await validatorIPFS.initialize();
await validatorChat.initialize();
```

3. **Use in components**:
```typescript
// Upload files
const hash = await validatorIPFS.uploadToIPFS(file);
const data = await validatorIPFS.getFromIPFS(hash);

// Send messages
const message = await validatorChat.sendMessage(roomId, content);
```

### Adding Chat to Existing Listings

```typescript
// In your listing component
import { useValidatorChat } from './hooks/useValidatorServices';

function ListingComponent({ listing }) {
  const { createListingChat } = useValidatorChat();
  
  const handleStartChat = async () => {
    const room = await createListingChat(
      listing.id,
      listing.seller,
      currentUser.id,
      listing.title
    );
    
    // Navigate to chat or show chat interface
    showChatInterface(room);
  };
  
  return (
    <div>
      {/* Existing listing UI */}
      <button onClick={handleStartChat}>Chat with Seller</button>
    </div>
  );
}
```

## Performance Considerations

### Caching Strategy

```typescript
// Services implement caching for improved performance
const service = new ValidatorIntegrationService({
  validatorEndpoint: 'https://validator.omnibazaar.network',
  networkId: 'omnibazaar-mainnet',
  userId: 'user-123',
  enableChat: true,
  enableFeeDistribution: true
});

// Cached operations
const cachedData = await service.retrieveListingData(hash); // Uses cache
const stats = await service.getMarketplaceStats(); // Cached for 5 minutes
```

### Lazy Loading

```typescript
// Use dynamic imports for validator services
const loadValidatorServices = async () => {
  const { ValidatorIntegrationService } = await import('./services/ValidatorIntegration');
  return new ValidatorIntegrationService(config);
};
```

### Optimistic Updates

```typescript
// Update UI immediately, sync with validator in background
const sendMessage = async (roomId, content) => {
  // Show message immediately
  addMessageToUI({
    id: 'temp-' + Date.now(),
    content,
    sender: currentUser.id,
    timestamp: Date.now(),
    pending: true
  });
  
  // Send to validator
  try {
    const message = await validatorChat.sendMessage(roomId, content);
    updateMessageInUI(message);
  } catch (error) {
    removeMessageFromUI('temp-' + Date.now());
    showError('Failed to send message');
  }
};
```

## Error Handling

### Service Errors

```typescript
try {
  await validatorIntegration.initialize();
} catch (error) {
  if (error.message.includes('connection')) {
    // Show connection error UI
    showConnectionError();
  } else {
    // Show general error
    showGeneralError(error.message);
  }
}
```

### Upload Errors

```typescript
try {
  const hash = await validatorIPFS.uploadToIPFS(file);
} catch (error) {
  if (error.name === 'IPFSError') {
    switch (error.operation) {
      case 'validation':
        showValidationError(error.message);
        break;
      case 'upload':
        showUploadError(error.message);
        break;
      default:
        showGeneralError(error.message);
    }
  }
}
```

### Chat Errors

```typescript
try {
  await validatorChat.sendMessage(roomId, content);
} catch (error) {
  if (error.message.includes('length')) {
    showMessageTooLongError();
  } else if (error.message.includes('room')) {
    showRoomNotFoundError();
  } else {
    showChatError(error.message);
  }
}
```

## Security Considerations

### Data Validation

```typescript
// Validate all data before sending to validator
const validateListingData = (data) => {
  if (!data.title || data.title.length < 3) {
    throw new Error('Title must be at least 3 characters');
  }
  
  if (!data.price || parseFloat(data.price) <= 0) {
    throw new Error('Price must be positive');
  }
  
  // Additional validation...
};
```

### File Type Validation

```typescript
// ValidatorIPFS automatically validates file types
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
const file = event.target.files[0];

if (!allowedTypes.includes(file.type)) {
  showError('File type not allowed');
  return;
}
```

### Message Sanitization

```typescript
// Sanitize chat messages before sending
const sanitizeMessage = (content) => {
  // Remove script tags, etc.
  return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};
```

## Deployment

### Build Configuration

```bash
# Build for production
npm run build

# Build for development
npm run build:dev
```

### Environment Setup

```bash
# Production environment
REACT_APP_VALIDATOR_ENDPOINT=https://validator.omnibazaar.network
REACT_APP_NETWORK_ID=omnibazaar-mainnet

# Development environment
REACT_APP_VALIDATOR_ENDPOINT=http://localhost:3000
REACT_APP_NETWORK_ID=omnibazaar-testnet
```

## Support

For issues or questions:
- Check the [integration tests](src/__tests__/validator-integration.test.ts) for examples
- Review the [service documentation](src/services/)
- Submit issues to the [GitHub repository](https://github.com/omnibazaar/bazaar)

## License

This integration is licensed under the MIT License. See [LICENSE](LICENSE) for details.