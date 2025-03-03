#!/bin/bash

# Log startup information
echo "Starting NoteBins backend application..."
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Log environment variables
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# Check for the existence of index.js in various possible locations
if [ -f "dist/index.js" ]; then
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
  echo "ERROR: Could not find dist/index.js in any expected location"
  echo "Checking all possible locations:"
  
  echo "Current directory dist folder contents:"
  ls -la dist 2>/dev/null || echo "dist directory not found in current directory"
  
  echo "Parent directory dist folder contents:"
  ls -la ../dist 2>/dev/null || echo "dist directory not found in parent directory"
  
  echo "Render project backend dist folder contents:"
  ls -la /opt/render/project/src/backend/dist 2>/dev/null || echo "backend/dist directory not found in Render project"
  
  echo "Render project dist folder contents:"
  ls -la /opt/render/project/src/dist 2>/dev/null || echo "dist directory not found in Render project"
  
  # Try to find any index.js files in the project
  echo "Searching for any index.js files in the project:"
  find /opt/render/project/src -name "index.js" 2>/dev/null || echo "No index.js files found"
  
  exit 1
fi 