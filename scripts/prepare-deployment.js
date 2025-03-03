#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the root directory of the project
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('Starting deployment preparation...');

// Ensure the dist directory exists
if (!fs.existsSync(distDir)) {
  console.log('Building TypeScript...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
  } catch (error) {
    console.error('Failed to build TypeScript:', error);
    process.exit(1);
  }
}

// Create logs directory if it doesn't exist
const logsDir = path.join(rootDir, 'logs');
if (!fs.existsSync(logsDir)) {
  console.log('Creating logs directory...');
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (error) {
    console.warn('Failed to create logs directory:', error);
    // Continue anyway, as this is not critical
  }
}

// Ensure web.config is in the dist directory
const webConfigSrc = path.join(rootDir, 'web.config');
const webConfigDest = path.join(distDir, 'web.config');
if (fs.existsSync(webConfigSrc)) {
  console.log('Copying web.config to dist directory...');
  try {
    fs.copyFileSync(webConfigSrc, webConfigDest);
  } catch (error) {
    console.warn('Failed to copy web.config:', error);
    console.warn('This may cause issues with Azure deployment.');
  }
} else {
  console.error('web.config not found in root directory. Deployment might fail.');
  console.log('Creating a basic web.config file...');
  
  const basicWebConfig = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="true" />
    <handlers>
      <add name="iisnode" path="index.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True" />
          </conditions>
          <action type="Rewrite" url="index.js" />
        </rule>
      </rules>
    </rewrite>
    <iisnode watchedFiles="web.config;*.js" node_env="production" />
    <appSettings>
      <add key="PORT" value="8080" />
    </appSettings>
  </system.webServer>
</configuration>`;
  
  try {
    fs.writeFileSync(webConfigDest, basicWebConfig);
    console.log('Basic web.config created successfully.');
  } catch (error) {
    console.error('Failed to create basic web.config:', error);
  }
}

// Create a package.json for production
try {
  const packageJson = require(path.join(rootDir, 'package.json'));
  const prodPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    main: 'index.js',
    engines: {
      node: "18.x"  // Explicitly set Node.js version to 18.x
    },
    dependencies: packageJson.dependencies,
    scripts: {
      start: 'node index.js'
    }
  };

  console.log('Creating production package.json in dist directory...');
  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(prodPackageJson, null, 2)
  );
} catch (error) {
  console.error('Failed to create production package.json:', error);
  process.exit(1);
}

// Create a simple .env file for production if it doesn't exist
const envDest = path.join(distDir, '.env');
if (!fs.existsSync(envDest)) {
  console.log('Creating placeholder .env file in dist directory...');
  try {
    // Add PORT=8080 to the .env file
    fs.writeFileSync(envDest, 
      '# Production environment variables will be set in Azure App Service\n' +
      'PORT=8080\n'
    );
  } catch (error) {
    console.warn('Failed to create .env file:', error);
    // Continue anyway, as this is not critical
  }
}

// Create a server.js file that ensures the app listens on the correct port
const serverJsPath = path.join(distDir, 'server.js');
console.log('Creating server.js wrapper for Azure...');
try {
  const serverJsContent = `// This file ensures the app listens on the correct port for Azure App Service
const app = require('./index.js');
const PORT = process.env.PORT || 8080;

// If the app exports a server or http.Server instance, we need to ensure it's listening
if (app.listen) {
  app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
  });
}
`;
  fs.writeFileSync(serverJsPath, serverJsContent);
  
  // Update the package.json start script to use server.js
  const packageJsonPath = path.join(distDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.main = 'server.js';
  packageJson.scripts.start = 'node server.js';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log('Created server.js and updated package.json successfully.');
} catch (error) {
  console.warn('Failed to create server.js:', error);
  // Continue anyway, as this might not be critical if the app already listens correctly
}

// Copy startup.sh to the dist directory
const startupSrc = path.join(rootDir, 'startup.sh');
const startupDest = path.join(distDir, 'startup.sh');
if (fs.existsSync(startupSrc)) {
  console.log('Copying startup.sh to dist directory...');
  try {
    fs.copyFileSync(startupSrc, startupDest);
    // Make it executable
    fs.chmodSync(startupDest, '755');
    console.log('startup.sh copied and made executable.');
  } catch (error) {
    console.warn('Failed to copy startup.sh:', error);
  }
} else {
  console.log('Creating startup.sh in dist directory...');
  try {
    const startupContent = `#!/bin/bash

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
node server.js
`;
    fs.writeFileSync(startupDest, startupContent);
    // Make it executable
    fs.chmodSync(startupDest, '755');
    console.log('startup.sh created and made executable.');
  } catch (error) {
    console.warn('Failed to create startup.sh:', error);
  }
}

// Copy package-lock.json to the dist directory
const packageLockSrc = path.join(rootDir, 'package-lock.json');
const packageLockDest = path.join(distDir, 'package-lock.json');
if (fs.existsSync(packageLockSrc)) {
  console.log('Copying package-lock.json to dist directory...');
  try {
    fs.copyFileSync(packageLockSrc, packageLockDest);
    console.log('package-lock.json copied successfully.');
  } catch (error) {
    console.warn('Failed to copy package-lock.json:', error);
  }
}

console.log('Deployment preparation complete!'); 