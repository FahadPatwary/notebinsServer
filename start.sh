#!/bin/bash

# Log startup information
echo "Starting NoteBins backend application..."
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Log environment variables
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# Check if we're in the Render environment
if [ -d "/opt/render" ]; then
  echo "Detected Render environment"
  
  # Try to find the backend directory
  if [ -d "/opt/render/project/src/backend" ]; then
    echo "Found backend directory, changing to it"
    cd /opt/render/project/src/backend
    echo "New current directory: $(pwd)"
    echo "Directory contents:"
    ls -la
  fi
fi

# Check for the existence of server.js first
if [ -f "server.js" ]; then
  echo "Found server.js in current directory, using it as entry point"
  node server.js
elif [ -f "../server.js" ]; then
  echo "Found server.js in parent directory"
  node ../server.js
# Fall back to checking for index.js in various locations
elif [ -f "dist/index.js" ]; then
  echo "Found dist/index.js in current directory"
  node dist/index.js
elif [ -f "../dist/index.js" ]; then
  echo "Found dist/index.js in parent directory"
  node ../dist/index.js
elif [ -f "/opt/render/project/src/backend/dist/index.js" ]; then
  echo "Found index.js in /opt/render/project/src/backend/dist/"
  node /opt/render/project/src/backend/dist/index.js
elif [ -f "/opt/render/project/src/dist/index.js" ]; then
  echo "Found index.js in /opt/render/project/src/dist/"
  node /opt/render/project/src/dist/index.js
else
  echo "ERROR: Could not find server.js or dist/index.js in any expected location"
  echo "Checking all possible locations:"
  
  echo "Current directory contents:"
  ls -la
  
  echo "Current directory dist folder contents:"
  ls -la dist 2>/dev/null || echo "dist directory not found in current directory"
  
  echo "Parent directory dist folder contents:"
  ls -la ../dist 2>/dev/null || echo "dist directory not found in parent directory"
  
  echo "Render project backend dist folder contents:"
  ls -la /opt/render/project/src/backend/dist 2>/dev/null || echo "backend/dist directory not found in Render project"
  
  echo "Render project dist folder contents:"
  ls -la /opt/render/project/src/dist 2>/dev/null || echo "dist directory not found in Render project"
  
  # Try to find any index.js or server.js files in the project
  echo "Searching for any index.js or server.js files in the project:"
  find /opt/render/project/src -name "index.js" -o -name "server.js" 2>/dev/null || echo "No index.js or server.js files found"
  
  exit 1
fi 