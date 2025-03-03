// This file ensures the app listens on the correct port for Azure App Service
const app = require('./index.js');
const PORT = process.env.PORT || 8080;

// If the app exports a server or http.Server instance, we need to ensure it's listening
if (app && app.listen) {
  console.log('Starting server on port ' + PORT);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  console.log('App is already listening or not an Express app');
}
