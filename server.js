/**
 * This is a simple wrapper for the actual application.
 * It's used to ensure the application starts correctly in various environments.
 */

try {
  console.log('Starting NoteBins backend via server.js wrapper...');
  console.log('Current directory:', process.cwd());
  console.log('Node.js version:', process.version);
  
  // Try to require the compiled index.js file
  let appPath;
  
  if (require('fs').existsSync('./dist/index.js')) {
    appPath = './dist/index.js';
  } else if (require('fs').existsSync('./index.js')) {
    appPath = './index.js';
  } else {
    console.error('ERROR: Could not find index.js in any expected location');
    console.log('Directory contents:', require('fs').readdirSync('.'));
    
    if (require('fs').existsSync('./dist')) {
      console.log('dist directory contents:', require('fs').readdirSync('./dist'));
    }
    
    process.exit(1);
  }
  
  console.log(`Found application at ${appPath}, starting...`);
  require(appPath);
} catch (error) {
  console.error('Error starting application:', error);
  process.exit(1);
} 