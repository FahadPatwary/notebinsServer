# NoteBins Backend Server

This repository contains the backend server for the NoteBins application, a real-time collaborative note-sharing platform.

## Deployment Status

[![Deploy NoteBins Backend to Azure](https://github.com/YOUR_USERNAME/notebinsServer/actions/workflows/azure-deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/notebinsServer/actions/workflows/azure-deploy.yml)

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

## Deployment

This backend is configured for automatic deployment to Azure App Service using GitHub Actions. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Prerequisites for Deployment

1. An Azure account with an active subscription
2. An Azure App Service instance
3. A MongoDB database (Atlas or Azure Cosmos DB with MongoDB API)
4. The publish profile from your Azure App Service added as a GitHub secret named `AZURE_WEBAPP_PUBLISH_PROFILE`

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

## API Documentation

See [API.md](./API.md) for detailed API documentation.

## License

ISC
