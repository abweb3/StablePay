import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text, Surface, Button, ActivityIndicator, Avatar, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState('0.00');
  const [yieldBalance, setYieldBalance] = useState('0.00');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      // In a real app, we would fetch data from API or local storage
      setTimeout(() => {
        setBalance('128.45');
        setYieldBalance('72.50');
        setUsername('user1');
        setLoading(false);
      }, 1000);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your account...</Text>
      </View>
    );
  }

  const totalBalance = parseFloat(balance) + parseFloat(yieldBalance);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Surface style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.welcomeText}>Welcome, {username}</Text>
            <Avatar.Text 
              size={40} 
              label={username?.charAt(0).toUpperCase() || 'U'} 
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]} 
            />
          </View>

          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>${totalBalance.toFixed(2)}</Text>
          <Text style={styles.balanceCurrency}>USDC</Text>

          <View style={styles.balanceDistribution}>
            <View style={{flex: parseFloat(balance) / totalBalance}}>
              <Surface style={[styles.distributionBar, { backgroundColor: theme.colors.primary }]} />
            </View>
            <View style={{flex: parseFloat(yieldBalance) / totalBalance}}>
              <Surface style={[styles.distributionBar, { backgroundColor: theme.colors.secondary }]} />
            </View>
          </View>
          
          <View style={styles.distributionLabels}>
            <View style={styles.distributionLabel}>
              <View style={[styles.distributionDot, { backgroundColor: theme.colors.primary }]} />
              <Text>Wallet: ${balance}</Text>
            </View>
            <View style={styles.distributionLabel}>
              <View style={[styles.distributionDot, { backgroundColor: theme.colors.secondary }]} />
              <Text>Earning Yield: ${yieldBalance}</Text>
            </View>
          </View>
        </Surface>

        <View style={styles.actionsContainer}>
          <Surface style={styles.actionButton}>
            <Button 
              icon="send" 
              mode="contained" 
              onPress={() => navigation.navigate('Send')}
              style={styles.button}
            >
              Send
            </Button>
          </Surface>
          
          <Surface style={styles.actionButton}>
            <Button 
              icon="chart-line" 
              mode="contained" 
              onPress={() => navigation.navigate('Yield')}
              style={styles.button}
            >
              Yield
            </Button>
          </Surface>
        </View>

        <Surface style={styles.recentActivityCard}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          
          <View style={styles.activityItem}>
            <MaterialCommunityIcons name="arrow-top-right" size={24} color="#F44336" />
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>Sent to Alice</Text>
              <Text style={styles.activityDate}>Today, 2:34 PM</Text>
            </View>
            <Text style={[styles.activityAmount, {color: '#F44336'}]}>-$25.00</Text>
          </View>
          
          <View style={styles.activityItem}>
            <MaterialCommunityIcons name="cash-plus" size={24} color="#4CAF50" />
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>Yield Earned</Text>
              <Text style={styles.activityDate}>Yesterday</Text>
            </View>
            <Text style={[styles.activityAmount, {color: '#4CAF50'}]}>+$0.12</Text>
          </View>
          
          <View style={styles.activityItem}>
            <MaterialCommunityIcons name="arrow-bottom-left" size={24} color="#4CAF50" />
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>Received from Bob</Text>
              <Text style={styles.activityDate}>May 10, 2023</Text>
            </View>
            <Text style={[styles.activityAmount, {color: '#4CAF50'}]}>+$50.00</Text>
          </View>
          
          <Button 
            mode="text" 
            onPress={() => {}} 
            style={styles.viewAllButton}
          >
            View All Transactions
          </Button>
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
  balanceCard: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    marginLeft: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  balanceValue: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  balanceCurrency: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 16,
  },
  balanceDistribution: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  distributionBar: {
    height: '100%',
  },
  distributionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  distributionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  button: {
    paddingVertical: 8,
    borderRadius: 12,
  },
  recentActivityCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  activityDetails: {
    flex: 1,
    marginLeft: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 14,
    color: '#757575',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
});

export default HomeScreen; 