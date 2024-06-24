const express = require("express");
const { log } = require("node:console");
const http = require("node:http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// const pl=["a","b","c"];
const player = {};
const playerscore = {};
let resetinterval;
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname + "/public/index.html"));
// });

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


  socket.on('join room',(roomname)=>{
    socket.join(roomname)
 })
  socket.on("addScore", (number) => {
    if (socket.id === player.a) {
      playerscore.a = number;
      io.to("yudiz").emit("displayscore", { score: playerscore.a, name: "player1" });
    } else if (socket.id === player.b) {
      playerscore.b = number;
      io.to("yudiz").emit("displayscore", { score: playerscore.b, name: "player2" });
    } else if (socket.id === player.c) {
      playerscore.c = number;
      io.to("yudiz").emit("displayscore", { score: playerscore.c, name: "player3" });
    }
    if (Object.keys(playerscore).length === 3) {
      // io.emit('displayscore',playerscore)
      let arr = Object.values(playerscore);
      let max = Math.max(...arr);
   
      

      io.to("yudiz").emit("winner", { winner: max, player: playerscore });
      // let resetinterval=setInterval(reset,20000);
    }

    // function reset(){
    //   delete playerscore.a;
    //  delete playerscore.b;
    //  delete playerscore.c;

    //   io.emit('resetgame',playerscore)
    //   clearInterval(resetinterval)
    // }
  }); 

  
});   

 
server.listen("4001", () => {
  console.log("server is listing on http://localhost:4001");
  
}) 
       