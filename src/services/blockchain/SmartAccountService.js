import { ethers } from 'ethers';
import { createSmartAccountClient } from "@biconomy/account";
import { ECDSAOwnershipValidationModule } from "@biconomy/modules";
import { Bundler } from '@biconomy/bundler';
import { ChainId } from '@biconomy/core-types';
import { BiconomyPaymaster } from '@biconomy/paymaster';
import Constants from 'expo-constants';

// Get environment variables
const getEnv = (key) => {
  // In a production app, use a proper env setup like react-native-dotenv
  // For now, we'll use hardcoded values as fallbacks
  try {
    return Constants?.manifest?.extra?.[key] || process.env[key];
  } catch (e) {
    return null;
  }
};

// Constants for Polygon
const CHAIN_ID = ChainId.POLYGON_MAINNET;
const RPC_URL = getEnv('POLYGON_RPC_URL') || 'https://polygon-rpc.com';
const BUNDLER_URL = 'https://bundler.biconomy.io/api/v2/' + CHAIN_ID;
const PAYMASTER_URL = 'https://paymaster.biconomy.io/api/v1/' + CHAIN_ID;

// API keys - fallback to placeholders if not provided
const BICONOMY_BUNDLER_API_KEY = getEnv('BICONOMY_BUNDLER_API_KEY') || 'YOUR_BICONOMY_BUNDLER_API_KEY';
const BICONOMY_PAYMASTER_API_KEY = getEnv('BICONOMY_PAYMASTER_API_KEY') || 'YOUR_BICONOMY_PAYMASTER_API_KEY';

// Create provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Initialize bundler
const bundler = new Bundler({
  bundlerUrl: BUNDLER_URL,
  chainId: CHAIN_ID,
  bundlerApiKey: BICONOMY_BUNDLER_API_KEY,
});

// Initialize paymaster
const paymaster = new BiconomyPaymaster({
  paymasterUrl: PAYMASTER_URL,
  chainId: CHAIN_ID,
  paymasterApiKey: BICONOMY_PAYMASTER_API_KEY,
});

// Cache for smart accounts to avoid recreating them
const smartAccountCache = new Map();

/**
 * Creates and returns a Biconomy Smart Account instance
 * @param {string} privateKey - EOA private key
 * @returns {Promise<Object>} - Smart Account instance
 */
export const createSmartAccount = async (privateKey) => {
  try {
    // Check if we already have a cached smart account for this private key
    const cacheKey = ethers.keccak256(ethers.toUtf8Bytes(privateKey));
    if (smartAccountCache.has(cacheKey)) {
      console.log("Returning cached smart account instance");
      return smartAccountCache.get(cacheKey);
    }
    
    // Create a wallet from private key
    const eoaWallet = new ethers.Wallet(privateKey, provider);
    console.log("EOA Address:", eoaWallet.address);
    
    // Create ECDSA validation module
    const ecdsaModule = await ECDSAOwnershipValidationModule.create({
      signer: eoaWallet,
      moduleAddress: "0x00000001D075dCc0A7AE647097775F7Ed16179b2" // Default ECDSA Module address
    });
    
    // Create smart account instance
    const smartAccount = await createSmartAccountClient({
      chainId: CHAIN_ID,
      bundler,
      paymaster,
      entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // Default EntryPoint address for ERC-4337
      defaultValidationModule: ecdsaModule
    });
    
    // Cache the smart account instance
    smartAccountCache.set(cacheKey, smartAccount);
    
    const smartAccountAddress = await smartAccount.getAccountAddress();
    console.log("Smart Account Address:", smartAccountAddress);
    return smartAccount;
  } catch (error) {
    console.error("Error creating smart account:", error);
    throw error;
  }
};

/**
 * Get the smart account address for a given EOA
 * @param {string} privateKey - EOA private key
 * @returns {Promise<string>} - Smart account address
 */
export const getSmartAccountAddress = async (privateKey) => {
  const smartAccount = await createSmartAccount(privateKey);
  return await smartAccount.getAccountAddress();
};

/**
 * Create a gasless transaction with Biconomy Paymaster
 * @param {Object} smartAccount - Smart account instance
 * @param {object} transaction - Transaction object (to, data, value)
 * @returns {Promise<string>} - Transaction hash
 */
export const sendGaslessTransaction = async (smartAccount, transaction) => {
  try {
    // Build user operation
    const userOpResponse = await smartAccount.buildUserOp([transaction]);
    
    // Modify user op to use paymaster for gasless transaction
    const userOp = await smartAccount.prepareUserOpWithPaymaster(userOpResponse, {
      mode: "SPONSORED",
    });
    
    // Sign the user operation
    const signedUserOp = await smartAccount.signUserOp(userOp);
    
    // Send the user operation
    const userOpResponse2 = await smartAccount.sendSignedUserOp(signedUserOp);
    console.log("User operation hash:", userOpResponse2.userOpHash);
    
    // Wait for transaction confirmation
    const transactionDetails = await userOpResponse2.waitForTxHash();
    console.log("Transaction hash:", transactionDetails);
    
    return transactionDetails;
  } catch (error) {
    console.error("Error sending gasless transaction:", error);
    throw error;
  }
}; 