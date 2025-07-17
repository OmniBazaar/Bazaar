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
      console.log('Initializing Validator Integration Service...');
      
      await this.validatorClient.initialize();
      
      // Get service instances
      this.storage = this.validatorClient.getStorage();
      this.chat = this.validatorClient.getChat();
      this.blockchain = this.validatorClient.getBlockchain();
      this.feeDistribution = this.validatorClient.getFeeDistribution();

      this.isInitialized = true;
      console.log('Validator Integration Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Validator Integration Service:', error);
      toast.error('Failed to connect to Validator services');
      throw error;
    }
  }

  /**
   * Store listing data on Validator IPFS
   */
  async storeListingData(data: any, filename: string): Promise<ListingStorageResult> {
    this.ensureInitialized();
    
    try {
      if (!this.storage) {
        throw new Error('Storage service not available');
      }

      const buffer = Buffer.from(JSON.stringify(data));
      const result = await this.storage.storeData(
        buffer,
        filename,
        'application/json',
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
      console.error('Error storing listing data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
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
      console.error('Error storing listing image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Retrieve listing data from Validator IPFS
   */
  async retrieveListingData(hash: string): Promise<any> {
    this.ensureInitialized();
    
    try {
      if (!this.storage) {
        throw new Error('Storage service not available');
      }

      const result = await this.storage.retrieveData(hash);
      
      if (result.success && result.data) {
        return JSON.parse(result.data.toString());
      } else {
        throw new Error(result.error || 'Failed to retrieve data');
      }
    } catch (error) {
      console.error('Error retrieving listing data:', error);
      throw error;
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
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
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
      console.error('Error getting chat messages:', error);
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
      console.error('Error processing transaction:', error);
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
      console.error('Error calculating fees:', error);
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

      console.log('Fees recorded for distribution:', fees);
    } catch (error) {
      console.error('Error distributing fees:', error);
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
      console.error('Error getting marketplace stats:', error);
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
      console.error('Error getting validator status:', error);
      throw error;
    }
  }

  /**
   * Search listings on Validator storage
   */
  async searchListings(
    query: string,
    filters: any = {},
    limit: number = 20,
    offset: number = 0
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
      console.error('Error searching listings:', error);
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
      console.error('Error subscribing to updates:', error);
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
    console.log('Validator Integration Service disconnected');
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

// Export singleton instance for easy use
export const validatorIntegration = new ValidatorIntegrationService({
  validatorEndpoint: process.env.REACT_APP_VALIDATOR_ENDPOINT || 'localhost',
  networkId: process.env.REACT_APP_NETWORK_ID || 'omnibazaar-mainnet',
  userId: '', // Will be set when user logs in
  enableChat: true,
  enableFeeDistribution: true
});

export default ValidatorIntegrationService;