import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import { toast } from 'react-toastify';

const projectId = process.env.REACT_APP_INFURA_IPFS_PROJECT_ID;
const projectSecret = process.env.REACT_APP_INFURA_IPFS_PROJECT_SECRET;
const endpoint = process.env.REACT_APP_INFURA_IPFS_ENDPOINT || 'https://ipfs.infura.io:5001';

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const added = await ipfs.add(file);
    return added.path;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    toast.error('Failed to upload file to IPFS');
    throw error;
  }
};

export const uploadMetadataToIPFS = async (metadata: any): Promise<string> => {
  try {
    const data = JSON.stringify(metadata);
    const added = await ipfs.add(data);
    return added.path;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    toast.error('Failed to upload metadata to IPFS');
    throw error;
  }
};

export const getFromIPFS = async (hash: string): Promise<any> => {
  try {
    const stream = ipfs.cat(hash);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks).toString();
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting data from IPFS:', error);
    toast.error('Failed to get data from IPFS');
    throw error;
  }
};

export const pinToIPFS = async (hash: string): Promise<void> => {
  try {
    await ipfs.pin.add(hash);
  } catch (error) {
    console.error('Error pinning to IPFS:', error);
    toast.error('Failed to pin to IPFS');
    throw error;
  }
};

export const unpinFromIPFS = async (hash: string): Promise<void> => {
  try {
    await ipfs.pin.rm(hash);
  } catch (error) {
    console.error('Error unpinning from IPFS:', error);
    toast.error('Failed to unpin from IPFS');
    throw error;
  }
}; 