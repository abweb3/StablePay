# StablePay

A mobile app for sending and receiving stablecoins (USDC and USDT) with an experience similar to Venmo. Built with React Native, Expo, and blockchain technologies.

## Features

- 💸 **Easy Stablecoin Transfers**: Send and receive USDC and USDT in just a few taps
- 🚫 **No Gas Fees**: Account abstraction hides blockchain complexity from users
- 📈 **Automatic Yield Generation**: Earn interest on idle stablecoins via Aave
- 🔐 **Secure by Design**: Smart contract wallets with advanced security features
- 🌉 **Multi-Chain Support**: Works on Ethereum and Polygon networks

## Technical Stack

- **Frontend**: React Native with Expo
- **UI Framework**: React Native Paper
- **Blockchain Interaction**: ethers.js v6
- **Account Abstraction**: Biconomy SDK v3.1.1
- **Yield Generation**: Aave V3 protocol
- **Backend Services**: Firebase (Auth, Firestore, Functions)
- **Secure Storage**: Expo SecureStore

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- Yarn or npm
- Expo CLI (`npm install -g expo-cli`)
- Firebase account
- Biconomy API keys

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/stablepay.git
cd stablepay
```

2. Copy the example environment file and add your API keys:
```
cp .env.example .env
```

3. Install dependencies:
```
npm install --legacy-peer-deps
```

4. Update the Firebase configuration in `src/firebase/config.js` with your Firebase project details.

5. Start the development server:
```
npm start
```

### Troubleshooting Installation

If you encounter errors during installation related to Husky or the Biconomy packages:

1. Make sure you have the `.npmrc` file in your project with:
```
husky-skip-install=true
legacy-peer-deps=true
ignore-scripts=true
```

2. Try removing `node_modules` and reinstalling:
```
rm -rf node_modules
npm install --legacy-peer-deps
```

3. If you still encounter issues, you may need to install specific versions of the Biconomy packages:
```
npm install @biconomy/account@3.1.1 @biconomy/bundler@3.1.1 @biconomy/common@3.1.1 @biconomy/core-types@3.1.1 @biconomy/paymaster@3.1.1 --legacy-peer-deps
```

## Usage

1. Create a new wallet or import an existing one
2. Send stablecoins to users via address or username
3. Toggle yield generation to earn interest on idle funds
4. View transaction history and account balances

## Architecture

The app uses a smart contract wallet powered by Biconomy's Account Abstraction SDK to abstract away blockchain complexities:

- **Smart Account**: Created for each user and linked to their authentication
- **Meta-transactions**: Allow gasless transactions sponsored by the app
- **Yield Generation**: Automatically deposits idle funds into Aave V3 protocol

## Security Considerations

- User private keys are stored securely using Expo SecureStore with biometric authentication
- Smart contract wallets include security features like spending limits and recovery options
- All smart contracts used are audited (Biconomy, Aave)

## License

MIT 