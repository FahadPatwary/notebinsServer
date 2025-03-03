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
node index.js 