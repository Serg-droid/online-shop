import { createServer } from "node:http";

import { Server } from "socket.io";

import axios from "axios"

let counter = 1

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["http://127.0.0.1:8000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  },
});

io.on("connection", (socket) => {
  console.log("a user connected", counter++);
  socket.on("chat message", async (msg) => {
    try {
      const res = await axios.post("http://localhost:8000/chat/send_message/", {
        message: msg.data,
        companion_id: msg.companion_id
      }, {
        headers: {
          "Authorization": `Token ${msg.token}`
        }
      })
      socket.emit("add message", res.data)
    } catch (e) {
      console.error(e)
    }
  });
});

httpServer.listen(3000, () => {
  console.log("NODE SERVER RUN: go to http://localhost:3000");
});


