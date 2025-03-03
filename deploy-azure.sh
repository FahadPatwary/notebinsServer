#!/bin/bash

# Exit on error
set -e

# Print commands
set -x

# Build the application
echo "Building the application..."
npm run build

# Prepare for deployment
echo "Preparing for deployment..."
npm run prepare-deployment

# Create deployment package
echo "Creating deployment package..."
mkdir -p deployment
cp -r dist/* deployment/
cp web.config deployment/
cp package.json deployment/
cp package-lock.json deployment/
cp startup.sh deployment/
chmod +x deployment/startup.sh
cd deployment
zip -r ../deploy.zip .
cd ..

# Deploy to Azure
echo "Deploying to Azure..."
echo "Run the following command to deploy:"
echo "az webapp deploy --resource-group YOUR_RESOURCE_GROUP --name YOUR_WEBAPP_NAME --src-path deploy.zip --type zip"

echo "Deployment package created successfully!" 