import { createServer } from 'node:http'

import 'dotenv/config'

import { Server } from 'socket.io'

import axios from 'axios'

import * as wss from "./_web_rtc.js"
import { init_WebRTC } from "./web_rtc.js"

const httpServer = createServer((request, response) => {
    let body = []
    request
        .on('error', error => {
            console.error(error)
            response.write(error)
            response.end()
        })
        .on('data', chunk => {
            body.push(chunk)
        })
        .on('end', () => {
            body = JSON.parse(Buffer.concat(body).toString())
            console.log(body)
            const socket_set = SocketMap.get(String(body['id']))
            if (socket_set == null) {
                response.end()
                return
            }
            socket_set.forEach(socket => {
                console.log(
                    `Emit to user with id: ${body['id']}. Socket: ${socket}`,
                )
                socket.emit('add message', body['data'])
            })
            response.on('error', err => {
                console.error(err)
            })
            response.statusCode = 200
            response.setHeader('Content-Type', 'application/json')
            response.end()
            console.log('end response')
        })
})

const SocketMap = new Map()
// connect WS for WebRTC connection establish
const WSSPORT = 8090;
wss.init(WSSPORT)

// connect socket io
const io = new Server(httpServer, {
    cors: {
        origin: JSON.parse(process.env.SOCKET_IO_CORS_ALLOWED_ORIGINS),
        methods: ['GET', 'POST'],
        credentials: true,
    },
})

async function isTokenAuthed(token) {
    if (token == null) {
        return false
    }
    const res = await axios
        .get(`${process.env.MASTER_SERVER_DOMAIN}chat/is_authed/`, {
            headers: {
                Authorization: `Token ${token}`,
            },
        })
        .catch(e => {
            console.error(e)
        })
    if (res.data.ok == true) {
        return true
    } else {
        return false
    }
}

async function notifyMasterAboutSocketConnection(token, isConnected) {
    const res = await axios
        .post(
            `${process.env.MASTER_SERVER_DOMAIN}accounts/set_online_status/`,
            {
                isConnected,
            },
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            },
        )
        .catch(e => {
            console.error(e)
        })
}

function setupHandlers(socket) {
    // socket.on("chat message", async (msg) => {
    //   try {
    //     const res = await axios.post(`${process.env.MASTER_SERVER_DOMAIN}chat/send_message/`, {
    //       message: msg.data,
    //       companion_id: msg.companion_id
    //     }, {
    //       headers: {
    //         "Authorization": `Token ${msg.token}`
    //       }
    //     })
    //     socket.emit("add message", res.data)
    //     const socket_set = SocketMap.get(String(msg.companion_id))
    //     console.log(socket_set)
    //     if (socket_set == null) return
    //     socket_set.forEach(socket => {
    //       console.log(`Emit to user with id: ${msg.companion_id}`)
    //       socket.emit("add message", res.data)
    //     })
    //   } catch (e) {
    //     console.error(e)
    //   }
    // });

    socket.on('disconnect', () => {
        const user_id = socket.handshake.query.user_id
        const token = socket.handshake.query.token
        if (SocketMap.has(user_id)) {
            const socket_set = SocketMap.get(user_id)
            socket_set.delete(socket)
            if (socket_set.size > 0) {
                return
            }
        } 
        notifyMasterAboutSocketConnection(token, false)
    })
}

io.on('connection', async socket => {
    const token = socket.handshake.query.token
    const user_id = socket.handshake.query.user_id
    console.log(`Connection user with ID: ${user_id}`)
    const token_authed = await isTokenAuthed(token)
    if (!token_authed) {
        return
    }
    notifyMasterAboutSocketConnection(token, true)
    if (SocketMap.has(user_id)) {
        const socket_set = SocketMap.get(user_id)
        socket_set.add(socket)
    } else {
        SocketMap.set(user_id, new Set([socket]))
    }
    setupHandlers(socket)
    init_WebRTC(socket)
})

httpServer.listen(3000, () => {
    console.log('NODE SERVER RUN: go to http://localhost:3000')
})
