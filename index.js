require('dotenv').config();
const { initializeDatabase, cleanupExpiredTokens } = require('./database');
const StepikAPI = require('./stepik');
const DiscordBot = require('./bot');
const createWebServer = require('./server');
const ProgressTracker = require('./progressTracker');

function ValidateEnv(){
    const required = [
        'DISCORD_BOT_TOKEN',
        'DISCORD_CLIENT_ID',
        'STEPIK_CLIENT_ID',
        'STEPIK_CLIENT_SECRET',
        'BASE_URL'
      ];

      const missing = required.filter(key => !process.env[key]);

      if (missing.length > 0) {
        console.error('Missing required env variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        console.error('\ check .env file');
        process.exit(1);
      }

      const recommended = [
        'DISCORD_GUILD_ID',
        'ROLE_CHAPTER_1',
        'ROLE_CHAPTER_2',
        'ROLE_CHAPTER_3',
        'ROLE_COURSE_COMPLETE'
      ];

      //Add more roles later
    
}

async function main(){
    console.log("Starting Cogniterra bot");

    validateEnv(); 

    initializeDatabase();

    cleanupExpiredTokens();
}