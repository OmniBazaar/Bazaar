/**
 * Validator Integration Service for Bazaar Module
 * 
 * Main service for integrating with Validator services including IPFS, chat, and blockchain
 */

import { ValidatorClient } from '../../../Validator/src/client/ValidatorClient';
import { IPFSStorageNetwork } from '../../../Validator/src/services/storage/IPFSStorageNetwork';
import { P2PChatNetwork } from '../../../Validator/src/services/chat/P2PChatNetwork';
import { OmniCoinBlockchain } from '../../../Validator/src/core/OmniCoinBlockchain';
import { FeeDistributionEngine } from '../../../Validator/src/core/FeeDistributionEngine';
import { toast } from 'react-toastify';

export interface ValidatorIntegrationConfig {
  validatorEndpoint: string;
  networkId: string;
  userId: string;
  enableChat: boolean;
  enableFeeDistribution: boolean;
}

export interface ListingStorageResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  recipient: string;
  timestamp: number;
  listingId?: string;
  messageType: 'text' | 'image' | 'file';
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface FeeInfo {
  marketplaceFee: number;
  processingFee: number;
  validatorFee: number;
  totalFees: number;
}

export class ValidatorIntegrationService {
  private validatorClient: ValidatorClient;
  private config: ValidatorIntegrationConfig;
  private storage: IPFSStorageNetwork | null = null;
  private chat: P2PChatNetwork | null = null;
  private blockchain: OmniCoinBlockchain | null = null;
  private feeDistribution: FeeDistributionEngine | null = null;
  private isInitialized = false;

  constructor(config: ValidatorIntegrationConfig) {
    this.config = config;
    this.validatorClient = new ValidatorClient({
      endpoint: config.validatorEndpoint,
      enableWebSocket: true,
      enableCaching: true
    });
  }

  /**
   * Initialize the validator integration service
   */
  async initialize(): Promise<void> {
    try {
      // Initialize all services with retry logic
      await this.validatorClient.connect();
      
      // Initialize distributed storage
      this.storage = new IPFSStorageNetwork({
        validatorEndpoint: this.config.validatorEndpoint,
        networkId: this.config.networkId
      });
      await this.storage.initialize();

      // Initialize P2P chat if enabled
      if (this.config.enableChat) {
        this.chat = new P2PChatNetwork({
          validatorEndpoint: this.config.validatorEndpoint,
          networkId: this.config.networkId,
          userId: this.config.userId
        });
        await this.chat.initialize();
      }

      // Initialize blockchain integration
      this.blockchain = new OmniCoinBlockchain({
        validatorEndpoint: this.config.validatorEndpoint,
        networkId: this.config.networkId
      });
      await this.blockchain.initialize();

      // Initialize fee distribution if enabled
      if (this.config.enableFeeDistribution) {
        this.feeDistribution = new FeeDistributionEngine({
          validatorEndpoint: this.config.validatorEndpoint,
          networkId: this.config.networkId
        });
        await this.feeDistribution.initialize();
      }

      this.isInitialized = true;
    } catch (error) {
      toast.error('Failed to connect to Validator services');
      throw error;
    }
  }

  /**
   * Store listing data on Validator IPFS
   */
  async storeListingData(_data: Record<string, unknown>, _filename: string): Promise<ListingStorageResult> {
    this.ensureInitialized();

    try {
      if (!this.storage) {
        throw new Error('Storage not initialized');
      }

      // Store data using validator IPFS service
      const result = await this.storage.uploadData(_data, _filename);
      
      if (result.success && result.hash) {
        return {
          success: true,
          hash: result.hash
        };
      } else {
        return {
          success: false,
          error: result.error ?? 'Upload failed'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Storage failed';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Store listing image on Validator IPFS
   */
  async storeListingImage(imageFile: File): Promise<ListingStorageResult> {
    this.ensureInitialized();
    
    try {
      if (!this.storage) {
        throw new Error('Storage service not available');
      }

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const result = await this.storage.storeData(
        buffer,
        imageFile.name,
        imageFile.type,
        this.config.userId
      );

      if (result.success) {
        return {
          success: true,
          hash: result.hash
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Retrieve listing data from Validator IPFS
   */
  async retrieveListingData(hash: string): Promise<Record<string, unknown>> {
    this.ensureInitialized();

    try {
      if (!this.storage) {
        throw new Error('Storage not initialized');
      }

      // Retrieve data using validator IPFS service
      const data = await this.storage.retrieveData(hash);
      
      if (data) {
        return data;
      } else {
        throw new Error(`Data not found for hash: ${hash}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Retrieval failed';
      throw new Error(`Failed to retrieve listing data: ${errorMessage}`);
    }
  }

  /**
   * Send chat message for listing communication
   */
  async sendChatMessage(
    recipientId: string,
    content: string,
    listingId?: string,
    messageType: 'text' | 'image' | 'file' = 'text'
  ): Promise<ChatMessage> {
    this.ensureInitialized();
    
    try {
      if (!this.chat) {
        throw new Error('Chat service not available');
      }

      const messageData = {
        content,
        recipientId,
        senderId: this.config.userId,
        listingId,
        messageType,
        timestamp: Date.now()
      };

      const result = await this.chat.sendMessage(messageData);
      
      if (result.success) {
        return {
          id: result.messageId!,
          content,
          sender: this.config.userId,
          recipient: recipientId,
          timestamp: Date.now(),
          listingId,
          messageType
        };
      } else {
        throw new Error(result.error ?? 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
      throw error;
    }
  }

  /**
   * Get chat messages for a listing
   */
  async getChatMessages(
    listingId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    this.ensureInitialized();
    
    try {
      if (!this.chat) {
        throw new Error('Chat service not available');
      }

      const channelId = `listing-${listingId}`;
      const messages = await this.chat.getMessages(channelId, limit, offset);
      
      return messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.senderId,
        recipient: msg.recipientId,
        timestamp: msg.timestamp,
        listingId: msg.listingId,
        messageType: msg.messageType || 'text'
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process marketplace transaction through Validator
   */
  async processTransaction(
    transactionData: any
  ): Promise<TransactionResult> {
    this.ensureInitialized();
    
    try {
      if (!this.blockchain) {
        throw new Error('Blockchain service not available');
      }

      const result = await this.blockchain.submitTransaction(transactionData);
      
      if (result.success) {
        return {
          success: true,
          txHash: result.txHash
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate marketplace fees
   */
  async calculateFees(amount: string, listingType: 'auction' | 'fixed' = 'fixed'): Promise<FeeInfo> {
    this.ensureInitialized();
    
    try {
      const amountBN = BigInt(amount);
      
      // Basic fee structure - can be enhanced with actual fee service
      const marketplaceFeeRate = listingType === 'auction' ? 0.025 : 0.02; // 2.5% or 2%
      const processingFeeRate = 0.005; // 0.5%
      const validatorFeeRate = 0.001; // 0.1%
      
      const marketplaceFee = Number(amountBN) * marketplaceFeeRate;
      const processingFee = Number(amountBN) * processingFeeRate;
      const validatorFee = Number(amountBN) * validatorFeeRate;
      const totalFees = marketplaceFee + processingFee + validatorFee;
      
      return {
        marketplaceFee,
        processingFee,
        validatorFee,
        totalFees
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Distribute fees to validators
   */
  async distributeFees(fees: FeeInfo, transactionId: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      if (!this.feeDistribution) {
        throw new Error('Fee distribution service not available');
      }

      // Record the fees for distribution
      await this.feeDistribution.recordTradingFees({
        amount: fees.totalFees.toString(),
        transactionId,
        userId: this.config.userId,
        timestamp: Date.now()
      });

    } catch (error) {
      // Don't throw error - fee distribution failure shouldn't block transaction
    }
  }

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats(): Promise<any> {
    this.ensureInitialized();
    
    try {
      // TODO: Implement actual marketplace statistics
      return {
        totalListings: 1250,
        activeListings: 890,
        totalTransactions: 5670,
        totalVolume: '125000',
        averageTransactionValue: '22.05',
        topCategories: ['Electronics', 'Fashion', 'Home & Garden'],
        timestamp: Date.now()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get validator network status
   */
  async getValidatorStatus(): Promise<any> {
    this.ensureInitialized();
    
    try {
      const status = await this.validatorClient.getStatus();
      return {
        isConnected: status.isOnline,
        networkId: this.config.networkId,
        services: status.services,
        resourceUsage: status.resourceUsage
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search listings on Validator storage
   */
  async searchListings(
    query: string,
    _filters: any = {},
    _limit: number = 20,
    _offset: number = 0
  ): Promise<any[]> {
    this.ensureInitialized();
    
    try {
      // TODO: Implement actual search functionality
      // For now, return mock search results
      return [
        {
          id: 'listing-1',
          title: 'Sample Listing 1',
          description: 'This is a sample listing',
          price: '100',
          category: 'Electronics',
          seller: 'user123',
          images: ['hash1', 'hash2'],
          timestamp: Date.now()
        }
      ];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToUpdates(callback: (event: any) => void): void {
    this.ensureInitialized();
    
    try {
      // Subscribe to chat messages
      this.validatorClient.on('websocketMessage', (data) => {
        if (data.type === 'chat_message') {
          callback({
            type: 'chat_message',
            data: data.message
          });
        }
      });

      // Subscribe to transaction updates
      this.validatorClient.on('websocketMessage', (data) => {
        if (data.type === 'transaction_update') {
          callback({
            type: 'transaction_update',
            data: data.transaction
          });
        }
      });
    } catch (error) {
    }
  }

  /**
   * Disconnect from validator services
   */
  async disconnect(): Promise<void> {
    if (this.validatorClient) {
      await this.validatorClient.disconnect();
    }
    this.isInitialized = false;
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  // Private helper methods
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Validator Integration Service not initialized. Call initialize() first.');
    }
  }
}

// Export configured instance for easy use
export const validatorIntegration = new ValidatorIntegrationService({
  validatorEndpoint: process.env['REACT_APP_VALIDATOR_ENDPOINT'] ?? 'localhost',
  networkId: process.env['REACT_APP_NETWORK_ID'] ?? 'omnibazaar-mainnet',
  userId: '', // Will be set when user logs in
  enableChat: true,
  enableFeeDistribution: true
});

export default ValidatorIntegrationService;