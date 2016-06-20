const powernap = require('powernap.js');

const app = new powernap(8080);

app.staticEndpoint('/', './');