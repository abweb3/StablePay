import { ethers } from 'ethers';
import { createSmartAccount, sendGaslessTransaction } from './SmartAccountService';
import { getPrivateKey } from '../auth/AuthService';
import { functions } from '../../firebase/config';

// USDC contract address on Polygon
const USDC_CONTRACT_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';

// USDC contract interface
const USDC_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

/**
 * Send USDC stablecoin to a recipient using Biconomy's Account Abstraction
 * @param {string} recipient - Recipient address
 * @param {string} amount - Amount to send as a string (e.g. "10.5")
 * @returns {Promise<string>} - Transaction hash
 */
export const sendStablecoin = async (recipient, amount) => {
  try {
    // Validate inputs
    if (!ethers.isAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }
    
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      throw new Error('Invalid amount');
    }
    
    // Get the user's private key from secure storage
    const privateKey = await getPrivateKey();
    if (!privateKey) {
      throw new Error('No private key found. Please create an account first.');
    }

    // Create a smart account instance
    const smartAccount = await createSmartAccount(privateKey);
    const smartAccountAddress = await smartAccount.getAccountAddress();
    console.log(`Using smart account: ${smartAccountAddress}`);
    
    // Create a provider and USDC contract instance
    const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
    const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, provider);
    
    // Get the decimals of the USDC token (should be 6 for USDC)
    const decimals = await usdcContract.decimals();
    console.log(`USDC decimals: ${decimals}`);
    
    // Convert the amount to the correct decimal places
    const amountInWei = ethers.parseUnits(amount, decimals);
    console.log(`Sending ${amount} USDC (${amountInWei.toString()} base units)`);
    
    // Check balance before sending
    const balance = await usdcContract.balanceOf(smartAccountAddress);
    console.log(`Smart account balance: ${ethers.formatUnits(balance, decimals)} USDC`);
    
    if (balance < amountInWei) {
      throw new Error(`Insufficient balance. You have ${ethers.formatUnits(balance, decimals)} USDC, but tried to send ${amount} USDC.`);
    }
    
    // Prepare the transfer transaction
    const data = usdcContract.interface.encodeFunctionData('transfer', [recipient, amountInWei]);
    
    // Construct the transaction object
    const transaction = {
      to: USDC_CONTRACT_ADDRESS,
      data: data,
      value: 0n, // No ETH value for ERC20 transfers
    };
    
    // Build the user operation using Biconomy SDK
    const userOpResponse = await smartAccount.buildUserOp([transaction]);
    
    // Modify user op to use paymaster (for gasless transaction)
    const userOp = await smartAccount.prepareUserOpWithPaymaster(userOpResponse, {
      mode: "SPONSORED",
    });

    // Sign the user operation
    const signedUserOp = await smartAccount.signUserOp(userOp);
    
    // Send the signed user operation to our backend relay function
    const relayFunction = functions.httpsCallable('relayTransaction');
    const result = await relayFunction({
      userOp: signedUserOp,
      chainId: 137, // Polygon mainnet
    });
    
    if (result.data && result.data.userOpHash) {
      console.log(`Transaction submitted, user operation hash: ${result.data.userOpHash}`);
      return result.data.userOpHash;
    } else {
      throw new Error('No transaction hash returned');
    }
  } catch (error) {
    console.error('Error in sendStablecoin:', error);
    throw new Error(`Failed to send USDC: ${error.message}`);
  }
}; 