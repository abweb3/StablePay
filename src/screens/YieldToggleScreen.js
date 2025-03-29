import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Card, Title, Switch, Text, Button, ActivityIndicator, Divider, Surface, ProgressBar, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { depositToAave, withdrawFromAave } from '../services/yield/depositToAave';
import { getPrivateKey } from '../services/auth/AuthService';
import { createSmartAccount } from '../services/blockchain/SmartAccountService';
import { ethers } from 'ethers';
import { mockResolveUsername, createTestWallet } from '../services/auth/MockAuthService';

// USDC contract address on Polygon
const USDC_CONTRACT_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';

// ERC20 ABI for balance queries
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

// DEBUG mode for testing without backend dependencies
const DEBUG_MODE = true;

// Historical yield rates (for chart visualization)
const YIELD_HISTORY = [
  { date: 'Jan', rate: 1.8 },
  { date: 'Feb', rate: 1.9 },
  { date: 'Mar', rate: 2.0 },
  { date: 'Apr', rate: 2.1 },
  { date: 'May', rate: 2.2 },
  { date: 'Jun', rate: 2.1 },
];

const YieldToggleScreen = () => {
  const [yieldEnabled, setYieldEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [stablecoinBalance, setStablecoinBalance] = useState('0');
  const [aaveBalance, setAaveBalance] = useState('0');
  const [currentYield, setCurrentYield] = useState('2.1'); // Would come from Aave API in production
  const [testModeEnabled, setTestModeEnabled] = useState(DEBUG_MODE);
  const [hasWallet, setHasWallet] = useState(false);
  const [accountAddress, setAccountAddress] = useState(null);
  const [totalEarned, setTotalEarned] = useState('0.58'); // Mock data
  const [showingSuccessMessage, setShowingSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [depositPercent, setDepositPercent] = useState(100); // Default to 100%

  useEffect(() => {
    // Create a test wallet for development if in debug mode
    if (testModeEnabled) {
      const setupTestWallet = async () => {
        try {
          await createTestWallet();
          setHasWallet(true);
          loadUserData();
        } catch (err) {
          console.error("Error setting up test wallet:", err);
        }
      };
      
      setupTestWallet();
    } else {
      loadUserData();
    }
  }, [testModeEnabled]);

  const loadUserData = async () => {
    try {
      setInitializing(true);
      
      // Get private key
      const privateKey = await getPrivateKey();
      if (!privateKey) {
        setInitializing(false);
        return;
      }
      
      // Create smart account
      const smartAccount = await createSmartAccount(privateKey);
      const address = await smartAccount.getAccountAddress();
      setAccountAddress(address);
      
      // Check if yield is enabled by checking aToken balance
      await checkBalances(address);
      
      setInitializing(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setInitializing(false);
    }
  };

  const checkBalances = async (address) => {
    try {
      if (testModeEnabled) {
        // Simulate balances for test mode
        setStablecoinBalance('125.50');
        const aaveBalanceValue = yieldEnabled ? '75.00' : '0';
        setAaveBalance(aaveBalanceValue);
        setYieldEnabled(Number(aaveBalanceValue) > 0);
        return;
      }
      
      const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
      
      // USDC Contract
      const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, provider);
      const decimals = await usdcContract.decimals();
      
      // Get USDC balance
      const balance = await usdcContract.balanceOf(address);
      setStablecoinBalance(ethers.formatUnits(balance, decimals));
      
      // Get Aave USDC balance
      // In a production app, you'd use the Aave DataProvider to get the aToken address
      // For simplicity, we'll simulate this with a fixed balance if yield is enabled
      
      // Query aTokens directly from Aave Data Provider in production
      const aaveBalanceValue = yieldEnabled ? '75.00' : '0';
      setAaveBalance(aaveBalanceValue);
      
      // If we have Aave balance, set yield enabled
      setYieldEnabled(Number(aaveBalanceValue) > 0);
    } catch (error) {
      console.error('Error checking balances:', error);
    }
  };

  const handleDepositPercentChange = (percent) => {
    setDepositPercent(percent);
  };

  const calculateDepositAmount = () => {
    const balance = parseFloat(stablecoinBalance);
    return ((balance * depositPercent) / 100).toFixed(2);
  };

  const handleToggleYield = async (value) => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      if (value) {
        // Enable yield - Deposit available USDC to Aave
        if (Number(stablecoinBalance) <= 0) {
          Alert.alert('Error', 'You need USDC to enable yield generation');
          setLoading(false);
          return;
        }
        
        const amountToDeposit = calculateDepositAmount();
        
        if (testModeEnabled) {
          // Simulate transaction
          await new Promise(resolve => setTimeout(resolve, 1500));
          const newAaveBalance = parseFloat(aaveBalance) + parseFloat(amountToDeposit);
          const newWalletBalance = parseFloat(stablecoinBalance) - parseFloat(amountToDeposit);
          
          setAaveBalance(newAaveBalance.toFixed(2));
          setStablecoinBalance(newWalletBalance.toFixed(2));
          
          setSuccessMessage(`Successfully deposited $${amountToDeposit} USDC to Aave yield pool.`);
          setShowingSuccessMessage(true);
          setTimeout(() => setShowingSuccessMessage(false), 4000);
        } else {
          // Deposit to Aave
          const result = await depositToAave(amountToDeposit);
          setAaveBalance(result.aTokenBalance);
          setStablecoinBalance((parseFloat(stablecoinBalance) - parseFloat(amountToDeposit)).toFixed(2));
          
          setSuccessMessage(`Successfully deposited $${amountToDeposit} USDC to Aave yield pool.`);
          setShowingSuccessMessage(true);
          setTimeout(() => setShowingSuccessMessage(false), 4000);
        }
      } else {
        // Disable yield - Withdraw all from Aave
        if (Number(aaveBalance) <= 0) {
          Alert.alert('Error', 'No funds in Aave to withdraw');
          setLoading(false);
          return;
        }
        
        if (testModeEnabled) {
          // Simulate transaction
          await new Promise(resolve => setTimeout(resolve, 1500));
          const newWalletBalance = parseFloat(stablecoinBalance) + parseFloat(aaveBalance);
          
          setStablecoinBalance(newWalletBalance.toFixed(2));
          setAaveBalance('0');
          
          setSuccessMessage(`Successfully withdrawn $${aaveBalance} USDC from Aave yield pool.`);
          setShowingSuccessMessage(true);
          setTimeout(() => setShowingSuccessMessage(false), 4000);
        } else {
          // Withdraw from Aave
          const result = await withdrawFromAave('MAX');
          setStablecoinBalance((parseFloat(stablecoinBalance) + parseFloat(aaveBalance)).toFixed(2));
          setAaveBalance('0');
          
          setSuccessMessage(`Successfully withdrawn $${aaveBalance} USDC from Aave yield pool.`);
          setShowingSuccessMessage(true);
          setTimeout(() => setShowingSuccessMessage(false), 4000);
        }
      }
      
      setYieldEnabled(value);
    } catch (error) {
      console.error('Error toggling yield:', error);
      Alert.alert('Error', error.message || 'Failed to toggle yield generation');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading your account...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {DEBUG_MODE && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>Test Mode</Text>
            <Switch
              value={testModeEnabled}
              onValueChange={setTestModeEnabled}
            />
          </View>
        )}
        
        {showingSuccessMessage && (
          <Surface style={styles.successNotification}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.successNotificationText}>{successMessage}</Text>
          </Surface>
        )}
        
        <Surface style={styles.balanceOverviewCard}>
          <Text style={styles.balanceOverviewTitle}>Balance Overview</Text>
          
          <View style={styles.totalBalanceContainer}>
            <Text style={styles.totalBalanceLabel}>Total Balance</Text>
            <Text style={styles.totalBalanceValue}>
              ${(parseFloat(stablecoinBalance) + parseFloat(aaveBalance)).toFixed(2)}
            </Text>
            <Text style={styles.totalBalanceCurrency}>USDC</Text>
          </View>
          
          <View style={styles.assetDistributionContainer}>
            <View style={styles.assetDistributionBar}>
              {parseFloat(stablecoinBalance) > 0 && (
                <View 
                  style={[
                    styles.walletDistribution, 
                    { 
                      flex: parseFloat(stablecoinBalance) / 
                        (parseFloat(stablecoinBalance) + parseFloat(aaveBalance)) 
                    }
                  ]}
                />
              )}
              {parseFloat(aaveBalance) > 0 && (
                <View 
                  style={[
                    styles.aaveDistribution, 
                    { 
                      flex: parseFloat(aaveBalance) / 
                        (parseFloat(stablecoinBalance) + parseFloat(aaveBalance)) 
                    }
                  ]}
                />
              )}
            </View>
            
            <View style={styles.assetDistributionLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.walletLegend]} />
                <Text style={styles.legendText}>Wallet: ${stablecoinBalance}</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.aaveLegend]} />
                <Text style={styles.legendText}>Aave: ${aaveBalance}</Text>
              </View>
            </View>
          </View>
        </Surface>
        
        <Surface style={styles.yieldCard}>
          <View style={styles.yieldHeaderContainer}>
            <View>
              <Text style={styles.yieldCardTitle}>Yield Generation</Text>
              <Text style={styles.yieldCardSubtitle}>Earn interest on your USDC</Text>
            </View>
            
            <View style={styles.yieldToggleContainer}>
              <Switch
                value={yieldEnabled}
                onValueChange={handleToggleYield}
                disabled={loading}
                color="#2196F3"
              />
              <Text style={styles.yieldToggleStatus}>
                {yieldEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {yieldEnabled ? (
            <View style={styles.yieldStatsContainer}>
              <View style={styles.yieldStat}>
                <Text style={styles.yieldStatLabel}>Current APY</Text>
                <Text style={styles.yieldStatValue}>{currentYield}%</Text>
              </View>
              
              <View style={styles.yieldStat}>
                <Text style={styles.yieldStatLabel}>Earning</Text>
                <Text style={styles.yieldStatValue}>${aaveBalance}</Text>
              </View>
              
              <View style={styles.yieldStat}>
                <Text style={styles.yieldStatLabel}>Total Earned</Text>
                <Text style={styles.yieldStatValue}>${totalEarned}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.depositContainer}>
              <Text style={styles.depositTitle}>Deposit to Start Earning</Text>
              <Text style={styles.depositDescription}>
                Current APY: <Text style={styles.depositHighlight}>{currentYield}%</Text>
              </Text>
              
              <View style={styles.depositAmountContainer}>
                <Text style={styles.depositAmountTitle}>How much would you like to deposit?</Text>
                <Text style={styles.depositAmount}>${calculateDepositAmount()}</Text>
                <Text style={styles.depositAmountOf}>of ${stablecoinBalance} available</Text>
                
                <View style={styles.percentageButtons}>
                  {[25, 50, 75, 100].map(percent => (
                    <TouchableOpacity 
                      key={percent}
                      style={[
                        styles.percentButton,
                        depositPercent === percent && styles.activePercentButton
                      ]}
                      onPress={() => handleDepositPercentChange(percent)}
                    >
                      <Text 
                        style={[
                          styles.percentButtonText,
                          depositPercent === percent && styles.activePercentButtonText
                        ]}
                      >
                        {percent}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <Button
                mode="contained"
                onPress={() => handleToggleYield(true)}
                disabled={loading || parseFloat(stablecoinBalance) <= 0}
                style={styles.depositButton}
                labelStyle={styles.depositButtonLabel}
                loading={loading}
              >
                Deposit and Enable Yield
              </Button>
            </View>
          )}
          
          {yieldEnabled && (
            <View style={styles.historicalRatesContainer}>
              <Text style={styles.historicalRatesTitle}>Historical Rates</Text>
              <View style={styles.ratesChart}>
                {YIELD_HISTORY.map((item, index) => (
                  <View key={index} style={styles.rateBar}>
                    <View 
                      style={[
                        styles.rateBarFill, 
                        { height: `${(item.rate / 3) * 100}%` }
                      ]} 
                    />
                    <Text style={styles.rateBarLabel}>{item.date}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.rateYAxis}>
                <Text style={styles.rateYAxisLabel}>3%</Text>
                <Text style={styles.rateYAxisLabel}>2%</Text>
                <Text style={styles.rateYAxisLabel}>1%</Text>
                <Text style={styles.rateYAxisLabel}>0%</Text>
              </View>
            </View>
          )}
          
          {yieldEnabled && (
            <Button 
              mode="outlined" 
              onPress={() => handleToggleYield(false)}
              style={styles.withdrawButton}
              labelStyle={styles.withdrawButtonLabel}
              disabled={loading || parseFloat(aaveBalance) <= 0}
              loading={loading}
            >
              Withdraw All Funds
            </Button>
          )}
        </Surface>
        
        <Surface style={styles.infoCard}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#2196F3" style={styles.infoIcon} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>How Yield Works</Text>
            <Text style={styles.infoDescription}>
              Your funds are deposited into Aave's USDC lending pool on Polygon. You earn interest continuously while your funds are deposited, and can withdraw at any time.
            </Text>
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  debugContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
  },
  debugText: {
    color: '#757575',
    fontWeight: 'bold',
  },
  successNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#E8F5E9',
  },
  successNotificationText: {
    marginLeft: 12,
    color: '#2E7D32',
    flex: 1,
  },
  balanceOverviewCard: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    elevation: 2,
  },
  balanceOverviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  totalBalanceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  totalBalanceLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  totalBalanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#212121',
  },
  totalBalanceCurrency: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  assetDistributionContainer: {
    marginTop: 16,
  },
  assetDistributionBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  walletDistribution: {
    backgroundColor: '#2196F3',
    height: '100%',
  },
  aaveDistribution: {
    backgroundColor: '#4CAF50',
    height: '100%',
  },
  assetDistributionLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  walletLegend: {
    backgroundColor: '#2196F3',
  },
  aaveLegend: {
    backgroundColor: '#4CAF50',
  },
  legendText: {
    fontSize: 14,
    color: '#757575',
  },
  yieldCard: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    elevation: 2,
  },
  yieldHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yieldCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  yieldCardSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  yieldToggleContainer: {
    alignItems: 'center',
  },
  yieldToggleStatus: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  yieldStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  yieldStat: {
    alignItems: 'center',
  },
  yieldStatLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  yieldStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  depositContainer: {
    marginVertical: 16,
  },
  depositTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  depositDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
  },
  depositHighlight: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  depositAmountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  depositAmountTitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  depositAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
  },
  depositAmountOf: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  percentageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  percentButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    minWidth: 60,
    alignItems: 'center',
  },
  activePercentButton: {
    backgroundColor: '#2196F3',
  },
  percentButtonText: {
    fontWeight: 'bold',
    color: '#757575',
  },
  activePercentButtonText: {
    color: 'white',
  },
  depositButton: {
    borderRadius: 30,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
  },
  depositButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 4,
  },
  withdrawButton: {
    borderRadius: 30,
    paddingVertical: 8,
    borderColor: '#F44336',
    marginTop: 16,
  },
  withdrawButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    paddingVertical: 4,
  },
  historicalRatesContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  historicalRatesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  ratesChart: {
    height: 150,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 30,
    marginBottom: 8,
  },
  rateBar: {
    width: 30,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  rateBarFill: {
    width: 20,
    backgroundColor: '#2196F3',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  rateBarLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 8,
  },
  rateYAxis: {
    position: 'absolute',
    left: 0,
    top: 32,
    bottom: 20,
    justifyContent: 'space-between',
  },
  rateYAxisLabel: {
    fontSize: 10,
    color: '#757575',
    textAlign: 'right',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
});

export default YieldToggleScreen; 