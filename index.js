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

    //API Client
    const stepikClient = new StepikAPI(process.env.STEPIK_CLIENT_ID, 
        process.env.STEPIK_CLIENT_SECRET);
    //Dicord Bot
    const bot = new DiscordBot(process.env.DISCORD_BOT_TOKEN, 
        process.env.DISCORD_CLIENT_ID, stepikClient);

    const discordClient = await bot.start();

    const progressTracker = new ProgressTracker(stepikClient, discordClient);
    global.progressTracker = progressTracker;

    //5 minute interval
    const pollInterval = parseInt(process.env.POLL_INTERVAL) || 300000;

    const app = createWebServer(stepikClient);

    const port = process.env.PORT || 3000;

    const server = app.listen(port, () => {
        console.log(`\n Bot is operational`);
        console.log(` Web server running on port ${port}`);
        console.log(` OAuth callback URL: ${process.env.BASE_URL}/auth/callback`);
        console.log(`Polling interval: ${pollInterval / 1000} seconds\n`);
      });

    //Cleanup expired tokens every hour
    setInterval(() => {
        const deleted = cleanupExpiredTokens();
        if (deleted.changes > 0) {
          console.log(`Cleaned up ${deleted.changes} expired link tokens`);
        }
      }, 3600000);    

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    
    progressTracker.stopPolling();
    bot.stop();
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    
    progressTracker.stopPolling();
    bot.stop();
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the bot
main().catch(error => {
  console.error('❌ Failed to start bot:', error);
  process.exit(1);
});
