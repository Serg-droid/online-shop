import { createServer } from "node:http";

import { Server } from "socket.io";

import axios from "axios"

const httpServer = createServer();

const SocketMap = new Map()

const io = new Server(httpServer, {
  cors: {
    origin: ["http://127.0.0.1:8000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  },
});

async function isTokenAuthed(token) {
  if (token == null) {
    return false
  }
  const res = await axios.get("http://localhost:8000/chat/is_authed/", {
      headers: {
          "Authorization": `Token ${token}`
      }
  }).catch((e) => {console.error(e)})
  if (res.data.ok == true) {
      return true
  } else {
      return false
  }
}

function setupHandlers(socket) {
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
      const socket_set = SocketMap.get(msg.companion_id)
      socket_set.forEach(socket => {
        console.log(`Emit to user with id: ${msg.companion_id}`)
        socket.emit("add message", res.data)
      })
    } catch (e) {
      console.error(e)
    }
  });

  socket.on("disconnect", () => {
    console.log("DISCONNECT socket of")
  })
}



io.on("connection", async (socket) => {
  const token = socket.handshake.query.token
  const user_id = socket.handshake.query.user_id
  console.log(`Connection user with ID: ${user_id}`)
  const token_authed = isTokenAuthed(token)
  if (!token_authed) {
    return
  }
  if (SocketMap.has(user_id)) {
    const socket_set = SocketMap.get(user_id)
    socket_set.add(socket)
  } else {
    SocketMap.set(user_id, new Set([socket]))
  }
  setupHandlers(socket)
});

httpServer.listen(3000, () => {
  console.log("NODE SERVER RUN: go to http://localhost:3000");
});


