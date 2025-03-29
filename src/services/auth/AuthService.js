import * as SecureStore from 'expo-secure-store';
import { ethers } from 'ethers';
import { auth, firestore, functions } from '../../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Keys for secure storage
const PRIVATE_KEY_STORAGE_KEY = 'stablePay_private_key';
const USERNAME_STORAGE_KEY = 'stablePay_username';

/**
 * Generate a new wallet and store the private key securely
 * @returns {Promise<{address: string, privateKey: string}>} - New wallet details
 */
export const createWallet = async () => {
  try {
    // Check if a wallet already exists
    const existingKey = await getPrivateKey();
    if (existingKey) {
      throw new Error('A wallet already exists for this user');
    }
    
    // Generate a random wallet
    const wallet = ethers.Wallet.createRandom();
    
    // Save the private key securely
    await SecureStore.setItemAsync(PRIVATE_KEY_STORAGE_KEY, wallet.privateKey);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw error;
  }
};

/**
 * Retrieve the private key from secure storage
 * @returns {Promise<string|null>} - Private key or null if not found
 */
export const getPrivateKey = async () => {
  try {
    return await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Error getting private key:', error);
    return null;
  }
};

/**
 * Store a username linked to the wallet address
 * @param {string} username - Username to store
 * @param {string} address - Wallet address
 * @returns {Promise<void>}
 */
export const setUsername = async (username, address) => {
  try {
    // Store locally
    await SecureStore.setItemAsync(USERNAME_STORAGE_KEY, username);
    
    // Store in Firebase database for username lookup
    const userRef = doc(firestore, 'users', username);
    await setDoc(userRef, {
      address: address,
      createdAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error('Error setting username:', error);
    throw error;
  }
};

/**
 * Get address by username from Firebase
 * @param {string} username - Username to look up
 * @returns {Promise<string|null>} - Wallet address or null if not found
 */
export const getAddressByUsername = async (username) => {
  try {
    const userRef = doc(firestore, 'users', username);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().address;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting address by username:', error);
    return null;
  }
};

/**
 * Check if input is a username or address and return the address
 * @param {string} input - Username or address
 * @returns {Promise<string>} - Resolved address
 */
export const resolveAddressOrUsername = async (input) => {
  // Check if input is an Ethereum address
  if (ethers.isAddress(input)) {
    return input;
  }
  
  // Otherwise, try to resolve as username (first try local resolver)
  const address = await getAddressByUsername(input);
  if (address) {
    return address;
  }
  
  // If not found locally, try with the server resolver
  try {
    const resolveFunction = functions.httpsCallable('resolveUsername');
    const result = await resolveFunction({ username: input });
    
    if (result.data && result.data.address) {
      return result.data.address;
    }
  } catch (error) {
    console.error('Error resolving username via function:', error);
  }
  
  throw new Error(`Username '${input}' not found`);
}; 