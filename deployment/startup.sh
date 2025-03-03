#!/bin/bash

# Log startup
echo "Starting NoteBins backend..."
echo "Current directory: $(pwd)"
echo "Directory contents: $(ls -la)"

# Set environment variables
export PORT=8080
export NODE_ENV=production

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  if [ -f "package-lock.json" ]; then
    echo "Using package-lock.json for installation"
    npm ci --production
  else
    echo "No package-lock.json found, using npm install"
    npm install --production
  fi
fi

# Check if node_modules was successfully created
if [ ! -d "node_modules" ]; then
  echo "WARNING: node_modules directory not created. This may cause issues."
fi

# Start the application
echo "Starting server on port $PORT..."

# Try to use server.js first, fall back to index.js if it doesn't exist
if [ -f "server.js" ]; then
  echo "Using server.js as entry point"
  node server.js
elif [ -f "index.js" ]; then
  echo "Using index.js as entry point"
  node index.js
else
  echo "ERROR: No entry point found. Neither server.js nor index.js exists."
  echo "Directory contents: $(ls -la)"
  exit 1
fi 