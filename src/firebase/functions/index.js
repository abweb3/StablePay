const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const ethers = require('ethers');

admin.initializeApp();

// Biconomy API endpoint for submitting user operations with v3 (AA-SDK v2)
const BICONOMY_RELAY_API = 'https://api.biconomy.io/api/v2/public/user-operation';

// Your Biconomy API key - Replace with your actual key
const BICONOMY_API_KEY = process.env.BICONOMY_API_KEY || 'YOUR_BICONOMY_API_KEY';

/**
 * Cloud function to relay a transaction via Biconomy
 * This provides a backend layer of security and validation
 */
exports.relayTransaction = functions.https.onCall(async (data, context) => {
  // Make sure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to use this function'
    );
  }
  
  try {
    const { userOp, chainId } = data;
    
    // Verify user operation has required fields
    if (!userOp || !chainId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters: userOp and chainId'
      );
    }
    
    console.log(`Received user operation request for chain ${chainId} from user ${context.auth.uid}`);
    
    // Store the transaction intent in Firestore for audit/tracking
    const txRef = await admin.firestore().collection('transactions').add({
      userOp: JSON.parse(JSON.stringify(userOp)), // Clean circular references
      chainId,
      userId: context.auth.uid,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`Stored transaction record with ID: ${txRef.id}`);
    
    // Send the user operation to Biconomy Relay API
    const response = await axios.post(
      BICONOMY_RELAY_API,
      {
        userOp: userOp,
        chainId: chainId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': BICONOMY_API_KEY,
        },
      }
    );
    
    // Check response and extract userOpHash
    if (response.data && response.data.userOpHash) {
      const userOpHash = response.data.userOpHash;
      console.log(`User operation successful: ${userOpHash}`);
      
      // Update the transaction record with the hash
      await txRef.update({
        status: 'submitted',
        userOpHash: userOpHash,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return {
        success: true,
        userOpHash: userOpHash,
      };
    } else {
      console.error('Invalid response from Biconomy relay:', response.data);
      throw new Error('No userOpHash returned from relay service');
    }
  } catch (error) {
    console.error('Error relaying transaction:', error);
    
    // Log error in Firestore for monitoring
    await admin.firestore().collection('errors').add({
      error: JSON.parse(JSON.stringify(error)), // Clean circular references
      userId: context.auth?.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    throw new functions.https.HttpsError(
      'internal',
      `Failed to relay transaction: ${error.message}`
    );
  }
});

/**
 * Helper function to resolve username to address
 */
exports.resolveUsername = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to use this function'
    );
  }
  
  try {
    const { username } = data;
    
    if (!username) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Username parameter is required'
      );
    }
    
    // If input is already an address, return it
    if (ethers.utils.isAddress(username)) {
      return { address: username };
    }
    
    // Look up username in Firestore
    const userDoc = await admin.firestore().collection('users').doc(username).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        `Username '${username}' not found`
      );
    }
    
    return {
      address: userDoc.data().address,
    };
  } catch (error) {
    console.error('Error resolving username:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to resolve username: ${error.message}`
    );
  }
}); 