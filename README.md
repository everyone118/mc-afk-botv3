# MC AFK Bot v3

Minecraft 1.21.11 AFK Bot với Web Dashboard điều khiển

## ✨ Tính năng

- 🤖 Bot AFK tự động không disconnect
- 📊 Web Dashboard điều khiển realtime
- ⚙️ Thực hiện lệnh từ dashboard
- 🔄 Auto-respawn khi chết
- 📝 Lưu trữ log hoạt động
- 🛡️ Anti-AFK detection
- 📈 Monitoring trạng thái bot

## 📦 Requirements

- Node.js v16+
- npm hoặc yarn
- Minecraft Server 1.21.11

## 🚀 Cài đặt

```bash
# Clone repository
git clone https://github.com/everyone118/mc-afk-botv3.git
cd mc-afk-botv3

# Cài đặt dependencies
npm install

# Copy .env.example thành .env
cp .env.example .env
```

## ⚙️ Cấu hình

Chỉnh sửa file `.env`:

```env
MC_SERVER_HOST=localhost      # IP/Hostname server Minecraft
MC_SERVER_PORT=25565         # Port server Minecraft
MC_BOT_USERNAME=AFK_Bot      # Username bot
MC_BOT_PASSWORD=             # Password (nếu offline mode để trống)

SERVER_PORT=3000             # Port backend API
DASHBOARD_PORT=3001          # Port web dashboard
```

## 🎮 Sử dụng

### Development Mode

```bash
npm run dev
```

Sẽ chạy cả bot và server cùng lúc:
- Bot: Kết nối tới Minecraft server
- Server: Backend API chạy trên `http://localhost:3000`
- Dashboard: Truy cập `http://localhost:3001`

### Production Mode

```bash
npm run build
npm start
```

## 📱 Web Dashboard

Truy cập: `http://localhost:3001`

### Tính năng:
- 🟢 Xem trạng thái kết nối bot
- 📍 Vị trí bot (X, Y, Z)
- ❤️ Health & Hunger
- 💬 Gửi lệnh chat
- ⚡ Thực hiện lệnh server
- 📊 Lịch sử hoạt động
- 🔄 Auto-AFK mode

## 📝 API Endpoints

### GET /api/bot/status
Lấy trạng thái bot hiện tại

```json
{
  "connected": true,
  "username": "AFK_Bot",
  "health": 20,
  "hunger": 20,
  "position": { "x": 0, "y": 64, "z": 0 },
  "dimension": "overworld"
}
```

### POST /api/bot/command
Thực hiện lệnh chat

```json
{
  "command": "/say Hello"
}
```

### POST /api/bot/chat
Gửi tin nhắn chat

```json
{
  "message": "Hello everyone!"
}
```

### POST /api/bot/afk
Bật/tắt AFK mode

```json
{
  "enabled": true
}
```

## 🛠️ Cấu trúc thư mục

```
mc-afk-botv3/
├── src/
│   ├── bot/                 # Bot core
│   │   ├── index.ts
│   │   ├── bot.ts
│   │   ├── commands.ts
│   │   └── behaviors.ts
│   ├── server/              # Backend API
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── websocket.ts
│   └── types/               # TypeScript types
│       └── index.ts
├── public/                  # Web Dashboard
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Troubleshooting

### Bot không kết nối
- Kiểm tra IP/Port server
- Chắc chắn server đang chạy
- Kiểm tra firewall

### Dashboard không hiển thị
- Kiểm tra PORT 3001 có sẵn sàng
- Clear cache browser (Ctrl+Shift+Delete)

### Anti-AFK bị phát hiện
- Điều chỉnh các hành động AFK trong `src/bot/behaviors.ts`

## 📄 License

MIT

## 👨‍💻 Author

everyone118
