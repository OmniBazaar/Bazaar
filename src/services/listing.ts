import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { uploadToIPFS, uploadMetadataToIPFS, getFromIPFS, pinToIPFS } from './ipfs';
import { ListingMetadata, ListingNode, ListingTransaction } from '../types/listing';
import { useWallet } from '@omniwallet/react';
import { useContract } from '../hooks/useContract';
import { LISTING_NFT_ABI } from '../constants/abis';
import { LISTING_NFT_ADDRESS } from '../constants/addresses';

export const createListing = async (
  metadata: Omit<ListingMetadata, 'blockchainData'>,
  images: File[],
  listingNode: ListingNode
): Promise<string> => {
  try {
    // Upload images to IPFS
    const imageHashes = await Promise.all(images.map(uploadToIPFS));
    const mainImage = imageHashes[0];
    const additionalImages = imageHashes.slice(1);

    // Create metadata with image hashes
    const listingMetadata: ListingMetadata = {
      ...metadata,
      image: mainImage,
      images: additionalImages,
      blockchainData: {
        tokenId: '', // Will be set after minting
        contractAddress: LISTING_NFT_ADDRESS,
        listingNode: listingNode.address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    // Upload metadata to IPFS
    const metadataHash = await uploadMetadataToIPFS(listingMetadata);
    await pinToIPFS(metadataHash);

    // Mint NFT with metadata hash
    const contract = useContract(LISTING_NFT_ADDRESS, LISTING_NFT_ABI);
    const wallet = useWallet();

    if (!contract || !wallet.account) {
      throw new Error('Contract or wallet not initialized');
    }

    const tx = await contract.mint(wallet.account, metadataHash);
    const receipt = await tx.wait();

    // Get token ID from event
    const event = receipt.events?.find(e => e.event === 'Transfer');
    const tokenId = event?.args?.tokenId.toString();

    if (!tokenId) {
      throw new Error('Failed to get token ID from mint transaction');
    }

    // Update metadata with token ID
    listingMetadata.blockchainData.tokenId = tokenId;
    const updatedMetadataHash = await uploadMetadataToIPFS(listingMetadata);
    await pinToIPFS(updatedMetadataHash);

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
  newImages?: File[]
): Promise<void> => {
  try {
    // Get current metadata
    const contract = useContract(LISTING_NFT_ADDRESS, LISTING_NFT_ABI);
    const currentMetadataHash = await contract.tokenURI(tokenId);
    const currentMetadata = await getFromIPFS(currentMetadataHash);

    // Upload new images if provided
    let imageHashes = currentMetadata.images;
    if (newImages && newImages.length > 0) {
      const newImageHashes = await Promise.all(newImages.map(uploadToIPFS));
      imageHashes = [...newImageHashes, ...currentMetadata.images];
    }

    // Update metadata
    const updatedMetadata: ListingMetadata = {
      ...currentMetadata,
      ...metadata,
      images: imageHashes,
      blockchainData: {
        ...currentMetadata.blockchainData,
        updatedAt: new Date().toISOString(),
      },
    };

    // Upload updated metadata
    const newMetadataHash = await uploadMetadataToIPFS(updatedMetadata);
    await pinToIPFS(newMetadataHash);

    // Update token URI
    const tx = await contract.setTokenURI(tokenId, newMetadataHash);
    await tx.wait();
  } catch (error) {
    console.error('Error updating listing:', error);
    toast.error('Failed to update listing');
    throw error;
  }
};

export const getListing = async (tokenId: string): Promise<ListingMetadata> => {
  try {
    const contract = useContract(LISTING_NFT_ADDRESS, LISTING_NFT_ABI);
    const metadataHash = await contract.tokenURI(tokenId);
    return await getFromIPFS(metadataHash);
  } catch (error) {
    console.error('Error getting listing:', error);
    toast.error('Failed to get listing details');
    throw error;
  }
};

export const createListingTransaction = async (
  listingId: string,
  buyer: string,
  quantity: number
): Promise<ListingTransaction> => {
  try {
    const contract = useContract(LISTING_NFT_ADDRESS, LISTING_NFT_ABI);
    const listing = await getListing(listingId);

    const tx = await contract.createTransaction(
      listingId,
      buyer,
      quantity,
      listing.price.amount
    );
    const receipt = await tx.wait();

    const event = receipt.events?.find(e => e.event === 'TransactionCreated');
    if (!event) {
      throw new Error('Failed to get transaction details');
    }

    return {
      listingId,
      seller: listing.seller.address,
      buyer,
      price: ethers.BigNumber.from(listing.price.amount),
      currency: listing.price.currency,
      quantity,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    toast.error('Failed to create transaction');
    throw error;
  }
}; 