import mineflayer from 'mineflayer';
import { BotConfig, BotStatus, Position, ChatMessage, BotLog } from '../types';

class Bot {
  private config: BotConfig;
  private bot: any;
  private afkMode: boolean = false;
  private logs: BotLog[] = [];
  private maxLogs: number = 1000;
  private afkInterval: NodeJS.Timeout | null = null;
  private chatHistory: ChatMessage[] = [];

  constructor(config: BotConfig) {
    this.config = config;
  }

  connect(): void {
    console.log(`[BOT] Đang kết nối tới ${this.config.host}:${this.config.port}...`);

    this.bot = mineflayer.createBot({
      host: this.config.host,
      port: this.config.port,
      username: this.config.username,
      password: this.config.password || undefined,
      version: '1.21.1',
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.bot.on('login', () => {
      console.log('[BOT] ✅ Đã kết nối thành công!');
      this.addLog('connected', { username: this.config.username });
    });

    this.bot.on('end', (reason: string) => {
      console.log(`[BOT] ❌ Kết nối bị ngắt: ${reason}`);
      this.addLog('disconnected', { reason });
    });

    this.bot.on('error', (err: Error) => {
      console.error(`[BOT] ⚠️ Lỗi: ${err.message}`);
      this.addLog('error', { error: err.message });
    });

    this.bot.on('chat', (username: string, message: string) => {
      this.chatHistory.push({
        message,
        timestamp: Date.now(),
        sender: username,
      });
      console.log(`[CHAT] ${username}: ${message}`);
      this.addLog('chat_received', { username, message });
    });

    this.bot.on('death', () => {
      console.log('[BOT] ☠️ Bot chết!');
      this.addLog('died', {});
      setTimeout(() => this.respawn(), 1000);
    });
  }

  private respawn(): void {
    if (this.bot && this.bot.health <= 0) {
      this.bot.setControlState('jump', true);
      setTimeout(() => this.bot.setControlState('jump', false), 100);
      console.log('[BOT] 🔄 Respawn...');
      this.addLog('respawned', {});
    }
  }

  getStatus(): BotStatus {
    const pos = this.bot?.entity?.position || { x: 0, y: 0, z: 0 };

    return {
      connected: this.bot?.entity ? true : false,
      username: this.config.username,
      health: this.bot?.health || 0,
      hunger: this.bot?.food || 0,
      position: {
        x: Math.round(pos.x * 100) / 100,
        y: Math.round(pos.y * 100) / 100,
        z: Math.round(pos.z * 100) / 100,
      },
      dimension: this.bot?.game?.dimension || 'unknown',
      afkMode: this.afkMode,
    };
  }

  sendCommand(command: string): void {
    if (!this.bot?.entity) {
      console.log('[BOT] ❌ Bot chưa kết nối!');
      return;
    }

    this.bot.chat(command);
    console.log(`[BOT] 💬 Gửi: ${command}`);
    this.addLog('command_sent', { command });
  }

  sendChat(message: string): void {
    if (!this.bot?.entity) {
      console.log('[BOT] ❌ Bot chưa kết nối!');
      return;
    }

    this.bot.chat(message);
    console.log(`[BOT] 💬 Chat: ${message}`);
    this.addLog('chat_sent', { message });
  }

  setAFKMode(enabled: boolean): void {
    this.afkMode = enabled;

    if (enabled) {
      console.log('[BOT] 🔄 Bật AFK Mode');
      this.startAFKBehavior();
      this.addLog('afk_enabled', {});
    } else {
      console.log('[BOT] ⏹️ Tắt AFK Mode');
      this.stopAFKBehavior();
      this.addLog('afk_disabled', {});
    }
  }

  private startAFKBehavior(): void {
    if (this.afkInterval) return;

    this.afkInterval = setInterval(() => {
      if (!this.bot?.entity) return;

      // Thực hiện hành động anti-AFK
      const actions = [
        () => this.bot.setControlState('jump', true),
        () => this.bot.setControlState('jump', false),
        () => this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2),
      ];

      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      randomAction();
    }, 30000); // Mỗi 30 giây
  }

  private stopAFKBehavior(): void {
    if (this.afkInterval) {
      clearInterval(this.afkInterval);
      this.afkInterval = null;
    }
  }

  getChatHistory(limit: number = 50): ChatMessage[] {
    return this.chatHistory.slice(-limit);
  }

  getLogs(limit: number = 100): BotLog[] {
    return this.logs.slice(-limit);
  }

  private addLog(action: string, details: any): void {
    const log: BotLog = {
      timestamp: Date.now(),
      action,
      details,
    };

    this.logs.push(log);

    // Giới hạn số log
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  disconnect(): void {
    this.stopAFKBehavior();
    if (this.bot) {
      this.bot.quit();
      console.log('[BOT] 👋 Đã ngắt kết nối');
    }
  }
}

export default Bot;
