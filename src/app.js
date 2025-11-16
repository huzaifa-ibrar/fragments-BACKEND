require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./logger');
const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');

const app = express();

// ✅ Parse JSON + URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS before routes
app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'http://localhost',
            'http://127.0.0.1',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

// ✅ Health check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// ✅ Routes
app.use('/v1', routes);

// ✅ Error handler — last!
app.use(errorHandler);

module.exports = app;
