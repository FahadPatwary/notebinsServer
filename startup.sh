#!/bin/bash

# Log startup
echo "Starting NoteBins backend..."

# Set environment variables
export PORT=8080
export NODE_ENV=production

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --production
fi

# Start the application
echo "Starting server on port $PORT..."

# Try to use server.js first, fall back to index.js if it doesn't exist
if [ -f "server.js" ]; then
  echo "Using server.js as entry point"
  node server.js
else
  echo "Using index.js as entry point"
  node index.js
fi 