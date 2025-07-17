import { ethers } from 'ethers';
import { uploadToIPFS, uploadMetadataToIPFS } from './ipfs';
import { ListingMetadata, ListingNode, ListingTransaction } from '../types/listing';

// Define the interface for contract interactions
interface ContractDependencies {
  contract: ethers.Contract;
  signer: ethers.Signer;
  account: string;
}

export const createListing = async (
  metadata: Omit<ListingMetadata, 'blockchainData'>,
  images: File[],
  listingNode: ListingNode,
  dependencies: ContractDependencies
): Promise<string> => {
  try {
    const { contract, signer, account } = dependencies;
    
    if (!account) {
      throw new Error('Wallet not connected');
    }

    // Upload images to IPFS
    const imageUrls: string[] = [];
    for (const image of images) {
      const hash = await uploadToIPFS(image);
      imageUrls.push(`https://ipfs.io/ipfs/${hash}`);
    }

    // Create complete metadata with images
    const completeMetadata: ListingMetadata = {
      ...metadata,
      images: imageUrls,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Upload metadata to IPFS
    const metadataHash = await uploadMetadataToIPFS(completeMetadata);

    // Create listing on blockchain
    const tx = await contract.connect(signer)['createListing'](
      metadataHash,
      ethers.utils.parseEther(metadata.price.toString()),
      metadata.quantity || 1
    );

    const receipt = await tx.wait();
    
    // Extract token ID from logs
    const event = receipt.events?.find((e: any) => e.event === 'ListingCreated');
    const tokenId = event?.args?.tokenId?.toString();

    if (!tokenId) {
      throw new Error('Failed to get token ID from transaction');
    }

    return tokenId;
  } catch (error) {
    throw new Error(`Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const updateListing = async (
  tokenId: string,
  metadata: Partial<ListingMetadata>,
  newImages: File[] = [],
  dependencies: ContractDependencies
): Promise<void> => {
  try {
    const { contract, signer } = dependencies;

    // Get current listing
    const currentListing = await getListing(tokenId, dependencies);
    
    // Upload new images if provided
    let imageUrls = currentListing.images;
    if (newImages.length > 0) {
      const newImageUrls: string[] = [];
      for (const image of newImages) {
        const hash = await uploadToIPFS(image);
        newImageUrls.push(`https://ipfs.io/ipfs/${hash}`);
      }
      imageUrls = [...currentListing.images, ...newImageUrls];
    }

    // Create updated metadata
    const updatedMetadata: ListingMetadata = {
      ...currentListing,
      ...metadata,
      images: imageUrls,
      updatedAt: new Date().toISOString(),
    };

    // Upload updated metadata to IPFS
    const metadataHash = await uploadMetadataToIPFS(updatedMetadata);

    // Update listing on blockchain
    const tx = await contract.connect(signer)['updateListing'](tokenId, metadataHash);
    await tx.wait();
  } catch (error) {
    throw new Error(`Failed to update listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getListing = async (
  tokenId: string, 
  dependencies: ContractDependencies
): Promise<ListingMetadata> => {
  try {
    const { contract } = dependencies;
    
    const listing = await contract['getListing'](tokenId);
    
    // Fetch metadata from IPFS
    const response = await fetch(`https://ipfs.io/ipfs/${listing.metadataHash}`);
    const metadata = await response.json();
    
    return {
      ...metadata,
      blockchain: {
        tokenId,
        contractAddress: contract.address,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const createListingTransaction = async (
  listingId: string,
  buyer: string,
  quantity: number,
  dependencies: ContractDependencies
): Promise<ListingTransaction> => {
  try {
    const { contract, signer } = dependencies;

    // Get listing details
    const listing = await contract['getListing'](listingId);
    
    // Calculate total price
    const totalPrice = listing.price.mul(quantity);
    
    // Create transaction
    const tx = await contract.connect(signer)['purchaseListing'](
      listingId,
      quantity,
      { value: totalPrice }
    );
    
    const receipt = await tx.wait();
    
    const transaction: ListingTransaction = {
      listingId,
      seller: listing.seller,
      buyer,
      price: totalPrice,
      currency: 'ETH', // This should be dynamic based on the token
      quantity,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return transaction;
  } catch (error) {
    throw new Error(`Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 