#!/bin/bash

# Log build information
echo "Building NoteBins backend application..."
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Verify build output
if [ -d "dist" ]; then
  echo "Build successful! dist directory created."
  echo "Contents of dist directory:"
  ls -la dist
else
  echo "ERROR: Build failed! dist directory not found."
  exit 1
fi

# Copy package.json and package-lock.json to dist directory
echo "Copying package files to dist directory..."
cp package.json dist/ || echo "Warning: Failed to copy package.json"
cp package-lock.json dist/ || echo "Warning: Failed to copy package-lock.json"

# Create logs directory
echo "Creating logs directory..."
mkdir -p logs

# Make start script executable
echo "Making start script executable..."
chmod +x start.sh

echo "Build process completed successfully!" 