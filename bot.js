const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, REST, Routes } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');


class DiscordBot {
    constructor(token, clientId, stepikClient) {
      this.token = token;
      this.clientId = clientId;
      this.stepikClient = stepikClient;
      
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.DirectMessages
        ]
      });
  
      this.setupEventHandlers();
    }