import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Avatar, Surface, useTheme, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data for recent contacts
const RECENT_CONTACTS = [
  { name: 'Alice', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', avatar: 'A' },
  { name: 'Bob', address: '0x6ecBe1DB9EF729CBe972C83Fb886247691Fb6beb', avatar: 'B' },
  { name: 'Charlie', address: '0xE5e25Ee34E3834BCC71A8CD705C037091599d6D4', avatar: 'C' },
];

// Quick amount options
const QUICK_AMOUNTS = ['5', '10', '25', '50', '100'];

const SendScreen = ({ navigation }) => {
  const theme = useTheme();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState(null);
  const [currentStep, setCurrentStep] = useState('recipient'); // recipient, amount, confirm, success
  const [error, setError] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);

  const resolveRecipient = async () => {
    if (!recipient.trim()) {
      setError('Please enter a recipient username or address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock resolution - in a real app, we would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // If it's one of our test contacts, use their address
      const contact = RECENT_CONTACTS.find(c => 
        c.name.toLowerCase() === recipient.toLowerCase()
      );
      
      if (contact) {
        setResolvedAddress(contact.address);
        setCurrentStep('amount');
      } else if (recipient.startsWith('0x') && recipient.length === 42) {
        // If it looks like an Ethereum address
        setResolvedAddress(recipient);
        setCurrentStep('amount');
      } else {
        // Generate a deterministic address for testing
        const mockAddress = '0x' + Array(40).fill(0).map((_, i) => 
          parseInt(recipient.charCodeAt(i % recipient.length) % 16, 10).toString(16)
        ).join('');
        setResolvedAddress(mockAddress);
        setCurrentStep('amount');
      }
    } catch (err) {
      setError(err.message || 'Failed to resolve recipient');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSubmit = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError(null);
    setCurrentStep('confirm');
  };

  const handleSendPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock transaction - in a real app, we would call a blockchain API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock transaction hash
      const mockTxHash = '0x' + Array(64).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      setTransactionHash(mockTxHash);
      setCurrentStep('success');
    } catch (err) {
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const selectContact = (contact) => {
    setRecipient(contact.name);
    setResolvedAddress(contact.address);
    setCurrentStep('amount');
  };

  const selectAmount = (amt) => {
    setAmount(amt);
  };

  const resetForm = () => {
    setRecipient('');
    setAmount('');
    setResolvedAddress(null);
    setTransactionHash(null);
    setError(null);
    setCurrentStep('recipient');
  };

  // Render the recipient input step
  const renderRecipientStep = () => (
    <View>
      <Text style={styles.stepTitle}>Who are you sending to?</Text>
      
      <TextInput
        label="Enter username or address"
        value={recipient}
        onChangeText={setRecipient}
        style={styles.input}
        mode="outlined"
        autoCapitalize="none"
        disabled={loading}
        right={
          <TextInput.Icon 
            icon="account-search" 
            onPress={resolveRecipient}
            disabled={loading || !recipient.trim()}
          />
        }
      />
      
      <Text style={styles.sectionTitle}>Recent Contacts</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.contactsContainer}
      >
        {RECENT_CONTACTS.map((contact, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => selectContact(contact)} 
            style={styles.contactItem}
          >
            <Avatar.Text 
              size={50} 
              label={contact.avatar} 
              style={[styles.contactAvatar, { backgroundColor: theme.colors.primary }]} 
            />
            <Text style={styles.contactName}>{contact.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Button
        mode="contained"
        onPress={resolveRecipient}
        style={styles.actionButton}
        loading={loading}
        disabled={loading || !recipient.trim()}
      >
        Continue
      </Button>
    </View>
  );

  // Render the amount input step
  const renderAmountStep = () => (
    <View>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentStep('recipient')}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#555" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      
      <Text style={styles.stepTitle}>How much would you like to send?</Text>
      
      <Surface style={styles.recipientCard}>
        <Avatar.Text 
          size={40} 
          label={recipient.charAt(0).toUpperCase()} 
          style={[styles.recipientAvatar, { backgroundColor: theme.colors.primary }]} 
        />
        <View style={styles.recipientDetails}>
          <Text style={styles.recipientName}>{recipient}</Text>
          <Text style={styles.recipientAddress}>
            {resolvedAddress.substring(0, 6)}...{resolvedAddress.substring(resolvedAddress.length - 4)}
          </Text>
        </View>
      </Surface>
      
      <View style={styles.amountContainer}>
        <Text style={styles.currencySymbol}>$</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          style={styles.amountInput}
          keyboardType="numeric"
          mode="flat"
          placeholder="0.00"
          disabled={loading}
          right={<TextInput.Affix text="USDC" />}
        />
      </View>
      
      <Text style={styles.sectionTitle}>Quick Amounts</Text>
      <View style={styles.quickAmountsContainer}>
        {QUICK_AMOUNTS.map((amt, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.quickAmountButton,
              amount === amt && styles.selectedQuickAmount
            ]}
            onPress={() => selectAmount(amt)}
          >
            <Text 
              style={[
                styles.quickAmountText,
                amount === amt && styles.selectedQuickAmountText
              ]}
            >
              ${amt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Button
        mode="contained"
        onPress={handleAmountSubmit}
        style={styles.actionButton}
        loading={loading}
        disabled={loading || !amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
      >
        Review Payment
      </Button>
    </View>
  );

  // Render the confirmation step
  const renderConfirmStep = () => (
    <View>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentStep('amount')}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#555" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      
      <Text style={styles.stepTitle}>Confirm Transaction</Text>
      
      <Surface style={styles.confirmationCard}>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Sending to:</Text>
          <View style={styles.confirmationValueContainer}>
            <Text style={styles.confirmationName}>{recipient}</Text>
            <Text style={styles.confirmationAddress}>
              {resolvedAddress.substring(0, 6)}...{resolvedAddress.substring(resolvedAddress.length - 4)}
            </Text>
          </View>
        </View>
        
        <Divider style={styles.confirmationDivider} />
        
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Amount:</Text>
          <Text style={styles.confirmationAmount}>${amount} USDC</Text>
        </View>
        
        <Divider style={styles.confirmationDivider} />
        
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Network Fee:</Text>
          <Text style={styles.confirmationFee}>$0.00 (Gasless)</Text>
        </View>
        
        <Divider style={styles.confirmationDivider} />
        
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Total:</Text>
          <Text style={styles.confirmationTotal}>${amount} USDC</Text>
        </View>
      </Surface>
      
      <Button
        mode="contained"
        onPress={handleSendPayment}
        style={styles.actionButton}
        loading={loading}
        disabled={loading}
      >
        Send Now
      </Button>
    </View>
  );

  // Render the success step
  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <MaterialCommunityIcons 
        name="check-circle" 
        size={80} 
        color={theme.colors.primary} 
        style={styles.successIcon} 
      />
      <Text style={styles.successTitle}>Payment Sent!</Text>
      <Text style={styles.successMessage}>
        You've successfully sent ${amount} USDC to {recipient}.
      </Text>
      
      <Surface style={styles.transactionDetailsCard}>
        <Text style={styles.transactionDetailsTitle}>Transaction Details</Text>
        <Divider style={styles.confirmationDivider} />
        
        <View style={styles.transactionDetailsRow}>
          <Text style={styles.transactionDetailsLabel}>Transaction Hash:</Text>
          <Text style={styles.transactionDetailsValue}>
            {transactionHash.substring(0, 8)}...{transactionHash.substring(transactionHash.length - 8)}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.viewExplorerButton}>
          <Text style={styles.viewExplorerText}>View on Polygon Explorer</Text>
          <MaterialCommunityIcons name="open-in-new" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </Surface>
      
      <Button
        mode="contained"
        onPress={resetForm}
        style={[styles.actionButton, styles.doneButton]}
      >
        Send Another Payment
      </Button>
    </View>
  );

  // Render the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'recipient':
        return renderRecipientStep();
      case 'amount':
        return renderAmountStep();
      case 'confirm':
        return renderConfirmStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderRecipientStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.mainCard}>
          {renderCurrentStep()}
          
          {error && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#D32F2F" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </Surface>
        
        {currentStep === 'recipient' && (
          <Surface style={styles.infoCard}>
            <MaterialCommunityIcons 
              name="information" 
              size={24} 
              color={theme.colors.primary} 
              style={styles.infoIcon} 
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Send USDC to Anyone</Text>
              <Text style={styles.infoDescription}>
                You can send USDC to any username or Ethereum address. No gas fees!
              </Text>
            </View>
          </Surface>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  mainCard: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    elevation: 4,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  contactsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  contactItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  contactAvatar: {
    marginBottom: 8,
  },
  contactName: {
    fontSize: 14,
  },
  actionButton: {
    borderRadius: 30,
    paddingVertical: 8,
    marginTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  recipientAvatar: {
    marginRight: 16,
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  recipientAddress: {
    fontSize: 14,
    color: '#757575',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    backgroundColor: 'transparent',
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAmountButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minWidth: '18%',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedQuickAmount: {
    backgroundColor: '#2196F3',
  },
  quickAmountText: {
    fontWeight: '600',
  },
  selectedQuickAmountText: {
    color: 'white',
  },
  confirmationCard: {
    borderRadius: 12,
    marginBottom: 24,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  confirmationLabel: {
    fontSize: 16,
    color: '#757575',
  },
  confirmationValueContainer: {
    alignItems: 'flex-end',
  },
  confirmationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmationAddress: {
    fontSize: 14,
    color: '#757575',
  },
  confirmationAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  confirmationFee: {
    fontSize: 16,
    color: '#4CAF50',
  },
  confirmationTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmationDivider: {
    height: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#D32F2F',
    marginLeft: 8,
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
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
  },
  successContainer: {
    alignItems: 'center',
    padding: 16,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  transactionDetailsCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  transactionDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transactionDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: 12,
  },
  transactionDetailsLabel: {
    fontSize: 14,
    color: '#757575',
  },
  transactionDetailsValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewExplorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  viewExplorerText: {
    marginRight: 8,
    color: '#2196F3',
  },
  doneButton: {
    marginTop: 8,
  }
});

export default SendScreen; 