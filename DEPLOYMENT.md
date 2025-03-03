# Deploying NoteBins Backend to Azure

This guide explains how to deploy the NoteBins backend to Azure App Service.

## Prerequisites

1. An Azure account with an active subscription
2. Azure CLI installed locally (optional, for manual deployment)
3. GitHub repository with the NoteBins backend code

## Deployment Options

### 1. GitHub Actions (Recommended)

The repository includes a GitHub Actions workflow file (`azure-deploy.yml`) that automates the deployment process.

#### Setup:

1. Create an Azure App Service:

   ```bash
   az group create --name notebins-rg --location centralindia
   az appservice plan create --name notebins-plan --resource-group notebins-rg --sku B1 --is-linux
   az webapp create --name notebins-backend --resource-group notebins-rg --plan notebins-plan --runtime "NODE|18-lts"
   ```

2. Configure App Settings:

   ```bash
   az webapp config appsettings set --name notebins-backend --resource-group notebins-rg --settings \
     MONGODB_URI="your-mongodb-connection-string" \
     NODE_ENV="production" \
     CORS_ORIGIN="your-frontend-url" \
     JWT_SECRET="your-secret-key" \
     NOTE_EXPIRATION_DAYS=3
   ```

3. Get the publish profile:

   ```bash
   az webapp deployment list-publishing-profiles --name notebins-backend --resource-group notebins-rg --xml > publish-profile.xml
   ```

4. Add the publish profile as a GitHub secret:

   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Create a new repository secret named `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Paste the contents of the publish-profile.xml file

5. Push to the main branch or manually trigger the workflow to deploy.

### 2. Manual Deployment

You can also deploy manually using the Azure CLI:

1. Build the project:

   ```bash
   cd backend
   npm ci
   npm run build
   npm run prepare-deployment
   ```

2. Create a deployment package:

   ```bash
   mkdir -p deployment
   cp -r dist/* deployment/
   cp web.config deployment/
   cp package.json deployment/
   cd deployment
   zip -r ../deploy.zip .
   ```

3. Deploy to Azure:
   ```bash
   az webapp deployment source config-zip --resource-group notebins-rg --name notebins-backend --src deploy.zip
   ```

## Troubleshooting

### Common Issues

1. **Connection Issues with MongoDB**:

   - Ensure your MongoDB Atlas IP whitelist includes Azure App Service IPs
   - Verify the connection string in App Settings

2. **Socket.io Connection Issues**:

   - Make sure the web.config file is properly configured for WebSockets
   - Check CORS settings to ensure your frontend domain is allowed

3. **Application Not Starting**:

   - Check the logs using:
     ```bash
     az webapp log tail --name notebins-backend --resource-group notebins-rg
     ```

4. **Deployment Failures**:
   - Check the GitHub Actions logs for detailed error messages
   - Ensure the publish profile is correctly set up as a GitHub secret

## Monitoring

Monitor your application using Azure Application Insights or the built-in logging:

```bash
# Enable Application Insights
az webapp config appsettings set --name notebins-backend --resource-group notebins-rg --settings APPINSIGHTS_INSTRUMENTATIONKEY="your-key"

# View logs
az webapp log tail --name notebins-backend --resource-group notebins-rg
```
