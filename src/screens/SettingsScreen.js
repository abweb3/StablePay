import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text, Surface, List, Switch, Divider, Avatar, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [testMode, setTestMode] = useState(true);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Surface style={styles.headerCard}>
          <View style={styles.profileSection}>
            <Avatar.Text 
              size={70} 
              label="U" 
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]} 
            />
            <View style={styles.profileInfo}>
              <Text style={styles.username}>username</Text>
              <Text style={styles.address}>0x71C7...976F</Text>
              <Button 
                mode="outlined" 
                compact 
                style={styles.editButton}
                onPress={() => {}}
              >
                Edit Profile
              </Button>
            </View>
          </View>
        </Surface>
        
        <Surface style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <List.Item
            title="Change Username"
            left={props => <List.Icon {...props} icon="account-edit" color={theme.colors.primary} />}
            right={props => <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />}
            onPress={() => {}}
          />
          
          <Divider />
          
          <List.Item
            title="Wallet Address"
            description="View and copy your wallet address"
            left={props => <List.Icon {...props} icon="wallet" color={theme.colors.primary} />}
            right={props => <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />}
            onPress={() => {}}
          />
          
          <Divider />
          
          <List.Item
            title="Export Private Key"
            description="Securely backup your wallet"
            left={props => <List.Icon {...props} icon="key" color={theme.colors.primary} />}
            right={props => <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />}
            onPress={() => {}}
          />
        </Surface>
        
        <Surface style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <List.Item
            title="Notifications"
            description="Receive alerts for transactions"
            left={props => <List.Icon {...props} icon="bell" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Biometric Authentication"
            description="Use Face ID or Touch ID to authorize transactions"
            left={props => <List.Icon {...props} icon="fingerprint" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={biometrics}
                onValueChange={setBiometrics}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Test Mode"
            description="Enable for testing without blockchain transactions"
            left={props => <List.Icon {...props} icon="flask" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={testMode}
                onValueChange={setTestMode}
                color={theme.colors.primary}
              />
            )}
          />
        </Surface>
        
        <Surface style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <List.Item
            title="Help Center"
            left={props => <List.Icon {...props} icon="help-circle" color={theme.colors.primary} />}
            right={props => <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />}
            onPress={() => {}}
          />
          
          <Divider />
          
          <List.Item
            title="Contact Support"
            left={props => <List.Icon {...props} icon="email" color={theme.colors.primary} />}
            right={props => <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />}
            onPress={() => {}}
          />
          
          <Divider />
          
          <List.Item
            title="About StablePay"
            description="Version 1.0.0"
            left={props => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
            right={props => <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />}
            onPress={() => {}}
          />
        </Surface>
        
        <Button 
          mode="outlined" 
          style={styles.logoutButton}
          labelStyle={styles.logoutButtonLabel}
          icon="logout"
          onPress={() => {}}
        >
          Sign Out
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerCard: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    elevation: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  editButton: {
    borderRadius: 20,
    borderColor: '#757575',
    alignSelf: 'flex-start',
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 30,
    borderColor: '#F44336',
  },
  logoutButtonLabel: {
    color: '#F44336',
  },
});

export default SettingsScreen; 