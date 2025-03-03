# Deploying NoteBins Backend to Azure

This guide provides simplified instructions for deploying the NoteBins backend to Azure App Service.

## Prerequisites

1. Azure CLI installed and configured
2. Node.js 18.x or higher
3. npm or yarn

## Deployment Steps

### 1. Prepare Your Application

```bash
# Clean up unnecessary files (optional)
./cleanup.sh

# Install dependencies
npm install

# Create deployment package
./deploy-azure.sh
```

This will create a `deploy.zip` file in your project directory.

### 2. Create Azure Resources

```bash
# Login to Azure
az login

# Create a resource group
az group create --name notebins-rg --location centralindia

# Create an App Service plan
az appservice plan create --name notebins-plan --resource-group notebins-rg --sku B1 --is-linux

# Create a Web App
az webapp create --name notebins-backend --resource-group notebins-rg --plan notebins-plan --runtime "NODE|18-lts"
```

### 3. Configure App Settings

```bash
# Set environment variables
az webapp config appsettings set --name notebins-backend --resource-group notebins-rg --settings \
  WEBSITE_NODE_DEFAULT_VERSION=~18 \
  PORT=8080 \
  NODE_ENV=production \
  MONGODB_URI="your-mongodb-connection-string" \
  JWT_SECRET="your-secret-key" \
  CORS_ORIGIN="your-frontend-url" \
  NOTE_EXPIRATION_DAYS=3 \
  SCM_DO_BUILD_DURING_DEPLOYMENT=true

# Configure startup file
az webapp config set --name notebins-backend --resource-group notebins-rg --startup-file startup.sh
```

### 4. Deploy Your Application

```bash
# Deploy the zip package
az webapp deploy --resource-group notebins-rg --name notebins-backend --src-path deploy.zip --type zip
```

### 5. Verify Deployment

1. Check the deployment status:

   ```bash
   az webapp log tail --name notebins-backend --resource-group notebins-rg
   ```

2. Visit your application:
   ```
   https://notebins-backend.azurewebsites.net/health
   ```

## Troubleshooting

If you encounter deployment issues:

1. Check the logs:

   ```bash
   az webapp log tail --name notebins-backend --resource-group notebins-rg
   ```

2. Verify your app settings:

   ```bash
   az webapp config appsettings list --name notebins-backend --resource-group notebins-rg
   ```

3. Restart the web app:
   ```bash
   az webapp restart --name notebins-backend --resource-group notebins-rg
   ```

## Cleaning Up

To delete all resources when you're done:

```bash
az group delete --name notebins-rg --yes
```
