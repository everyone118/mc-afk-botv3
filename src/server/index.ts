import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import Bot from '../bot/bot';
import setupRoutes from './routes';
import setupWebSocket from './websocket';
import http from 'http';

dotenv.config();

const app = express();
const server = http.createServer(app);

const botConfig = {
  host: process.env.MC_SERVER_HOST || 'localhost',
  port: parseInt(process.env.MC_SERVER_PORT || '25565'),
  username: process.env.MC_BOT_USERNAME || 'AFK_Bot',
  password: process.env.MC_BOT_PASSWORD,
};

const bot = new Bot(botConfig);
bot.connect();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
setupRoutes(app, bot);

// WebSocket
setupWebSocket(server, bot);

const PORT = process.env.SERVER_PORT || 3000;

server.listen(PORT, () => {
  console.log(`\n🚀 Server chạy tại http://localhost:${PORT}`);
  console.log(`📊 Web Dashboard: http://localhost:3001`);
  console.log(`\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[SERVER] Đang tắt...');
  bot.disconnect();
  server.close(() => {
    console.log('[SERVER] 👋 Đã tắt thành công');
    process.exit(0);
  });
});

export { bot };
