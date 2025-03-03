#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure the dist directory exists
if (!fs.existsSync(path.join(__dirname, '../dist'))) {
  console.log('Building TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  console.log('Creating logs directory...');
  fs.mkdirSync(logsDir, { recursive: true });
}

// Ensure web.config is in the root directory
const webConfigSrc = path.join(__dirname, '../web.config');
const webConfigDest = path.join(__dirname, '../dist/web.config');
if (fs.existsSync(webConfigSrc)) {
  console.log('Copying web.config to dist directory...');
  fs.copyFileSync(webConfigSrc, webConfigDest);
}

// Create a package.json for production
const packageJson = require('../package.json');
const prodPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  main: 'index.js',
  engines: packageJson.engines,
  dependencies: packageJson.dependencies,
  scripts: {
    start: 'node index.js'
  }
};

console.log('Creating production package.json...');
fs.writeFileSync(
  path.join(__dirname, '../dist/package.json'),
  JSON.stringify(prodPackageJson, null, 2)
);

console.log('Deployment preparation complete!'); 