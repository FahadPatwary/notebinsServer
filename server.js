/**
 * This is a robust entry point for the NoteBins backend application.
 * It handles various deployment environments and directory structures.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log environment information
console.log('Starting NoteBins backend...');
console.log('Current directory:', process.cwd());
console.log('Node.js version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');

// Check if we're in the Render environment
const isRenderEnvironment = process.env.RENDER === 'true' || fs.existsSync('/opt/render');
if (isRenderEnvironment) {
  console.log('Detected Render environment');
}

// Try to find the correct directory structure
let appPath = null;
const possiblePaths = [
  './dist/index.js',
  './deployment/index.js',
  './index.js',
  './src/index.js',
  '../dist/index.js',
  '../index.js'
];

// Log directory contents for debugging
console.log('Directory contents:', fs.readdirSync('.'));
if (fs.existsSync('./dist')) {
  console.log('dist directory contents:', fs.readdirSync('./dist'));
}

// Find the first existing path
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    appPath = p;
    console.log(`Found application at ${appPath}`);
    break;
  }
}

if (!appPath) {
  console.error('ERROR: Could not find index.js in any expected location');
  
  // Search for any index.js files in the project for debugging
  if (isRenderEnvironment) {
    console.log('Searching for any index.js files in the project:');
    try {
      const result = execSync('find /opt/render/project -name "index.js" | grep -v "node_modules"', { encoding: 'utf8' });
      console.log(result || 'No index.js files found');
      
      // If we found any index.js files, try to use the first one
      const foundFiles = result.trim().split('\n');
      if (foundFiles.length > 0 && foundFiles[0]) {
        appPath = foundFiles[0];
        console.log(`Attempting to use found file: ${appPath}`);
      }
    } catch (error) {
      console.error('Error searching for index.js files:', error.message);
    }
  }
  
  if (!appPath) {
    process.exit(1);
  }
}

try {
  console.log(`Starting application from ${appPath}...`);
  const app = require(appPath);
  
  // If the app doesn't start a server on its own, we'll start it
  if (app && app.server && typeof app.server.listening === 'boolean' && !app.server.listening) {
    const PORT = process.env.PORT || 8080;
    app.server.listen(PORT, () => {
      console.log(`Server manually started on port ${PORT}`);
    });
  }
} catch (error) {
  console.error('Error starting application:', error);
  process.exit(1);
} 