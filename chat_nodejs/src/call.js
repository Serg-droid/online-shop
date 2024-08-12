export function init_call(socket, SocketMap) {
    socket.on('call', ({ caller_id, callee_id }) => {
        console.log(`id: ${caller_id} trying to call id: ${callee_id}`)
        const socket_set = SocketMap.get(""+callee_id)
        console.log(`id: ${callee_id} sockets: ${socket_set}`)
        if (socket_set == null) {
            return
        }
        socket_set.forEach(socket => {
            console.log(
                `Emit to user with id: ${callee_id}. Socket: ${socket}`,
            )
            socket.emit('call', { caller_id })
        })
    })
}
