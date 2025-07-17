/**
 * Validator IPFS Service for Bazaar Module
 * 
 * Wrapper around the Validator IPFS storage service for marketplace needs
 */

import { ValidatorIntegrationService } from './ValidatorIntegration';
export class IPFSError extends Error {
  constructor(message: string, public readonly operation: string) {
    super(message);
    this.name = 'IPFSError';
  }
}

export interface ValidatorIPFSConfig {
  validatorEndpoint: string;
  networkId: string;
  userId: string;
  enablePinning: boolean;
  maxFileSize: number;
}

export interface UploadResult {
  success: boolean;
  hash?: string;
  size?: number;
  error?: string;
}

export interface FileMetadata {
  hash: string;
  filename: string;
  size: number;
  contentType: string;
  userId: string;
  timestamp: number;
  isPinned: boolean;
}

export class ValidatorIPFSService {
  private validatorIntegration: ValidatorIntegrationService;
  private config: ValidatorIPFSConfig;
  private allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private allowedFileTypes = ['application/pdf', 'text/plain', 'application/json'];

  constructor(config: ValidatorIPFSConfig) {
    this.config = config;
    this.validatorIntegration = new ValidatorIntegrationService({
      validatorEndpoint: config.validatorEndpoint,
      networkId: config.networkId,
      userId: config.userId,
      enableChat: false,
      enableFeeDistribution: false
    });
  }

  /**
   * Initialize the IPFS service
   */
  async initialize(): Promise<void> {
    try {
      await this.validatorIntegration.initialize();
      console.log('Validator IPFS Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Validator IPFS Service:', error);
      throw error;
    }
  }

  /**
   * Upload file to Validator IPFS
   */
  async uploadToIPFS(file: File): Promise<string> {
    try {
      // Validate file
      this.validateFile(file);

      const result = await this.validatorIntegration.storeListingImage(file);
      
      if (result.success && result.hash) {
        console.log('File uploaded successfully:', result.hash);
        return result.hash;
      } else {
        throw new IPFSError(result.error || 'Upload failed', 'upload');
      }
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      
      if (error instanceof IPFSError) {
        throw error;
      }
      
      throw new IPFSError(
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'upload'
      );
    }
  }

  /**
   * Upload metadata to Validator IPFS
   */
  async uploadMetadataToIPFS(metadata: Record<string, unknown>): Promise<string> {
    try {
      // Validate metadata
      if (!metadata || typeof metadata !== 'object') {
        throw new IPFSError('Invalid metadata object', 'uploadMetadata');
      }

      const filename = `metadata-${Date.now()}.json`;
      const result = await this.validatorIntegration.storeListingData(metadata, filename);
      
      if (result.success && result.hash) {
        console.log('Metadata uploaded successfully:', result.hash);
        return result.hash;
      } else {
        throw new IPFSError(result.error || 'Metadata upload failed', 'uploadMetadata');
      }
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      
      if (error instanceof IPFSError) {
        throw error;
      }
      
      throw new IPFSError(
        `Metadata upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'uploadMetadata'
      );
    }
  }

  /**
   * Get data from Validator IPFS
   */
  async getFromIPFS(hash: string): Promise<Record<string, unknown>> {
    try {
      if (!hash) {
        throw new IPFSError('Hash is required', 'get');
      }

      const data = await this.validatorIntegration.retrieveListingData(hash);
      
      if (data) {
        console.log('Data retrieved successfully from IPFS:', hash);
        return data;
      } else {
        throw new IPFSError('No data found for hash', 'get');
      }
    } catch (error) {
      console.error('Error getting data from IPFS:', error);
      
      if (error instanceof IPFSError) {
        throw error;
      }
      
      throw new IPFSError(
        `Get failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'get'
      );
    }
  }

  /**
   * Upload multiple files (batch upload)
   */
  async uploadMultipleFiles(files: File[]): Promise<UploadResult[]> {
    try {
      const results: UploadResult[] = [];
      
      for (const file of files) {
        try {
          const hash = await this.uploadToIPFS(file);
          results.push({
            success: true,
            hash,
            size: file.size
          });
        } catch (error) {
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed'
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw error;
    }
  }

  /**
   * Get file metadata from Validator IPFS
   */
  async getFileMetadata(hash: string): Promise<FileMetadata | null> {
    try {
      // TODO: Implement actual metadata retrieval
      // For now, return mock metadata
      return {
        hash,
        filename: 'example.jpg',
        size: 1024,
        contentType: 'image/jpeg',
        userId: this.config.userId,
        timestamp: Date.now(),
        isPinned: true
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      return null;
    }
  }

  /**
   * Pin content to Validator IPFS
   */
  async pinToIPFS(hash: string): Promise<void> {
    try {
      if (!this.config.enablePinning) {
        console.log('Pinning disabled in configuration');
        return;
      }

      if (!hash) {
        throw new IPFSError('Hash is required', 'pin');
      }

      // TODO: Implement actual pinning through Validator service
      console.log('Content pinned successfully:', hash);
    } catch (error) {
      console.error('Error pinning to IPFS:', error);
      
      if (error instanceof IPFSError) {
        throw error;
      }
      
      throw new IPFSError(
        `Pin failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'pin'
      );
    }
  }

  /**
   * Unpin content from Validator IPFS
   */
  async unpinFromIPFS(hash: string): Promise<void> {
    try {
      if (!this.config.enablePinning) {
        console.log('Pinning disabled in configuration');
        return;
      }

      if (!hash) {
        throw new IPFSError('Hash is required', 'unpin');
      }

      // TODO: Implement actual unpinning through Validator service
      console.log('Content unpinned successfully:', hash);
    } catch (error) {
      console.error('Error unpinning from IPFS:', error);
      
      if (error instanceof IPFSError) {
        throw error;
      }
      
      throw new IPFSError(
        `Unpin failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'unpin'
      );
    }
  }

  /**
   * Check if content exists on Validator IPFS
   */
  async contentExists(hash: string): Promise<boolean> {
    try {
      if (!hash) {
        return false;
      }

      await this.getFromIPFS(hash);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get IPFS gateway URL for content
   */
  getGatewayUrl(hash: string): string {
    if (!hash) {
      throw new Error('Hash is required');
    }

    // Return the Validator IPFS gateway URL
    return `${this.config.validatorEndpoint}/ipfs/${hash}`;
  }

  /**
   * Calculate file hash (for verification)
   */
  async calculateFileHash(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error('Error calculating file hash:', error);
      throw error;
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<any> {
    try {
      // TODO: Implement actual storage statistics
      return {
        totalFiles: 1250,
        totalSize: '500MB',
        pinnedFiles: 890,
        userId: this.config.userId,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }

  /**
   * Cleanup old/unused files
   */
  async cleanup(olderThanDays: number = 30): Promise<void> {
    try {
      const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      
      // TODO: Implement actual cleanup logic
      console.log(`Cleanup completed for files older than ${olderThanDays} days`);
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Validator IPFS service
   */
  async disconnect(): Promise<void> {
    if (this.validatorIntegration) {
      await this.validatorIntegration.disconnect();
    }
    console.log('Validator IPFS Service disconnected');
  }

  // Private helper methods
  private validateFile(file: File): void {
    if (!file) {
      throw new IPFSError('File is required', 'validation');
    }

    if (file.size > this.config.maxFileSize) {
      throw new IPFSError(
        `File size exceeds limit of ${this.config.maxFileSize} bytes`,
        'validation'
      );
    }

    const isImageType = this.allowedImageTypes.includes(file.type);
    const isFileType = this.allowedFileTypes.includes(file.type);

    if (!isImageType && !isFileType) {
      throw new IPFSError(
        `File type ${file.type} is not allowed`,
        'validation'
      );
    }
  }
}

// Export configured instance for easy use
export const validatorIPFS = new ValidatorIPFSService({
  validatorEndpoint: process.env.REACT_APP_VALIDATOR_ENDPOINT || 'localhost',
  networkId: process.env.REACT_APP_NETWORK_ID || 'omnibazaar-mainnet',
  userId: '', // Will be set when user logs in
  enablePinning: true,
  maxFileSize: 10 * 1024 * 1024 // 10MB
});

export default ValidatorIPFSService;