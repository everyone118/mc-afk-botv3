let ws = null;
let isAFKMode = false;

// Kết nối WebSocket
function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('✅ WebSocket kết nối thành công');
        loadInitialData();
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'status') {
                updateStatus(data.data);
            } else if (data.type === 'response') {
                showSuccess(data.message);
            } else if (data.type === 'error') {
                showError(data.message);
            }
        } catch (error) {
            console.error('Lỗi parse WebSocket:', error);
        }
    };

    ws.onclose = () => {
        console.log('❌ WebSocket bị ngắt');
        document.getElementById('connectionStatus').textContent = '❌ Ngắt';
        document.getElementById('connectionStatus').className = 'status-badge disconnected';
        setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
        console.error('Lỗi WebSocket:', error);
    };
}

// Cập nhật trạng thái
function updateStatus(status) {
    const connected = status.connected ? '🟢 Kết nối' : '🔴 Ngắt';
    document.getElementById('connectionStatus').textContent = connected;
    document.getElementById('connectionStatus').className = `status-badge ${status.connected ? 'connected' : 'disconnected'}`;

    document.getElementById('botUsername').textContent = status.username;
    document.getElementById('health').textContent = `${status.health}/20`;
    document.getElementById('hunger').textContent = `${status.hunger}/20`;
    document.getElementById('position').textContent = `X: ${status.position.x}, Y: ${status.position.y}, Z: ${status.position.z}`;
    document.getElementById('dimension').textContent = status.dimension;

    const afkBadge = document.getElementById('afkStatus');
    if (status.afkMode) {
        afkBadge.textContent = 'ON';
        afkBadge.className = 'afk-badge on';
        isAFKMode = true;
    } else {
        afkBadge.textContent = 'OFF';
        afkBadge.className = 'afk-badge off';
        isAFKMode = false;
    }

    updateAFKButton();
}

// Load dữ liệu ban đầu
async function loadInitialData() {
    try {
        const [statusRes, chatRes, logsRes] = await Promise.all([
            fetch('/api/bot/status'),
            fetch('/api/bot/chat-history?limit=20'),
            fetch('/api/bot/logs?limit=30')
        ]);

        if (statusRes.ok) {
            const status = await statusRes.json();
            updateStatus(status);
        }

        if (chatRes.ok) {
            const chats = await chatRes.json();
            displayChatHistory(chats);
        }

        if (logsRes.ok) {
            const logs = await logsRes.json();
            displayLogs(logs);
        }
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        showError('Lỗi tải dữ liệu từ server');
    }
}

// Gửi tin nhắn chat
async function sendChat() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) {
        showError('Vui lòng nhập tin nhắn');
        return;
    }

    try {
        const response = await fetch('/api/bot/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (response.ok) {
            input.value = '';
            showSuccess('Gửi tin nhắn thành công');
            // Reload chat history
            const historyRes = await fetch('/api/bot/chat-history?limit=20');
            if (historyRes.ok) {
                const chats = await historyRes.json();
                displayChatHistory(chats);
            }
        } else {
            showError('Lỗi gửi tin nhắn');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showError('Lỗi kết nối tới server');
    }
}

// Thực hiện lệnh
async function sendCommand() {
    const input = document.getElementById('commandInput');
    const command = input.value.trim();

    if (!command) {
        showError('Vui lòng nhập lệnh');
        return;
    }

    try {
        const response = await fetch('/api/bot/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command })
        });

        if (response.ok) {
            input.value = '';
            showSuccess('Lệnh được thực hiện');
            // Reload logs
            const logsRes = await fetch('/api/bot/logs?limit=30');
            if (logsRes.ok) {
                const logs = await logsRes.json();
                displayLogs(logs);
            }
        } else {
            showError('Lỗi thực hiện lệnh');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showError('Lỗi kết nối tới server');
    }
}

// Toggle AFK Mode
async function toggleAFK() {
    try {
        const response = await fetch('/api/bot/afk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: !isAFKMode })
        });

        if (response.ok) {
            isAFKMode = !isAFKMode;
            updateAFKButton();
            showSuccess(`AFK Mode ${isAFKMode ? 'bật' : 'tắt'}`);
        } else {
            showError('Lỗi thay đổi AFK Mode');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showError('Lỗi kết nối tới server');
    }
}

// Cập nhật nút AFK
function updateAFKButton() {
    const btn = document.getElementById('afkToggle');
    if (isAFKMode) {
        btn.textContent = '⏹️ Tắt AFK';
        btn.classList.add('active');
    } else {
        btn.textContent = '▶️ Bật AFK';
        btn.classList.remove('active');
    }
}

// Hiển thị lịch sử chat
function displayChatHistory(chats) {
    const container = document.getElementById('chatHistory');

    if (chats.length === 0) {
        container.innerHTML = '<p class="empty">Chưa có tin nhắn</p>';
        return;
    }

    container.innerHTML = chats.map(chat => `
        <div class="chat-item">
            <div class="chat-sender">${chat.sender}</div>
            <div class="chat-message">${escapeHtml(chat.message)}</div>
            <div class="chat-time">${new Date(chat.timestamp).toLocaleTimeString('vi-VN')}</div>
        </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
}

// Hiển thị logs
function displayLogs(logs) {
    const container = document.getElementById('logsHistory');

    if (logs.length === 0) {
        container.innerHTML = '<p class="empty">Chưa có logs</p>';
        return;
    }

    container.innerHTML = logs.map(log => `
        <div class="log-item">
            <div class="log-action">${log.action}</div>
            <div class="log-details">${JSON.stringify(log.details)}</div>
            <div class="chat-time">${new Date(log.timestamp).toLocaleTimeString('vi-VN')}</div>
        </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
}

// Xóa lịch sử chat
function clearChat() {
    if (confirm('Bạn chắc chắn muốn xóa lịch sử chat?')) {
        document.getElementById('chatHistory').innerHTML = '<p class="empty">Chưa có tin nhắn</p>';
        showSuccess('Đã xóa lịch sử chat');
    }
}

// Xóa logs
function clearLogs() {
    if (confirm('Bạn chắc chắn muốn xóa logs?')) {
        document.getElementById('logsHistory').innerHTML = '<p class="empty">Chưa có logs</p>';
        showSuccess('Đã xóa logs');
    }
}

// Hiển thị lỗi
function showError(message) {
    const container = document.querySelector('.container');
    const error = document.createElement('div');
    error.className = 'error';
    error.textContent = '❌ ' + message;
    container.insertBefore(error, container.firstChild);
    setTimeout(() => error.remove(), 3000);
}

// Hiển thị thành công
function showSuccess(message) {
    const container = document.querySelector('.container');
    const success = document.createElement('div');
    success.className = 'success';
    success.textContent = '✅ ' + message;
    container.insertBefore(success, container.firstChild);
    setTimeout(() => success.remove(), 3000);
}

// Escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Khởi động
window.addEventListener('load', () => {
    connectWebSocket();
});
