#!/bin/bash

# Exit on error
set -e

# Print commands
set -x

echo "Cleaning up unnecessary files for deployment..."

# Remove development and test files
rm -rf node_modules
rm -rf .git
rm -rf .github
rm -rf .vscode
rm -rf .qodo
rm -rf __tests__
rm -rf coverage

# Remove unnecessary configuration files
rm -f .gitignore
rm -f jest.config.js
rm -f tsconfig.json
rm -f azure-deploy.yml
rm -f publish-profile.xml

# Remove documentation files (optional, remove if you want to keep them)
# rm -f README.md
# rm -f README-GITHUB.md
# rm -f API.md
# rm -f DEPLOYMENT.md
# rm -f SUMMARY.md

# Clean up any previous deployment artifacts
rm -rf deployment
rm -f deploy.zip

echo "Cleanup complete! Ready for deployment." 