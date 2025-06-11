import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { uploadToIPFS, uploadMetadataToIPFS, getFromIPFS } from './ipfs';
import { ListingMetadata, ListingNode } from '../types/listing';
import { LISTING_NFT_ADDRESS } from '../constants/addresses';
import { LISTING_NFT_ABI } from '../constants/abis';

export const createListing = async (
  metadata: ListingMetadata,
  images: File[],
  listingNode: ListingNode,
  signer: ethers.Signer
): Promise<string> => {
  try {
    // Upload images to IPFS
    const imageHashes = await Promise.all(
      images.map(async (image) => {
        const hash = await uploadToIPFS(image);
        return hash;
      })
    );

    // Update metadata with image hashes
    const updatedMetadata = {
      ...metadata,
      images: imageHashes
    };

    // Upload metadata to IPFS
    const metadataHash = await uploadMetadataToIPFS(updatedMetadata);

    // Create contract instance
    const contract = new ethers.Contract(
      LISTING_NFT_ADDRESS,
      LISTING_NFT_ABI,
      signer
    );

    // Mint NFT with metadata
    const tx = await contract.mint(metadataHash);
    const receipt = await tx.wait();

    // Get token ID from event
    const event = receipt.events?.find(
      (e: any) => e.event === 'Transfer'
    );
    const tokenId = event?.args?.tokenId.toString();

    if (!tokenId) {
      throw new Error('Failed to get token ID from transaction');
    }

    return tokenId;
  } catch (error) {
    console.error('Error creating listing:', error);
    toast.error('Failed to create listing');
    throw error;
  }
};

export const updateListing = async (
  tokenId: string,
  metadata: Partial<ListingMetadata>,
  newImages?: File[],
  signer: ethers.Signer
): Promise<void> => {
  try {
    const contract = new ethers.Contract(
      LISTING_NFT_ADDRESS,
      LISTING_NFT_ABI,
      signer
    );

    // Get current metadata
    const tokenURI = await contract.tokenURI(tokenId);
    const currentMetadata = await getFromIPFS(tokenURI);

    // Upload new images if provided
    let imageHashes = currentMetadata.images;
    if (newImages && newImages.length > 0) {
      const newImageHashes = await Promise.all(
        newImages.map(async (image) => {
          const hash = await uploadToIPFS(image);
          return hash;
        })
      );
      imageHashes = [...imageHashes, ...newImageHashes];
    }

    // Update metadata
    const updatedMetadata = {
      ...currentMetadata,
      ...metadata,
      images: imageHashes
    };

    // Upload new metadata to IPFS
    const metadataHash = await uploadMetadataToIPFS(updatedMetadata);

    // Update token URI
    const tx = await contract.setTokenURI(tokenId, metadataHash);
    await tx.wait();
  } catch (error) {
    console.error('Error updating listing:', error);
    toast.error('Failed to update listing');
    throw error;
  }
};

export const getListing = async (
  tokenId: string,
  signer: ethers.Signer
): Promise<ListingMetadata> => {
  try {
    const contract = new ethers.Contract(
      LISTING_NFT_ADDRESS,
      LISTING_NFT_ABI,
      signer
    );

    const tokenURI = await contract.tokenURI(tokenId);
    const metadata = await getFromIPFS(tokenURI);

    return metadata;
  } catch (error) {
    console.error('Error getting listing:', error);
    toast.error('Failed to get listing details');
    throw error;
  }
};

export const createListingTransaction = async (
  listingId: string,
  buyer: string,
  quantity: number,
  signer: ethers.Signer
): Promise<string> => {
  try {
    const contract = new ethers.Contract(
      LISTING_NFT_ADDRESS,
      LISTING_NFT_ABI,
      signer
    );

    const tx = await contract.createTransaction(listingId, buyer, quantity);
    const receipt = await tx.wait();

    const event = receipt.events?.find(
      (e: any) => e.event === 'TransactionCreated'
    );
    const transactionId = event?.args?.transactionId.toString();

    if (!transactionId) {
      throw new Error('Failed to get transaction ID');
    }

    return transactionId;
  } catch (error) {
    console.error('Error creating transaction:', error);
    toast.error('Failed to create transaction');
    throw error;
  }
}; 