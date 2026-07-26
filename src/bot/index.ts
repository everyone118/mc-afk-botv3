import dotenv from 'dotenv';
import Bot from './bot';

dotenv.config();

console.log('[BOT] MC_SERVER_HOST:', process.env.MC_SERVER_HOST);
console.log('[BOT] MC_SERVER_PORT:', process.env.MC_SERVER_PORT);

const botConfig = {
  host: process.env.MC_SERVER_HOST || 'localhost',
  port: parseInt(process.env.MC_SERVER_PORT || '25565'),
  username: process.env.MC_BOT_USERNAME || 'AFK_Bot',
  password: process.env.MC_BOT_PASSWORD,
};

console.log('[BOT] Config:', botConfig);

const bot = new Bot(botConfig);
bot.connect();

export default bot;
