import 'dotenv/config';

export default {
  name: "StablePay",
  slug: "stablepay",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    }
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    BICONOMY_BUNDLER_API_KEY: process.env.BICONOMY_BUNDLER_API_KEY,
    BICONOMY_PAYMASTER_API_KEY: process.env.BICONOMY_PAYMASTER_API_KEY,
    POLYGON_RPC_URL: process.env.POLYGON_RPC_URL,
  }
}; 