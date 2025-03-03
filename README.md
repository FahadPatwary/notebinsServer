# NoteBins Backend

Backend server for the NoteBins application, a real-time collaborative note-sharing platform.

## Deployment Status

[![Build and deploy Node.js app to Azure](https://github.com/YOUR_USERNAME/notebins/actions/workflows/main_nodeapp.yml/badge.svg)](https://github.com/YOUR_USERNAME/notebins/actions/workflows/main_nodeapp.yml)

## Features

- Real-time collaborative note editing with Socket.io
- Note saving and management
- Password protection for notes
- Automatic note expiration
- RESTful API for note operations

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to Azure

This backend is configured for automatic deployment to Azure App Service using GitHub Actions.

### Prerequisites

1. An Azure account with an active subscription
2. An Azure App Service instance
3. A MongoDB database (Atlas or Azure Cosmos DB with MongoDB API)

### Setup Steps

1. Create an Azure App Service:

   ```bash
   az group create --name my-node-app-rg --location centralindia
   az appservice plan create --name my-node-app-plan --resource-group my-node-app-rg --sku B1 --is-linux
   az webapp create --name nodeapp --resource-group my-node-app-rg --plan my-node-app-plan --runtime "NODE|18-lts"
   ```

2. Configure App Settings:

   ```bash
   az webapp config appsettings set --name nodeapp --resource-group my-node-app-rg --settings \
     MONGODB_URI="your-mongodb-connection-string" \
     NODE_ENV="production" \
     CORS_ORIGIN="your-frontend-url" \
     JWT_SECRET="your-secret-key" \
     NOTE_EXPIRATION_DAYS=3
   ```

3. Set up GitHub Actions authentication:

   You can use either service principal authentication (as configured in the workflow) or a publish profile:

   **For publish profile**:

   ```bash
   az webapp deployment list-publishing-profiles --name nodeapp --resource-group my-node-app-rg --xml > publish-profile.xml
   ```

   Then add the content as a GitHub secret named `AZURE_WEBAPP_PUBLISH_PROFILE`.

   **For service principal** (already configured in your workflow):
   Ensure the following secrets are set in your GitHub repository:

   - `AZUREAPPSERVICE_CLIENTID_E2606AAA9E5E48FF8CF66B6706BEE255`
   - `AZUREAPPSERVICE_TENANTID_7AAD3F825C2D41D8BE7CAD38C70D2451`
   - `AZUREAPPSERVICE_SUBSCRIPTIONID_625B6336EF244756A94B7EC3FC023742`

4. Push to the main branch or manually trigger the workflow to deploy.

## Troubleshooting

If you encounter issues with the deployment, check:

1. The GitHub Actions logs for detailed error messages
2. The Azure App Service logs using:
   ```bash
   az webapp log tail --name nodeapp --resource-group my-node-app-rg
   ```
3. Make sure your MongoDB Atlas IP whitelist includes Azure App Service IPs
4. Verify that the web.config file is properly configured for WebSockets
5. Check if the resource exists in the Azure portal at the correct location

## API Documentation

See [API.md](./API.md) for detailed API documentation.

## Project Structure

```
backend/
├── src/               # TypeScript source code
│   ├── config/        # Configuration files
│   ├── controllers/   # Request handlers
│   ├── middleware/    # Express middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── index.ts       # Entry point
├── dist/              # Compiled JavaScript (generated)
├── scripts/           # Utility scripts
├── logs/              # Application logs (generated)
├── .env               # Environment variables (create from .env.example)
└── package.json       # Dependencies and scripts
```

## Available Scripts

- `npm run dev`: Start the development server with hot-reloading
- `npm run build`: Build the TypeScript code
- `npm start`: Start the production server
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run prepare-deployment`: Prepare files for deployment

## License

ISC
