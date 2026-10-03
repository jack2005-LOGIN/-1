const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static('public')); // 將前端 HTML 放在 public 資料夾

let players = {}; // 存放所有在線玩家

io.on('connection', (socket) => {
  console.log(`少俠加入連線: ${socket.id}`);

  // 1. 玩家登入並初始化角色
  socket.on('playerJoin', (data) => {
    players[socket.id] = {
      id: socket.id,
      name: data.name,
      gender: data.gender,
      job: data.job,
      x: 780,
      y: 720,
      hp: 130,
      title: data.title || '少俠'
    };
    io.emit('updatePlayers', players);
  });

  // 2. 移動座標同步
  socket.on('playerMove', (pos) => {
    if (players[socket.id]) {
      players[socket.id].x = pos.x;
      players[socket.id].y = pos.y;
      players[socket.id].facing = pos.facing;
      socket.broadcast.emit('playerMoved', players[socket.id]);
    }
  });

  // 3. 全服即時聊天廣播
  socket.on('sendChat', (chatData) => {
    io.emit('newChat', {
      channel: chatData.channel,
      name: players[socket.id]?.name || '神秘俠客',
      msg: chatData.msg
    });
  });

  // 4. 斷線清理
  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('updatePlayers', players);
    console.log(`少俠離線: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log('風雲伺服器已啟動於 http://localhost:3000');
});
