#!/bin/bash

# Create .npmrc file
echo "Creating .npmrc file to skip problematic scripts..."
cat > .npmrc << EOL
husky-skip-install=true
legacy-peer-deps=true
ignore-scripts=true
EOL

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.example .env
fi

# Make sure assets directory exists
mkdir -p assets

# Clean install
echo "Removing node_modules if they exist..."
rm -rf node_modules

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Installation complete! You can now run the app with 'npm start'" 