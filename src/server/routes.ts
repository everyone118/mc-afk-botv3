import { Express } from 'express';
import Bot from '../bot/bot';

function setupRoutes(app: Express, bot: Bot): void {
  // GET /api/bot/status - Lấy trạng thái bot
  app.get('/api/bot/status', (req, res) => {
    try {
      const status = bot.getStatus();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/bot/command - Thực hiện lệnh
  app.post('/api/bot/command', (req, res) => {
    try {
      const { command } = req.body;

      if (!command) {
        return res.status(400).json({ error: 'Command is required' });
      }

      bot.sendCommand(command);
      res.json({ success: true, command });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/bot/chat - Gửi tin nhắn chat
  app.post('/api/bot/chat', (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      bot.sendChat(message);
      res.json({ success: true, message });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/bot/afk - Bật/tắt AFK mode
  app.post('/api/bot/afk', (req, res) => {
    try {
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'enabled must be boolean' });
      }

      bot.setAFKMode(enabled);
      res.json({ success: true, afkMode: enabled });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/bot/chat-history - Lấy lịch sử chat
  app.get('/api/bot/chat-history', (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const history = bot.getChatHistory(limit);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/bot/logs - Lấy logs
  app.get('/api/bot/logs', (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = bot.getLogs(limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
}

export default setupRoutes;
