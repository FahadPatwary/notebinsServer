/**
 * This is a simple wrapper for the actual application.
 * It's used to ensure the application starts correctly in various environments.
 */

const fs = require('fs');
const path = require('path');

try {
  console.log('Starting NoteBins backend via server.js wrapper...');
  console.log('Current directory:', process.cwd());
  console.log('Node.js version:', process.version);
  
  // Check if we're in the Render environment
  const isRenderEnvironment = fs.existsSync('/opt/render');
  if (isRenderEnvironment) {
    console.log('Detected Render environment');
  }
  
  // Try to find the backend directory in Render environment
  if (isRenderEnvironment && process.cwd() === '/opt/render/project/src') {
    // We're in the root directory, need to check if backend exists
    if (fs.existsSync('./backend')) {
      console.log('Found backend directory, changing to it');
      process.chdir('./backend');
      console.log('New current directory:', process.cwd());
      console.log('Directory contents:', fs.readdirSync('.'));
    }
  }
  
  // Try to require the compiled index.js file
  let appPath;
  
  // Check various possible locations
  const possiblePaths = [
    './dist/index.js',
    './index.js',
    '../dist/index.js',
    '/opt/render/project/src/backend/dist/index.js',
    '/opt/render/project/src/dist/index.js'
  ];
  
  for (const path of possiblePaths) {
    if (fs.existsSync(path)) {
      appPath = path;
      console.log(`Found application at ${appPath}`);
      break;
    }
  }
  
  if (!appPath) {
    console.error('ERROR: Could not find index.js in any expected location');
    console.log('Directory contents:', fs.readdirSync('.'));
    
    if (fs.existsSync('./dist')) {
      console.log('dist directory contents:', fs.readdirSync('./dist'));
    }
    
    if (fs.existsSync('./backend')) {
      console.log('backend directory contents:', fs.readdirSync('./backend'));
      
      if (fs.existsSync('./backend/dist')) {
        console.log('backend/dist directory contents:', fs.readdirSync('./backend/dist'));
      }
    }
    
    // Try to find any index.js files in the project
    if (isRenderEnvironment) {
      console.log('Searching for any index.js files in the project:');
      const { execSync } = require('child_process');
      try {
        const result = execSync('find /opt/render/project/src -name "index.js"', { encoding: 'utf8' });
        console.log(result || 'No index.js files found');
      } catch (error) {
        console.error('Error searching for index.js files:', error.message);
      }
    }
    
    process.exit(1);
  }
  
  console.log(`Starting application from ${appPath}...`);
  require(appPath);
} catch (error) {
  console.error('Error starting application:', error);
  process.exit(1);
} 