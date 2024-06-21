const express = require("express");
const { log } = require("node:console");
const http = require("node:http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const player = {};
const playerscore = {};
let winners;
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});
io.on("connection", (socket) => {
  console.log("user connected ");

  if (Object.keys(playerscore).length === 3) {
    socket.emit("error", "only 3 player join in this game");
    socket.disconnect();
  }
  if (!player.a) {
    player.a = socket.id;
    socket.emit("playerRole", "a");
  } else if (!player.b) {
    player.b = socket.id;
    socket.emit("playerRole", "b");
  } else if (!player.c) {
    player.c = socket.id;
    socket.emit("playerRole", "c");
  }

  socket.on("disconnect", () => {
    if (socket.id === player.a) {
      delete player.a;
      delete playerscore.a;
    } else if (socket.id === player.b) {
      delete player.b;
      delete playerscore.b;
    } else if (socket.id === player.c) {
      delete player.c;
      delete playerscore.c;
    }
    console.log("user disconnected");
  });

  socket.on("addScore", (number) => {
    if (socket.id === player.a) {
      playerscore.a = number;
      io.emit("displayscore", { score: playerscore.a, name: "player1" });
    } else if (socket.id === player.b) {
      playerscore.b = number;
      io.emit("displayscore", { score: playerscore.b, name: "player2" });
    } else if (socket.id === player.c) {
      playerscore.c = number;
      io.emit("displayscore", { score: playerscore.c, name: "player3" });
    }
    if (Object.keys(playerscore).length === 3) {
      // io.emit('displayscore',playerscore)
      let arr = Object.values(playerscore);
      let max = Math.max(...arr);
      // const playerarr = Object.keys(playerscore);
      
      // for (let i = 0; i < playerarr.length; i++) {
      //   if (playerscore.playerarr[i] === max) {
      //     winners.push(playerarr[i]);
      //   }
      //     console.log("🚀 ~ socket.on ~ winners:", winners)
      // }
      io.emit("winner", { winner: max, player: playerscore });
    }
  });
});

server.listen("4000", () => {
  console.log("server is listing on http://localhost:4000");
});
   