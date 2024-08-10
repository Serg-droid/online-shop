export function init_WebRTC(socket) {
    socket.on("createRoom", roomId => {
        socket.join(roomId)
        socket.emit("roomCreated", roomId)
    })

    socket.on("joinRoom", roomId => {
        socket.join(roomId)
        socket.to(roomId).emit("userJoined", socket.id)
    })

    socket.on("signal", data => {
        console.log("signal", data.signal)
        socket.to(data.roomId).emit("signal", data.signal)
    })

    socket.on("disconnect", () => {
        console.log("Пользователь отключен", socket.id)
        const rooms = Object.keys(socket.rooms)
        for (const room of rooms) {
            socket.to(room).emit("userLeft", socket.id)
        }
    })
}