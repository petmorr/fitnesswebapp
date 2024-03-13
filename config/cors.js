const cors = require('cors');

const corsOptions = {
    origin: 'http://localhost:3000', // Allow only this origin to access your API
    methods: 'GET,POST,PUT,DELETE', // Allowable HTTP methods
    allowedHeaders: 'Content-Type,Authorization', // Allowable headers
    credentials: true, // Allow cookies to be sent from the client
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

const corsConfig = cors(corsOptions);

module.exports = corsConfig;