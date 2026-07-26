import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import Bot from '../bot/bot';

function setupWebSocket(server: http.Server, bot: Bot): void {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[WS] 📡 Client kết nối');

    // Gửi trạng thái ban đầu
    ws.send(JSON.stringify({
      type: 'status',
      data: bot.getStatus(),
    }));

    // Gửi update status mỗi 5 giây
    const statusInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'status',
          data: bot.getStatus(),
        }));
      }
    }, 5000);

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case 'command':
            bot.sendCommand(data.command);
            ws.send(JSON.stringify({
              type: 'response',
              success: true,
              message: 'Command sent',
            }));
            break;

          case 'chat':
            bot.sendChat(data.message);
            ws.send(JSON.stringify({
              type: 'response',
              success: true,
              message: 'Chat sent',
            }));
            break;

          case 'afk':
            bot.setAFKMode(data.enabled);
            ws.send(JSON.stringify({
              type: 'response',
              success: true,
              message: `AFK mode ${data.enabled ? 'enabled' : 'disabled'}`,
            }));
            break;

          default:
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Unknown command type',
            }));
        }
      } catch (error: any) {
        ws.send(JSON.stringify({
          type: 'error',
          message: error.message,
        }));
      }
    });

    ws.on('close', () => {
      console.log('[WS] 📡 Client ngắt kết nối');
      clearInterval(statusInterval);
    });

    ws.on('error', (error) => {
      console.error('[WS] Lỗi:', error.message);
    });
  });
}

export default setupWebSocket;
