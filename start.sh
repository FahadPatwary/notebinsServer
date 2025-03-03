#!/bin/bash

# Log startup
echo "Starting NoteBins backend..."
echo "Current directory: $(pwd)"
echo "Directory contents: $(ls -la)"

# Log environment variables
echo "Environment variables:"
echo "PORT=$PORT"
echo "NODE_ENV=$NODE_ENV"
echo "CORS_ORIGIN=$CORS_ORIGIN"

# Start the application
echo "Starting server on port $PORT..."
node dist/index.js 