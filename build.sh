#!/bin/bash

# Log build information
echo "Building NoteBins backend application..."
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Check if we're in the Render environment
if [ -d "/opt/render" ]; then
  echo "Detected Render environment"
  echo "Render project structure:"
  find /opt/render/project -type d -maxdepth 3 | sort
fi

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

# Copy server.js to dist directory
echo "Copying server.js to dist directory..."
cp server.js dist/ || echo "Warning: Failed to copy server.js"

# Create logs directory
echo "Creating logs directory..."
mkdir -p logs
mkdir -p dist/logs

# Make start script executable
echo "Making start script executable..."
chmod +x start.sh

# Copy start.sh to dist directory
echo "Copying start.sh to dist directory..."
cp start.sh dist/ || echo "Warning: Failed to copy start.sh"
chmod +x dist/start.sh || echo "Warning: Failed to make dist/start.sh executable"

echo "Build process completed successfully!" 