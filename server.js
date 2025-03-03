// This file ensures the app listens on the correct port for Azure App Service
console.log('Loading server.js wrapper...');

try {
  // Try to load the compiled index.js from dist directory first
  let app;
  try {
    app = require('./dist/index.js');
    console.log('Loaded app from ./dist/index.js');
  } catch (error) {
    console.log('Could not load from dist directory, trying direct import:', error.message);
    // If that fails, try to load index.js from the current directory
    app = require('./index.js');
    console.log('Loaded app from ./index.js');
  }

  const PORT = process.env.PORT || 8080;
  console.log(`PORT environment variable: ${process.env.PORT}`);
  console.log(`Using port: ${PORT}`);

  // If the app exports a server or http.Server instance, we need to ensure it's listening
  if (app && app.listen) {
    console.log('Starting server with app.listen()');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } else if (app && typeof app === 'object') {
    console.log('App object found but no listen method. App may already be listening or not an Express app');
    console.log('App keys:', Object.keys(app));
  } else {
    console.log('No valid app object found');
  }
} catch (error) {
  console.error('Error starting server:', error);
  process.exit(1);
} 