import * as SecureStore from 'expo-secure-store';
import { ethers } from 'ethers';

// Keys for secure storage
const PRIVATE_KEY_STORAGE_KEY = 'stablePay_private_key';
const USERNAME_STORAGE_KEY = 'stablePay_username';

// In-memory username to address map for testing
const usernameMap = {
  'alice': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  'bob': '0x6ecBe1DB9EF729CBe972C83Fb886247691Fb6beb',
  'user': '0xE5e25Ee34E3834BCC71A8CD705C037091599d6D4',
};

/**
 * Create a test wallet for development purposes
 */
export const createTestWallet = async () => {
  try {
    // A hardcoded private key for testing - NEVER use in production!
    const testPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const testWallet = new ethers.Wallet(testPrivateKey);
    
    // Save the private key securely
    await SecureStore.setItemAsync(PRIVATE_KEY_STORAGE_KEY, testPrivateKey);
    
    return {
      address: testWallet.address,
      privateKey: testPrivateKey,
    };
  } catch (error) {
    console.error('Error creating test wallet:', error);
    throw error;
  }
};

/**
 * Mock function to always return a test address for any given username
 * @param {string} username - Username to look up
 * @returns {Promise<string>} - Mock wallet address
 */
export const mockResolveUsername = async (username) => {
  // If it's an address, return it directly
  if (ethers.isAddress(username)) {
    return username;
  }
  
  // Check our mock map
  if (usernameMap[username]) {
    return usernameMap[username];
  }
  
  // Return a deterministic address based on the username for testing
  const hash = ethers.keccak256(ethers.toUtf8Bytes(username));
  const address = '0x' + hash.slice(-40);
  
  return ethers.getAddress(address); // Format as checksum address
}; 