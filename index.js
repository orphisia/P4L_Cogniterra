require('dotenv').config();
const { initializeDatabase, cleanupExpiredTokens } = require('./database');
const StepikAPI = require('./stepik');
const DiscordBot = require('./bot');
const createWebServer = require('./server');
const ProgressTracker = require('./progressTracker');

