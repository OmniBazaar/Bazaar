// Clean IPFS implementation without unused dependencies

interface IPFSConfig {
  apiUrl: string;
  gatewayUrl: string;
}

const config: IPFSConfig = {
  apiUrl: process.env['REACT_APP_IPFS_API_URL'] ?? 'https://ipfs.infura.io:5001',
  gatewayUrl: process.env['REACT_APP_IPFS_GATEWAY_URL'] ?? 'https://ipfs.io'
};

export class IPFSError extends Error {
  constructor(message: string, public readonly operation: string) {
    super(message);
    this.name = 'IPFSError';
  }
}

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${config.apiUrl}/api/v0/add`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new IPFSError('Failed to upload file to IPFS', 'upload');
    }

    const result = await response.json();
    return result.Hash;
  } catch (error) {
    if (error instanceof IPFSError) {
      throw error;
    }
    throw new IPFSError(
      `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'upload'
    );
  }
};

export const uploadMetadataToIPFS = async (metadata: Record<string, unknown>): Promise<string> => {
  try {
    const response = await fetch(`${config.apiUrl}/api/v0/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new IPFSError('Failed to upload metadata to IPFS', 'uploadMetadata');
    }

    const result = await response.json();
    return result.Hash;
  } catch (error) {
    if (error instanceof IPFSError) {
      throw error;
    }
    throw new IPFSError(
      `Metadata upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'uploadMetadata'
    );
  }
};

export const getFromIPFS = async (hash: string): Promise<Record<string, unknown>> => {
  try {
    if (!hash) {
      throw new IPFSError('Hash is required', 'get');
    }

    const response = await fetch(`${config.gatewayUrl}/ipfs/${hash}`);
    
    if (!response.ok) {
      throw new IPFSError(`Failed to fetch from IPFS: ${response.status}`, 'get');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof IPFSError) {
      throw error;
    }
    throw new IPFSError(
      `Get failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'get'
    );
  }
};

export const pinToIPFS = async (hash: string): Promise<void> => {
  try {
    if (!hash) {
      throw new IPFSError('Hash is required', 'pin');
    }

    const response = await fetch(`${config.apiUrl}/api/v0/pin/add?arg=${hash}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new IPFSError('Failed to pin to IPFS', 'pin');
    }
  } catch (error) {
    if (error instanceof IPFSError) {
      throw error;
    }
    throw new IPFSError(
      `Pin failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'pin'
    );
  }
};

export const unpinFromIPFS = async (hash: string): Promise<void> => {
  try {
    if (!hash) {
      throw new IPFSError('Hash is required', 'unpin');
    }

    const response = await fetch(`${config.apiUrl}/api/v0/pin/rm?arg=${hash}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new IPFSError('Failed to unpin from IPFS', 'unpin');
    }
  } catch (error) {
    if (error instanceof IPFSError) {
      throw error;
    }
    throw new IPFSError(
      `Unpin failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'unpin'
    );
  }
}; 