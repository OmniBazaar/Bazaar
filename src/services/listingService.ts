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
    // Validate inputs
    if (!metadata.title || !metadata.description) {
      throw new Error('Title and description are required');
    }

    if (images.length === 0) {
      throw new Error('At least one image is required');
    }

    // Create listing NFT contract instance
    const contract = new ethers.Contract(
      listingNode.address,
      LISTING_NFT_ABI,
      signer
    );

    // Upload listing data to IPFS via listing service
    const result = await listingService.uploadToIPFS(metadata, images);
    
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to upload to IPFS');
    }

    // Create listing NFT on blockchain
    const tx: ethers.ContractTransaction = await contract.createListing(
      result.metadataHash,
      metadata.price,
      metadata.quantity
    );

    const receipt = await tx.wait();
    const event = receipt.events?.find(
      (e: ethers.Event) => e.event === 'ListingCreated'
    );

    if (!event?.args) {
      throw new Error('Failed to get listing token ID from transaction');
    }

    const tokenId = event.args.tokenId.toString();
    return tokenId;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create listing';
    throw new Error(errorMessage);
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
    toast.error('Failed to create transaction');
    throw error;
  }
};

// Upload listing data to IPFS via listing service
const result = await listingService.uploadToIPFS(listing, images);

if (!result.success) {
  throw new Error(result.error ?? 'Failed to upload to IPFS');
} 