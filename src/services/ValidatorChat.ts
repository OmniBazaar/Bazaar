/**
 * Validator Chat Service for Bazaar Module
 * 
 * Handles P2P chat functionality for buyer-seller communication
 */

import { ValidatorIntegrationService, ChatMessage } from './ValidatorIntegration';
import { toast } from 'react-toastify';

export interface ValidatorChatConfig {
  validatorEndpoint: string;
  networkId: string;
  userId: string;
  enableNotifications: boolean;
  maxMessageLength: number;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  listingId?: string;
  title: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  created: number;
  updated: number;
}

export interface ChatNotification {
  id: string;
  type: 'message' | 'room_created' | 'user_joined' | 'user_left';
  roomId: string;
  userId?: string;
  message?: string;
  timestamp: number;
}

export interface TypingIndicator {
  userId: string;
  roomId: string;
  isTyping: boolean;
  timestamp: number;
}

export class ValidatorChatService {
  private validatorIntegration: ValidatorIntegrationService;
  private config: ValidatorChatConfig;
  private activeRooms: Map<string, ChatRoom> = new Map();
  private messageCache: Map<string, ChatMessage[]> = new Map();
  private typingIndicators: Map<string, TypingIndicator> = new Map();
  private notificationCallbacks: Array<(notification: ChatNotification) => void> = [];

  constructor(config: ValidatorChatConfig) {
    this.config = config;
    this.validatorIntegration = new ValidatorIntegrationService({
      validatorEndpoint: config.validatorEndpoint,
      networkId: config.networkId,
      userId: config.userId,
      enableChat: true,
      enableFeeDistribution: false
    });
  }

  /**
   * Initialize the chat service
   */
  async initialize(): Promise<void> {
    try {
      // Initialize validator integration
      await this.validatorIntegration.initialize();
      
      // Get initial chat rooms
      const rooms = await this.getChatRooms();
      this.activeRooms = new Map(rooms.map(room => [room.id, room]));
      
      // Subscribe to real-time updates
      this.validatorIntegration.subscribeToUpdates(this.handleRealtimeUpdate.bind(this));
      
    } catch (error) {
      throw new Error(`Failed to initialize chat service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create or get chat room for listing
   */
  async createListingChatRoom(
    listingId: string,
    sellerId: string,
    buyerId: string,
    listingTitle: string
  ): Promise<ChatRoom> {
    try {
      const roomId = `listing-${listingId}-${sellerId}-${buyerId}`;
      
      // Check if room already exists
      const existingRoom = this.activeRooms.get(roomId);
      if (existingRoom) {
        return existingRoom;
      }

      // Create new room
      const room: ChatRoom = {
        id: roomId,
        participants: [sellerId, buyerId],
        listingId,
        title: `Chat for: ${listingTitle ?? 'Unknown listing'}`,
        unreadCount: 0,
        created: Date.now(),
        updated: Date.now()
      };

      this.activeRooms.set(roomId, room);
      
      // Notify participants
      this.notifyParticipants(room, {
        id: `notification-${Date.now()}`,
        type: 'room_created',
        roomId: room.id,
        message: `Chat room created for listing: ${listingTitle}`,
        timestamp: Date.now()
      });

      return room;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  /**
   * Send message to chat room
   */
  async sendMessage(
    roomId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text'
  ): Promise<ChatMessage> {
    try {
      // Validate message
      if (!content || content.trim().length === 0) {
        throw new Error('Message content is required');
      }

      if (content.length > this.config.maxMessageLength) {
        throw new Error(`Message exceeds maximum length of ${this.config.maxMessageLength} characters`);
      }

      const room = this.activeRooms.get(roomId);
      if (!room) {
        throw new Error('Chat room not found');
      }

      // Find recipient
      const recipient = room.participants.find(p => p !== this.config.userId);
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      // Send message through validator service
      const message = await this.validatorIntegration.sendChatMessage(
        recipient,
        content,
        room.listingId,
        messageType
      );

      // Update local cache
      this.addMessageToCache(roomId, message);

      // Update room
      room.lastMessage = message;
      room.updated = Date.now();

      // Notify participants
      this.notifyParticipants(room, {
        id: `notification-${Date.now()}`,
        type: 'message',
        roomId,
        userId: this.config.userId,
        message: content,
        timestamp: Date.now()
      });

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  }

  /**
   * Get messages for a chat room
   */
  async getMessages(
    roomId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) {
        throw new Error('Chat room not found');
      }

      // Check cache first
      const cachedMessages = this.messageCache.get(roomId);
      if (cachedMessages && offset === 0) {
        return cachedMessages.slice(0, limit);
      }

      // Fetch from validator service
      const messages = await this.validatorIntegration.getChatMessages(
        room.listingId || roomId,
        limit,
        offset
      );

      // Update cache
      this.messageCache.set(roomId, messages);

      return messages;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Get all chat rooms for user
   */
  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      // TODO: Implement actual room retrieval from validator service
      // For now, return cached rooms
      return Array.from(this.activeRooms.values()).sort((a, b) => b.updated - a.updated);
    } catch (error) {
      console.error('Error getting chat rooms:', error);
      throw error;
    }
  }

  /**
   * Get unread message count
   */
  getUnreadCount(roomId?: string): number {
    if (roomId) {
      const room = this.activeRooms.get(roomId);
      return room?.unreadCount || 0;
    }

    // Return total unread count
    return Array.from(this.activeRooms.values())
      .reduce((total, room) => total + room.unreadCount, 0);
  }

  /**
   * Mark messages as read
   */
  markAsRead(roomId: string): void {
    const room = this.activeRooms.get(roomId);
    if (room) {
      room.unreadCount = 0;
    }
  }

  /**
   * Start typing indicator
   */
  startTyping(roomId: string): void {
    const indicator: TypingIndicator = {
      userId: this.config.userId,
      roomId,
      isTyping: true,
      timestamp: Date.now()
    };

    this.typingIndicators.set(`${roomId}-${this.config.userId}`, indicator);
    
    // TODO: Send typing indicator to other participants
  }

  /**
   * Stop typing indicator
   */
  stopTyping(roomId: string): void {
    const key = `${roomId}-${this.config.userId}`;
    this.typingIndicators.delete(key);
    
    // TODO: Send stop typing indicator to other participants
  }

  /**
   * Get typing indicators for room
   */
  getTypingIndicators(roomId: string): TypingIndicator[] {
    const indicators: TypingIndicator[] = [];
    
    this.typingIndicators.forEach((indicator) => {
      if (indicator.roomId === roomId && indicator.userId !== this.config.userId) {
        indicators.push(indicator);
      }
    });

    return indicators;
  }

  /**
   * Send image message
   */
  async sendImageMessage(roomId: string, imageFile: File): Promise<ChatMessage> {
    try {
      // Upload image to IPFS first
      const imageHash = await this.validatorIntegration.storeListingImage(imageFile);
      
      if (!imageHash.success) {
        throw new Error('Failed to upload image');
      }

      // Send message with image hash
      const message = await this.sendMessage(
        roomId,
        `Image: ${imageHash.hash}`,
        'image'
      );

      return message;
    } catch (error) {
      console.error('Error sending image message:', error);
      throw error;
    }
  }

  /**
   * Send file message
   */
  async sendFileMessage(roomId: string, file: File): Promise<ChatMessage> {
    try {
      // Read file as buffer for upload
      const _fileBuffer = await file.arrayBuffer();
      const fileHash = await this.validatorIntegration.storeListingData(
        { filename: file.name, size: file.size, type: file.type },
        file.name
      );
      
      if (!fileHash.success) {
        throw new Error('Failed to upload file');
      }

      // Send message with file hash
      const message = await this.sendMessage(
        roomId,
        `File: ${file.name} (${fileHash.hash})`,
        'file'
      );

      return message;
    } catch (error) {
      console.error('Error sending file message:', error);
      throw error;
    }
  }

  /**
   * Search messages
   */
  async searchMessages(query: string, roomId?: string): Promise<ChatMessage[]> {
    try {
      const results: ChatMessage[] = [];
      
      // Search in specific room or all rooms
      const rooms = roomId ? [roomId] : Array.from(this.activeRooms.keys());
      
      for (const rid of rooms) {
        const messages = await this.getMessages(rid, 1000, 0);
        const filteredMessages = messages.filter(msg => 
          msg.content.toLowerCase().includes(query.toLowerCase())
        );
        results.push(...filteredMessages);
      }

      return results.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(roomId: string, messageId: string): Promise<void> {
    try {
      // Remove from cache
      const messages = this.messageCache.get(roomId);
      if (messages) {
        const filteredMessages = messages.filter(msg => msg.id !== messageId);
        this.messageCache.set(roomId, filteredMessages);
      }

      // TODO: Delete from validator service
      console.log('Message deleted:', messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Subscribe to notifications
   */
  onNotification(callback: (notification: ChatNotification) => void): void {
    this.notificationCallbacks.push(callback);
  }

  /**
   * Unsubscribe from notifications
   */
  offNotification(callback: (notification: ChatNotification) => void): void {
    const index = this.notificationCallbacks.indexOf(callback);
    if (index > -1) {
      this.notificationCallbacks.splice(index, 1);
    }
  }

  /**
   * Disconnect from chat service
   */
  async disconnect(): Promise<void> {
    if (this.validatorIntegration) {
      await this.validatorIntegration.disconnect();
    }
    
    // Clear caches
    this.activeRooms.clear();
    this.messageCache.clear();
    this.typingIndicators.clear();
    this.notificationCallbacks.length = 0;
    
    console.log('Validator Chat Service disconnected');
  }

  // Private helper methods
  private addMessageToCache(roomId: string, message: ChatMessage): void {
    const messages = this.messageCache.get(roomId) || [];
    messages.push(message);
    this.messageCache.set(roomId, messages);
  }

  private handleRealtimeUpdate(event: any): void {
    if (event.type === 'chat_message') {
      const message = event.data as ChatMessage;
      
      // Find room for this message
      const room = Array.from(this.activeRooms.values()).find(r => 
        r.participants.includes(message.sender) && r.participants.includes(message.recipient)
      );

      if (room) {
        // Add to cache
        this.addMessageToCache(room.id, message);
        
        // Update room
        room.lastMessage = message;
        room.updated = Date.now();
        
        // Increment unread count if message is from someone else
        if (message.sender !== this.config.userId) {
          room.unreadCount++;
        }

        // Show notification
        if (this.config.enableNotifications && message.sender !== this.config.userId) {
          toast.info(`New message from ${message.sender}: ${message.content}`);
        }
      }
    }
  }

  private notifyParticipants(room: ChatRoom, notification: ChatNotification): void {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }
}

// Export configured instance for easy use
export const validatorChat = new ValidatorChatService({
  validatorEndpoint: process.env['REACT_APP_VALIDATOR_ENDPOINT'] ?? 'localhost',
  networkId: process.env['REACT_APP_NETWORK_ID'] ?? 'omnibazaar-mainnet',
  userId: '', // Will be set when user logs in
  enableNotifications: true,
  maxMessageLength: 1000
});

export default ValidatorChatService;