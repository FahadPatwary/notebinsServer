#!/bin/bash

# Exit on error
set -e

# Print commands
set -x

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Create logs directory
echo "Creating logs directory..."
mkdir -p logs

# Set permissions
echo "Setting permissions..."
chmod -R 755 .

echo "Deployment script completed successfully!" 