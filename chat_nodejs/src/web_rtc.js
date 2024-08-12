export function init_WebRTC(socket) {
    socket.on("createRoom", roomId => {
        console.log("created roomId:", roomId)
        socket.join(roomId)
        socket.emit("roomCreated", roomId)
    })

    socket.on("joinRoom", roomId => {
        console.log("joined roomID:", roomId)
        socket.join(roomId)
        socket.to(roomId).emit("userJoined", socket.id)
    })

    socket.on("web_rtc_offer", data => {
        console.log("web_rtc_offer")
        socket.to(data.roomId).emit("web_rtc_offer", data.offer)
    })

    socket.on("web_rtc_answer", data => {
        console.log("web_rtc_answer", data)
        socket.to(data.roomId).emit("web_rtc_answer", data.answer)
    })

    socket.on("ice_candidate", data => {
        console.log("ice_candidate:", data)
        socket.to(data.roomId).emit("ice_candidate", data.candidate)
    })

    socket.on("disconnect", () => {
        console.log("Пользователь отключен", socket.id)
        const rooms = Object.keys(socket.rooms)
        for (const room of rooms) {
            socket.to(room).emit("userLeft", socket.id)
        }
    })
}