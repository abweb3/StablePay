import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, Surface, Button, ActivityIndicator, Switch, Divider, useTheme, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Sample historical yield data
const YIELD_HISTORY = [
  { month: 'Jan', rate: 1.8 },
  { month: 'Feb', rate: 1.9 },
  { month: 'Mar', rate: 2.0 },
  { month: 'Apr', rate: 2.1 },
  { month: 'May', rate: 2.2 },
  { month: 'Jun', rate: 2.1 },
];

const YieldScreen = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState('0.00');
  const [yieldBalance, setYieldBalance] = useState('0.00');
  const [yieldEnabled, setYieldEnabled] = useState(false);
  const [currentYield, setCurrentYield] = useState('2.1');
  const [totalEarned, setTotalEarned] = useState('0.58');
  const [depositPercent, setDepositPercent] = useState(100);
  const [processingTransaction, setProcessingTransaction] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      // In a real app, we would fetch data from API
      setTimeout(() => {
        setWalletBalance('128.45');
        setYieldBalance('72.50');
        setYieldEnabled(parseFloat('72.50') > 0);
        setLoading(false);
      }, 1000);
    };

    loadData();
  }, []);

  const calculateDepositAmount = () => {
    const balance = parseFloat(walletBalance);
    return ((balance * depositPercent) / 100).toFixed(2);
  };

  const handleDepositPercentChange = (percent) => {
    setDepositPercent(percent);
  };

  const handleToggleYield = async (value) => {
    if (processingTransaction) return;
    
    setProcessingTransaction(true);
    
    try {
      // Display transaction in progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (value) {
        // Enable yield - Deposit funds
        const amountToDeposit = calculateDepositAmount();
        const newYieldBalance = parseFloat(yieldBalance) + parseFloat(amountToDeposit);
        const newWalletBalance = parseFloat(walletBalance) - parseFloat(amountToDeposit);
        
        setYieldBalance(newYieldBalance.toFixed(2));
        setWalletBalance(newWalletBalance.toFixed(2));
        
        setSuccessMessage(`Successfully deposited $${amountToDeposit} USDC to yield pool.`);
      } else {
        // Disable yield - Withdraw all funds
        const newWalletBalance = parseFloat(walletBalance) + parseFloat(yieldBalance);
        
        setWalletBalance(newWalletBalance.toFixed(2));
        setYieldBalance('0.00');
        
        setSuccessMessage(`Successfully withdrawn $${yieldBalance} USDC from yield pool.`);
      }
      
      setYieldEnabled(value);
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (error) {
      console.error('Error toggling yield:', error);
    } finally {
      setProcessingTransaction(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your account...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {successMessage ? (
          <Surface style={styles.successNotification}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.successNotificationText}>{successMessage}</Text>
          </Surface>
        ) : null}
        
        <Surface style={styles.balanceOverviewCard}>
          <Text style={styles.balanceOverviewTitle}>Balance Overview</Text>
          
          <View style={styles.totalBalanceContainer}>
            <Text style={styles.totalBalanceLabel}>Total Balance</Text>
            <Text style={styles.totalBalanceValue}>
              ${(parseFloat(walletBalance) + parseFloat(yieldBalance)).toFixed(2)}
            </Text>
            <Text style={styles.totalBalanceCurrency}>USDC</Text>
          </View>
          
          <View style={styles.assetDistributionContainer}>
            <View style={styles.assetDistributionBar}>
              {parseFloat(walletBalance) > 0 && (
                <View 
                  style={[
                    styles.walletDistribution, 
                    { 
                      flex: parseFloat(walletBalance) / 
                        (parseFloat(walletBalance) + parseFloat(yieldBalance)) 
                    }
                  ]}
                />
              )}
              {parseFloat(yieldBalance) > 0 && (
                <View 
                  style={[
                    styles.yieldDistribution, 
                    { 
                      flex: parseFloat(yieldBalance) / 
                        (parseFloat(walletBalance) + parseFloat(yieldBalance)) 
                    }
                  ]}
                />
              )}
            </View>
            
            <View style={styles.assetDistributionLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.walletLegend]} />
                <Text style={styles.legendText}>Wallet: ${walletBalance}</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.yieldLegend]} />
                <Text style={styles.legendText}>Earning: ${yieldBalance}</Text>
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
                disabled={processingTransaction}
                color={theme.colors.primary}
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
                <Text style={styles.yieldStatValue}>${yieldBalance}</Text>
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
                <Text style={styles.depositAmountOf}>of ${walletBalance} available</Text>
                
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
                disabled={processingTransaction || parseFloat(walletBalance) <= 0}
                style={styles.depositButton}
                loading={processingTransaction}
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
                    <Text style={styles.rateBarLabel}>{item.month}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.rateYAxis}>
                <Text style={styles.rateYAxisLabel}>3.0%</Text>
                <Text style={styles.rateYAxisLabel}>2.0%</Text>
                <Text style={styles.rateYAxisLabel}>1.0%</Text>
                <Text style={styles.rateYAxisLabel}>0.0%</Text>
              </View>
            </View>
          )}
          
          {yieldEnabled && (
            <Button 
              mode="outlined" 
              onPress={() => handleToggleYield(false)}
              style={styles.withdrawButton}
              disabled={processingTransaction || parseFloat(yieldBalance) <= 0}
              loading={processingTransaction}
            >
              Withdraw All Funds
            </Button>
          )}
        </Surface>
        
        <Surface style={styles.infoCard}>
          <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.primary} style={styles.infoIcon} />
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  successNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  successNotificationText: {
    marginLeft: 12,
    color: '#2E7D32',
    flex: 1,
  },
  balanceOverviewCard: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    elevation: 4,
  },
  balanceOverviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  yieldDistribution: {
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
  yieldLegend: {
    backgroundColor: '#4CAF50',
  },
  legendText: {
    fontSize: 14,
    color: '#757575',
  },
  yieldCard: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    elevation: 4,
  },
  yieldHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yieldCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  depositContainer: {
    marginVertical: 16,
  },
  depositTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  withdrawButton: {
    borderRadius: 30,
    paddingVertical: 8,
    borderColor: '#F44336',
    marginTop: 16,
  },
  historicalRatesContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  historicalRatesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
    margin: 16,
    borderRadius: 12,
    elevation: 1,
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
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
});

export default YieldScreen; 