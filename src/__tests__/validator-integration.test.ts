/**
 * Bazaar Module Validator Integration Tests
 * 
 * Tests the integration between the Bazaar module and Validator services
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ValidatorIntegrationService } from '../services/ValidatorIntegration';
import { ValidatorIPFSService } from '../services/ValidatorIPFS';
import { ValidatorChatService } from '../services/ValidatorChat';
import { renderHook, act } from '@testing-library/react';
import {
  useValidatorStatus,
  useListingUpload,
  useValidatorChat,
  useMarketplaceStats,
  useFeeCalculation,
  useValidatorSearch
} from '../hooks/useValidatorServices';

// Mock toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn()
  }
}));

// Mock file for testing
const createMockFile = (name: string, type: string, size: number = 1024): File => {
  const file = new File(['mock content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('Bazaar Validator Integration', () => {
  let validatorIntegration: ValidatorIntegrationService;
  let validatorIPFS: ValidatorIPFSService;
  let validatorChat: ValidatorChatService;

  beforeEach(() => {
    validatorIntegration = new ValidatorIntegrationService({
      validatorEndpoint: 'localhost',
      networkId: 'test-network',
      userId: 'test-user-1',
      enableChat: true,
      enableFeeDistribution: true
    });

    validatorIPFS = new ValidatorIPFSService({
      validatorEndpoint: 'localhost',
      networkId: 'test-network',
      userId: 'test-user-1',
      enablePinning: true,
      maxFileSize: 10 * 1024 * 1024 // 10MB
    });

    validatorChat = new ValidatorChatService({
      validatorEndpoint: 'localhost',
      networkId: 'test-network',
      userId: 'test-user-1',
      enableNotifications: true,
      maxMessageLength: 1000
    });
  });

  afterEach(async () => {
    await validatorIntegration.disconnect();
    await validatorIPFS.disconnect();
    await validatorChat.disconnect();
  });

  describe('ValidatorIntegrationService', () => {
    it('should initialize successfully', async () => {
      await validatorIntegration.initialize();
      expect(validatorIntegration.isServiceInitialized()).toBe(true);
    });

    it('should store listing data', async () => {
      await validatorIntegration.initialize();
      
      const listingData = {
        title: 'Test Listing',
        description: 'Test Description',
        price: '100',
        category: 'Electronics'
      };

      const result = await validatorIntegration.storeListingData(listingData, 'test-listing.json');
      
      expect(result.success).toBe(true);
      expect(result.hash).toBeDefined();
    });

    it('should store listing images', async () => {
      await validatorIntegration.initialize();
      
      const imageFile = createMockFile('test-image.jpg', 'image/jpeg');
      const result = await validatorIntegration.storeListingImage(imageFile);
      
      expect(result.success).toBe(true);
      expect(result.hash).toBeDefined();
    });

    it('should retrieve listing data', async () => {
      await validatorIntegration.initialize();
      
      const listingData = {
        title: 'Test Listing',
        description: 'Test Description',
        price: '100',
        category: 'Electronics'
      };

      const storeResult = await validatorIntegration.storeListingData(listingData, 'test-listing.json');
      expect(storeResult.success).toBe(true);

      const retrievedData = await validatorIntegration.retrieveListingData(storeResult.hash!);
      expect(retrievedData.title).toBe(listingData.title);
    });

    it('should calculate fees correctly', async () => {
      await validatorIntegration.initialize();
      
      const amount = '1000';
      const fees = await validatorIntegration.calculateFees(amount, 'fixed');
      
      expect(fees.marketplaceFee).toBe(20); // 2% of 1000
      expect(fees.processingFee).toBe(5); // 0.5% of 1000
      expect(fees.validatorFee).toBe(1); // 0.1% of 1000
      expect(fees.totalFees).toBe(26);
    });

    it('should process transactions', async () => {
      await validatorIntegration.initialize();
      
      const transaction = {
        to: '0x1234567890abcdef1234567890abcdef12345678',
        value: '1000',
        gasLimit: 21000
      };

      const result = await validatorIntegration.processTransaction(transaction);
      
      expect(result.success).toBe(true);
      expect(result.txHash).toBeDefined();
    });

    it('should get marketplace stats', async () => {
      await validatorIntegration.initialize();
      
      const stats = await validatorIntegration.getMarketplaceStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalListings).toBeDefined();
      expect(stats.activeListings).toBeDefined();
      expect(stats.totalTransactions).toBeDefined();
    });

    it('should search listings', async () => {
      await validatorIntegration.initialize();
      
      const results = await validatorIntegration.searchListings('test', {}, 10, 0);
      
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('ValidatorIPFSService', () => {
    it('should initialize successfully', async () => {
      await validatorIPFS.initialize();
    });

    it('should upload files to IPFS', async () => {
      await validatorIPFS.initialize();
      
      const file = createMockFile('test.jpg', 'image/jpeg');
      const hash = await validatorIPFS.uploadToIPFS(file);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should upload metadata to IPFS', async () => {
      await validatorIPFS.initialize();
      
      const metadata = {
        title: 'Test Metadata',
        description: 'Test Description',
        attributes: {
          category: 'Electronics',
          price: '100'
        }
      };

      const hash = await validatorIPFS.uploadMetadataToIPFS(metadata);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should get data from IPFS', async () => {
      await validatorIPFS.initialize();
      
      const metadata = {
        title: 'Test Metadata',
        description: 'Test Description'
      };

      const hash = await validatorIPFS.uploadMetadataToIPFS(metadata);
      const retrievedData = await validatorIPFS.getFromIPFS(hash);
      
      expect(retrievedData.title).toBe(metadata.title);
      expect(retrievedData.description).toBe(metadata.description);
    });

    it('should upload multiple files', async () => {
      await validatorIPFS.initialize();
      
      const files = [
        createMockFile('test1.jpg', 'image/jpeg'),
        createMockFile('test2.png', 'image/png')
      ];

      const results = await validatorIPFS.uploadMultipleFiles(files);
      
      expect(results.length).toBe(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });

    it('should validate file types', async () => {
      await validatorIPFS.initialize();
      
      const invalidFile = createMockFile('test.exe', 'application/exe');
      
      await expect(validatorIPFS.uploadToIPFS(invalidFile)).rejects.toThrow('File type application/exe is not allowed');
    });

    it('should validate file size', async () => {
      await validatorIPFS.initialize();
      
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 20 * 1024 * 1024); // 20MB
      
      await expect(validatorIPFS.uploadToIPFS(largeFile)).rejects.toThrow('File size exceeds limit');
    });

    it('should check if content exists', async () => {
      await validatorIPFS.initialize();
      
      const file = createMockFile('test.jpg', 'image/jpeg');
      const hash = await validatorIPFS.uploadToIPFS(file);
      
      const exists = await validatorIPFS.contentExists(hash);
      expect(exists).toBe(true);
      
      const nonExistent = await validatorIPFS.contentExists('invalid-hash');
      expect(nonExistent).toBe(false);
    });

    it('should generate gateway URLs', async () => {
      const hash = 'test-hash';
      const url = validatorIPFS.getGatewayUrl(hash);
      
      expect(url).toBe('localhost/ipfs/test-hash');
    });
  });

  describe('ValidatorChatService', () => {
    it('should initialize successfully', async () => {
      await validatorChat.initialize();
    });

    it('should create listing chat room', async () => {
      await validatorChat.initialize();
      
      const room = await validatorChat.createListingChatRoom(
        'listing-123',
        'seller-1',
        'buyer-1',
        'Test Product'
      );
      
      expect(room).toBeDefined();
      expect(room.id).toBe('listing-listing-123-seller-1-buyer-1');
      expect(room.participants).toEqual(['seller-1', 'buyer-1']);
      expect(room.listingId).toBe('listing-123');
    });

    it('should send messages', async () => {
      await validatorChat.initialize();
      
      const room = await validatorChat.createListingChatRoom(
        'listing-123',
        'seller-1',
        'buyer-1',
        'Test Product'
      );

      const message = await validatorChat.sendMessage(room.id, 'Hello, is this item available?');
      
      expect(message).toBeDefined();
      expect(message.content).toBe('Hello, is this item available?');
      expect(message.sender).toBe('test-user-1');
    });

    it('should get messages for room', async () => {
      await validatorChat.initialize();
      
      const room = await validatorChat.createListingChatRoom(
        'listing-123',
        'seller-1',
        'buyer-1',
        'Test Product'
      );

      await validatorChat.sendMessage(room.id, 'Hello');
      await validatorChat.sendMessage(room.id, 'How are you?');

      const messages = await validatorChat.getMessages(room.id);
      
      expect(Array.isArray(messages)).toBe(true);
    });

    it('should handle typing indicators', async () => {
      await validatorChat.initialize();
      
      const room = await validatorChat.createListingChatRoom(
        'listing-123',
        'seller-1',
        'buyer-1',
        'Test Product'
      );

      validatorChat.startTyping(room.id);
      let indicators = validatorChat.getTypingIndicators(room.id);
      expect(indicators.length).toBe(0); // Own typing not shown

      validatorChat.stopTyping(room.id);
      indicators = validatorChat.getTypingIndicators(room.id);
      expect(indicators.length).toBe(0);
    });

    it('should send image messages', async () => {
      await validatorChat.initialize();
      
      const room = await validatorChat.createListingChatRoom(
        'listing-123',
        'seller-1',
        'buyer-1',
        'Test Product'
      );

      const imageFile = createMockFile('image.jpg', 'image/jpeg');
      const message = await validatorChat.sendImageMessage(room.id, imageFile);
      
      expect(message).toBeDefined();
      expect(message.messageType).toBe('image');
      expect(message.content).toContain('Image:');
    });

    it('should search messages', async () => {
      await validatorChat.initialize();
      
      const room = await validatorChat.createListingChatRoom(
        'listing-123',
        'seller-1',
        'buyer-1',
        'Test Product'
      );

      await validatorChat.sendMessage(room.id, 'Hello world');
      await validatorChat.sendMessage(room.id, 'How are you?');

      const results = await validatorChat.searchMessages('hello', room.id);
      
      expect(Array.isArray(results)).toBe(true);
    });

    it('should track unread messages', async () => {
      await validatorChat.initialize();
      
      const room = await validatorChat.createListingChatRoom(
        'listing-123',
        'seller-1',
        'buyer-1',
        'Test Product'
      );

      let unreadCount = validatorChat.getUnreadCount(room.id);
      expect(unreadCount).toBe(0);

      validatorChat.markAsRead(room.id);
      unreadCount = validatorChat.getUnreadCount(room.id);
      expect(unreadCount).toBe(0);
    });
  });

  describe('React Hooks', () => {
    it('should handle validator status', async () => {
      const { result } = renderHook(() => useValidatorStatus());
      
      expect(result.current.status.isInitialized).toBe(false);
      expect(result.current.isInitializing).toBe(false);
      
      await act(async () => {
        await result.current.initializeValidator('test-user-1');
      });
      
      expect(result.current.status.isInitialized).toBe(true);
    });

    it('should handle listing upload', async () => {
      const { result } = renderHook(() => useListingUpload());
      
      expect(result.current.uploadState.isUploading).toBe(false);
      expect(result.current.uploadState.progress).toBe(0);
      
      const metadata = { title: 'Test Listing', price: '100' };
      const images = [createMockFile('test.jpg', 'image/jpeg')];
      
      await act(async () => {
        await result.current.uploadListing(metadata, images);
      });
      
      expect(result.current.uploadState.progress).toBe(100);
    });

    it('should handle chat functionality', async () => {
      const { result } = renderHook(() => useValidatorChat());
      
      expect(result.current.chatState.rooms).toEqual([]);
      expect(result.current.chatState.messages).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      
      await act(async () => {
        await result.current.createListingChat(
          'listing-123',
          'seller-1',
          'buyer-1',
          'Test Product'
        );
      });
      
      expect(result.current.chatState.rooms.length).toBeGreaterThan(0);
    });

    it('should handle marketplace stats', async () => {
      const { result } = renderHook(() => useMarketplaceStats());
      
      expect(result.current.stats).toBeNull();
      expect(result.current.isLoading).toBe(false);
      
      await act(async () => {
        await result.current.loadStats();
      });
      
      expect(result.current.stats).toBeDefined();
    });

    it('should handle fee calculations', async () => {
      const { result } = renderHook(() => useFeeCalculation());
      
      await act(async () => {
        const fees = await result.current.calculateFees('1000', 'fixed');
        expect(fees.totalFees).toBe(26);
      });
    });

    it('should handle search functionality', async () => {
      const { result } = renderHook(() => useValidatorSearch());
      
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isSearching).toBe(false);
      
      await act(async () => {
        await result.current.searchListings('test');
      });
      
      expect(Array.isArray(result.current.searchResults)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle IPFS upload errors', async () => {
      await validatorIPFS.initialize();
      
      const invalidFile = createMockFile('test.invalid', 'application/invalid');
      
      await expect(validatorIPFS.uploadToIPFS(invalidFile)).rejects.toThrow();
    });

    it('should handle chat errors', async () => {
      await validatorChat.initialize();
      
      await expect(validatorChat.sendMessage('invalid-room', 'Hello')).rejects.toThrow();
    });

    it('should handle empty message content', async () => {
      await validatorChat.initialize();
      
      const room = await validatorChat.createListingChatRoom(
        'listing-123',
        'seller-1',
        'buyer-1',
        'Test Product'
      );

      await expect(validatorChat.sendMessage(room.id, '')).rejects.toThrow('Message content is required');
    });

    it('should handle message length limits', async () => {
      await validatorChat.initialize();
      
      const room = await validatorChat.createListingChatRoom(
        'listing-123',
        'seller-1',
        'buyer-1',
        'Test Product'
      );

      const longMessage = 'a'.repeat(1001);
      await expect(validatorChat.sendMessage(room.id, longMessage)).rejects.toThrow('Message exceeds maximum length');
    });
  });

  describe('Integration Flow', () => {
    it('should handle complete listing creation flow', async () => {
      // Initialize services
      await validatorIntegration.initialize();
      await validatorIPFS.initialize();
      
      // Create listing data
      const metadata = {
        title: 'Test Product',
        description: 'A test product for sale',
        price: '100',
        category: 'Electronics',
        seller: 'test-user-1'
      };

      const images = [
        createMockFile('product1.jpg', 'image/jpeg'),
        createMockFile('product2.png', 'image/png')
      ];

      // Upload images
      const imageHashes = await validatorIPFS.uploadMultipleFiles(images);
      expect(imageHashes.length).toBe(2);
      expect(imageHashes[0].success).toBe(true);
      expect(imageHashes[1].success).toBe(true);

      // Add image hashes to metadata
      const metadataWithImages = {
        ...metadata,
        images: imageHashes.map(result => result.hash)
      };

      // Upload metadata
      const metadataHash = await validatorIPFS.uploadMetadataToIPFS(metadataWithImages);
      expect(metadataHash).toBeDefined();

      // Verify data can be retrieved
      const retrievedMetadata = await validatorIPFS.getFromIPFS(metadataHash);
      expect(retrievedMetadata.title).toBe(metadata.title);
      expect(retrievedMetadata.images).toEqual(imageHashes.map(result => result.hash));
    });

    it('should handle complete chat flow', async () => {
      // Initialize services
      await validatorChat.initialize();
      await validatorIntegration.initialize();
      
      // Create chat room
      const room = await validatorChat.createListingChatRoom(
        'listing-456',
        'seller-2',
        'buyer-2',
        'Another Test Product'
      );

      expect(room).toBeDefined();
      expect(room.participants).toEqual(['seller-2', 'buyer-2']);

      // Send messages
      const message1 = await validatorChat.sendMessage(room.id, 'Is this item still available?');
      expect(message1.content).toBe('Is this item still available?');

      const message2 = await validatorChat.sendMessage(room.id, 'What is the condition?');
      expect(message2.content).toBe('What is the condition?');

      // Get messages
      const messages = await validatorChat.getMessages(room.id);
      expect(messages.length).toBeGreaterThan(0);

      // Send image
      const imageFile = createMockFile('condition.jpg', 'image/jpeg');
      const imageMessage = await validatorChat.sendImageMessage(room.id, imageFile);
      expect(imageMessage.messageType).toBe('image');
    });
  });
});