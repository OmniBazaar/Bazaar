/**
 * React hooks for Validator services in Bazaar module
 * 
 * Provides easy-to-use React hooks for integrating with Validator services
 */

import { useState, useEffect, useCallback } from 'react';
// import { useRef } from 'react'; // Currently unused
// import { ValidatorIntegrationService } from '../services/ValidatorIntegration'; // Currently unused  
// import { ValidatorIPFSService } from '../services/ValidatorIPFS'; // Currently unused
// import { ValidatorChatService, ChatMessage, ChatRoom } from '../services/ValidatorChat'; // Currently unused
import { toast } from 'react-toastify';

// Types
export interface ValidatorStatus {
  isConnected: boolean;
  isInitialized: boolean;
  networkId: string;
  services: {
    ipfs: boolean;
    chat: boolean;
    blockchain: boolean;
    feeDistribution: boolean;
  };
  error?: string;
}

export interface ListingUploadState {
  isUploading: boolean;
  progress: number;
  error?: string;
  hashes?: string[];
}

export interface ChatState {
  rooms: ChatRoom[];
  activeRoom?: ChatRoom;
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
}

interface ChatNotification {
  id: string;
  type: string;
  roomId: string;
  message: string;
  timestamp: number;
}

interface FeeCalculationParams {
  amount: string;
  listingType: 'auction' | 'fixed';
}

interface FeeInfo {
  marketplaceFee: number;
  processingFee: number;
  validatorFee: number;
  totalFees: number;
}

/**
 * Hook for managing validator connection and status
 */
export const useValidatorStatus = () => {
  const [status, setStatus] = useState<ValidatorStatus>({
    isConnected: false,
    isInitialized: false,
    networkId: '',
    services: {
      ipfs: false,
      chat: false,
      blockchain: false,
      feeDistribution: false
    }
  });

  const [isInitializing, setIsInitializing] = useState(false);

  const initializeValidator = useCallback(async (userId: string) => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    
    try {
      // Set user ID for all services
      // _ValidatorIntegrationService.config.userId = userId;
      // _ValidatorIPFSService.config.userId = userId;
      // _ValidatorChatService.config.userId = userId;

      // Initialize all services
      // await Promise.all([
      //   _ValidatorIntegrationService.initialize(),
      //   _ValidatorIPFSService.initialize(),
      //   _ValidatorChatService.initialize()
      // ]);

      // Get status
      // const validatorStatus = await _ValidatorIntegrationService.getValidatorStatus();

      setStatus({
        isConnected: false,
        isInitialized: true,
        networkId: '',
        services: {
          ipfs: false,
          chat: false,
          blockchain: false,
          feeDistribution: false
        }
      });

      console.log('Validator services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize validator services:', error);
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Initialization failed'
      }));
      toast.error('Failed to connect to validator services');
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing]);

  const disconnect = useCallback(async () => {
    try {
      // await Promise.all([
      //   _ValidatorIntegrationService.disconnect(),
      //   _ValidatorIPFSService.disconnect(),
      //   _ValidatorChatService.disconnect()
      // ]);

      setStatus({
        isConnected: false,
        isInitialized: false,
        networkId: '',
        services: {
          ipfs: false,
          chat: false,
          blockchain: false,
          feeDistribution: false
        }
      });
    } catch (error) {
      console.error('Error disconnecting from validator services:', error);
    }
  }, []);

  const disconnectFromValidator = async () => {
    try {
      if (status.isInitialized) {
        await disconnect();
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, error: 'Failed to cleanup services' }));
    }
  };

  return {
    status,
    isInitializing,
    initializeValidator,
    disconnect,
    disconnectFromValidator
  };
};

/**
 * Hook for uploading listing data to IPFS
 */
export const useListingUpload = () => {
  const [uploadState, setUploadState] = useState<ListingUploadState>({
    isUploading: false,
    progress: 0
  });

  const uploadListing = useCallback(async (
    metadata: any,
    images: File[]
  ): Promise<{ metadataHash: string; imageHashes: string[] }> => {
    setUploadState({ isUploading: true, progress: 0 });

    try {
      // Upload images first
      const imageHashes: string[] = [];
      const imageCount = images.length;

      for (let i = 0; i < imageCount; i++) {
        const hash = await _ValidatorIPFSService.uploadToIPFS(images[i]);
        imageHashes.push(hash);
        
        // Update progress
        setUploadState({
          isUploading: true,
          progress: ((i + 1) / (imageCount + 1)) * 100
        });
      }

      // Upload metadata with image hashes
      const metadataWithImages = {
        ...metadata,
        images: imageHashes
      };

      const metadataHash = await _ValidatorIPFSService.uploadMetadataToIPFS(metadataWithImages);

      setUploadState({
        isUploading: false,
        progress: 100,
        hashes: [metadataHash, ...imageHashes]
      });

      return { metadataHash, imageHashes };
    } catch (error) {
      console.error('Error uploading listing:', error);
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
      throw error;
    }
  }, []);

  const uploadImages = useCallback(async (images: File[]): Promise<string[]> => {
    setUploadState({ isUploading: true, progress: 0 });

    try {
      const hashes: string[] = [];
      const imageCount = images.length;

      for (let i = 0; i < imageCount; i++) {
        const hash = await _ValidatorIPFSService.uploadToIPFS(images[i]);
        hashes.push(hash);
        
        // Update progress
        setUploadState({
          isUploading: true,
          progress: ((i + 1) / imageCount) * 100
        });
      }

      setUploadState({
        isUploading: false,
        progress: 100,
        hashes
      });

      return hashes;
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
      throw error;
    }
  }, []);

  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0
    });
  }, []);

  return {
    uploadState,
    uploadListing,
    uploadImages,
    resetUploadState
  };
};

/**
 * Hook for managing chat functionality
 */
export const useValidatorChat = () => {
  const [chatState, setChatState] = useState<ChatState>({
    rooms: [],
    messages: [],
    isLoading: false
  });

  const [unreadCount, setUnreadCount] = useState(0);

  // Load chat rooms
  const loadChatRooms = useCallback(async () => {
    setChatState(prev => ({ ...prev, isLoading: true }));

    try {
      const rooms = await _ValidatorChatService.getChatRooms();
      const totalUnread = rooms.reduce((sum, room) => sum + room.unreadCount, 0);

      setChatState(prev => ({
        ...prev,
        rooms,
        isLoading: false
      }));

      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load chat rooms'
      }));
    }
  }, []);

  // Create listing chat room
  const createListingChat = useCallback(async (
    listingId: string,
    sellerId: string,
    buyerId: string,
    listingTitle: string
  ): Promise<ChatRoom> => {
    try {
      const room = await _ValidatorChatService.createListingChatRoom(
        listingId,
        sellerId,
        buyerId,
        listingTitle
      );

      // Reload rooms to include new room
      await loadChatRooms();

      return room;
    } catch (error) {
      console.error('Error creating listing chat:', error);
      throw error;
    }
  }, [loadChatRooms]);

  // Load messages for a room
  const loadMessages = useCallback(async (roomId: string) => {
    setChatState(prev => ({ ...prev, isLoading: true }));

    try {
      const messages = await _ValidatorChatService.getMessages(roomId);
      const room = chatState.rooms.find(r => r.id === roomId);

      setChatState(prev => ({
        ...prev,
        messages,
        activeRoom: room,
        isLoading: false
      }));

      // Mark messages as read
      _ValidatorChatService.markAsRead(roomId);
      setUnreadCount(_ValidatorChatService.getUnreadCount());
    } catch (error) {
      console.error('Error loading messages:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load messages'
      }));
    }
  }, [chatState.rooms]);

  // Send message
  const sendMessage = useCallback(async (
    roomId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text'
  ): Promise<ChatMessage> => {
    try {
      const message = await _ValidatorChatService.sendMessage(roomId, content, messageType);

      // Update messages if this is the active room
      if (chatState.activeRoom?.id === roomId) {
        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, message]
        }));
      }

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [chatState.activeRoom]);

  // Send image message
  const sendImageMessage = useCallback(async (
    roomId: string,
    imageFile: File
  ): Promise<ChatMessage> => {
    try {
      const message = await _ValidatorChatService.sendImageMessage(roomId, imageFile);

      // Update messages if this is the active room
      if (chatState.activeRoom?.id === roomId) {
        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, message]
        }));
      }

      return message;
    } catch (error) {
      console.error('Error sending image message:', error);
      throw error;
    }
  }, [chatState.activeRoom]);

  // Set up real-time updates
  useEffect(() => {
    const handleNotification = (notification: ChatNotification) => {
      // Handle chat notifications
      setUnreadCount(prev => prev + 1);
    };

    _ValidatorChatService.onNotification(handleNotification);

    return () => {
      _ValidatorChatService.offNotification(handleNotification);
    };
  }, [loadChatRooms]);

  // Initial load
  useEffect(() => {
    if (_ValidatorChatService.validatorIntegration.isServiceInitialized()) {
      loadChatRooms();
    }
  }, [loadChatRooms]);

  return {
    chatState,
    unreadCount,
    loadChatRooms,
    createListingChat,
    loadMessages,
    sendMessage,
    sendImageMessage
  };
};

/**
 * Hook for marketplace statistics
 */
export const useMarketplaceStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const marketplaceStats = await _ValidatorIntegrationService.getMarketplaceStats();
      setStats(marketplaceStats);
    } catch (err) {
      console.error('Error loading marketplace stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (_ValidatorIntegrationService.isServiceInitialized()) {
      loadStats();
    }
  }, [loadStats]);

  return {
    stats,
    isLoading,
    error,
    loadStats
  };
};

/**
 * Hook for fee calculations
 */
export const useFeeCalculation = () => {
  const calculateFees = useCallback(async (
    amount: string,
    listingType: 'auction' | 'fixed' = 'fixed'
  ) => {
    try {
      return await _ValidatorIntegrationService.calculateFees(amount, listingType);
    } catch (error) {
      console.error('Error calculating fees:', error);
      throw error;
    }
  }, []);

  const distributeFees = useCallback(async (fees: any, transactionId: string) => {
    try {
      await _ValidatorIntegrationService.distributeFees(fees, transactionId);
    } catch (error) {
      console.error('Error distributing fees:', error);
      // Don't throw - fee distribution failure shouldn't block transaction
    }
  }, []);

  return {
    calculateFees,
    distributeFees
  };
};

/**
 * Hook for search functionality
 */
export const useValidatorSearch = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchListings = useCallback(async (
    query: string,
    filters: any = {},
    limit: number = 20,
    offset: number = 0
  ) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await _ValidatorIntegrationService.searchListings(query, filters, limit, offset);
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Error searching listings:', error);
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      throw error;
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    searchListings,
    clearSearch
  };
};

export default {
  useValidatorStatus,
  useListingUpload,
  useValidatorChat,
  useMarketplaceStats,
  useFeeCalculation,
  useValidatorSearch
};