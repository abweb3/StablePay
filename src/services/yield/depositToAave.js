import { ethers } from 'ethers';
import { createSmartAccount, sendGaslessTransaction } from '../blockchain/SmartAccountService';
import { getPrivateKey } from '../auth/AuthService';

// Aave V3 Pool address on Polygon
const AAVE_POOL_ADDRESS = '0x794a61358D6845594F94dc1DB02A252b5b4814aD';

// USDC contract address on Polygon
const USDC_CONTRACT_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';

// ABI fragments for needed functions
const POOL_ABI = [
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external',
  'function withdraw(address asset, uint256 amount, address to) external returns (uint256)',
  'function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

// Data provider to get aToken address
const DATA_PROVIDER_ADDRESS = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';
const DATA_PROVIDER_ABI = [
  'function getReserveTokensAddresses(address asset) external view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)',
];

/**
 * Deposit USDC to Aave V3 for yield generation
 * @param {string} amount - Amount to deposit as a string (e.g. "10.5")
 * @returns {Promise<{txHash: string, aTokenBalance: string}>} - Transaction hash and aToken balance
 */
export const depositToAave = async (amount) => {
  try {
    // Get the user's private key from secure storage
    const privateKey = await getPrivateKey();
    if (!privateKey) {
      throw new Error('No private key found. Please create an account first.');
    }
    
    // Create a smart account instance
    const smartAccount = await createSmartAccount(privateKey);
    const smartAccountAddress = await smartAccount.getAccountAddress();
    
    // Create provider and contract instances
    const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
    const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, provider);
    const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS, POOL_ABI, provider);
    const dataProvider = new ethers.Contract(DATA_PROVIDER_ADDRESS, DATA_PROVIDER_ABI, provider);
    
    // Get the decimals of the USDC token
    const decimals = await usdcContract.decimals();
    
    // Convert the amount to the correct decimal places
    const amountInWei = ethers.parseUnits(amount, decimals);
    
    // First, approve the Aave Pool to spend USDC tokens
    const approveData = usdcContract.interface.encodeFunctionData('approve', [AAVE_POOL_ADDRESS, amountInWei]);
    const approveTransaction = {
      to: USDC_CONTRACT_ADDRESS,
      data: approveData,
      value: 0n,
    };
    
    // Send the approval transaction
    const approveTxHash = await sendGaslessTransaction(smartAccount, approveTransaction);
    console.log(`Approval transaction hash: ${approveTxHash}`);
    
    // Wait for approval to be mined (in production, add proper confirmation handling)
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Now deposit to Aave Pool
    // referralCode is 0 for no referral
    const supplyData = aavePool.interface.encodeFunctionData('supply', [
      USDC_CONTRACT_ADDRESS,
      amountInWei,
      smartAccountAddress,
      0
    ]);
    
    const supplyTransaction = {
      to: AAVE_POOL_ADDRESS,
      data: supplyData,
      value: 0n,
    };
    
    // Send the supply transaction
    const supplyTxHash = await sendGaslessTransaction(smartAccount, supplyTransaction);
    console.log(`Supply transaction hash: ${supplyTxHash}`);
    
    // Get aToken address to check balance
    const { aTokenAddress } = await dataProvider.getReserveTokensAddresses(USDC_CONTRACT_ADDRESS);
    
    // Create aToken contract instance
    const aTokenContract = new ethers.Contract(aTokenAddress, ERC20_ABI, provider);
    
    // Wait for supply transaction to be mined (in production, add proper confirmation handling)
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Get the aToken balance
    const aTokenBalance = await aTokenContract.balanceOf(smartAccountAddress);
    const aTokenBalanceFormatted = ethers.formatUnits(aTokenBalance, decimals);
    
    return {
      txHash: supplyTxHash,
      aTokenBalance: aTokenBalanceFormatted,
    };
  } catch (error) {
    console.error('Error in depositToAave:', error);
    throw new Error(`Failed to deposit to Aave: ${error.message}`);
  }
};

/**
 * Withdraw USDC from Aave V3
 * @param {string} amount - Amount to withdraw as a string (e.g. "10.5"), or "MAX" for all
 * @returns {Promise<{txHash: string, withdrawnAmount: string}>} - Transaction hash and withdrawn amount
 */
export const withdrawFromAave = async (amount) => {
  try {
    // Get the user's private key from secure storage
    const privateKey = await getPrivateKey();
    if (!privateKey) {
      throw new Error('No private key found. Please create an account first.');
    }
    
    // Create a smart account instance
    const smartAccount = await createSmartAccount(privateKey);
    const smartAccountAddress = await smartAccount.getAccountAddress();
    
    // Create provider and contract instances
    const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
    const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, provider);
    const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS, POOL_ABI, provider);
    const dataProvider = new ethers.Contract(DATA_PROVIDER_ADDRESS, DATA_PROVIDER_ABI, provider);
    
    // Get the decimals of the USDC token
    const decimals = await usdcContract.decimals();
    
    // Get aToken address to check balance
    const { aTokenAddress } = await dataProvider.getReserveTokensAddresses(USDC_CONTRACT_ADDRESS);
    
    // Create aToken contract instance
    const aTokenContract = new ethers.Contract(aTokenAddress, ERC20_ABI, provider);
    
    // Get the aToken balance
    const aTokenBalance = await aTokenContract.balanceOf(smartAccountAddress);
    
    // Determine amount to withdraw
    let amountInWei;
    if (amount.toUpperCase() === 'MAX') {
      amountInWei = aTokenBalance;
    } else {
      amountInWei = ethers.parseUnits(amount, decimals);
      if (amountInWei > aTokenBalance) {
        throw new Error(`Not enough balance. You have ${ethers.formatUnits(aTokenBalance, decimals)} USDC in Aave.`);
      }
    }
    
    // Withdraw from Aave Pool
    const withdrawData = aavePool.interface.encodeFunctionData('withdraw', [
      USDC_CONTRACT_ADDRESS,
      amountInWei,
      smartAccountAddress
    ]);
    
    const withdrawTransaction = {
      to: AAVE_POOL_ADDRESS,
      data: withdrawData,
      value: 0n,
    };
    
    // Send the withdraw transaction
    const withdrawTxHash = await sendGaslessTransaction(smartAccount, withdrawTransaction);
    console.log(`Withdraw transaction hash: ${withdrawTxHash}`);
    
    return {
      txHash: withdrawTxHash,
      withdrawnAmount: ethers.formatUnits(amountInWei, decimals),
    };
  } catch (error) {
    console.error('Error in withdrawFromAave:', error);
    throw new Error(`Failed to withdraw from Aave: ${error.message}`);
  }
}; 