// Polyfills for browser compatibility

// Import buffer and process polyfills
import { Buffer } from 'buffer';
import process from 'process';

// Set global objects
window.Buffer = Buffer;
window.process = process;

// Import randomness generation for cryptography
import 'react-native-get-random-values';

// Any other polyfills needed can be added here 