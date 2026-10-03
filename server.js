const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 提供同目錄下的 index.html 作為靜態網頁
app.use(express.static(__dirname));

// Socket.io 連線處理
io.on('connection', (socket) => {
  console.log('玩家已連線：', socket.id);

  socket.on('disconnect', () => {
    console.log('玩家已離線：', socket.id);
  });
});

// 關鍵：使用 process.env.PORT 讓雲端平台（Fly.io）指定 Port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`伺服器運作中，Port: ${PORT}`);
});
