import { useContext, useEffect, useRef, useState } from 'react'
import { StateContext } from '../../state'

export function WebRTC() {
    const { socketState, webRTCState } = useContext(StateContext)

    const [roomId, setRoomId] = useState('')
    const remoteVideo = useRef(null)
    const localVideo = useRef(null)

    const handleInput = (e) => {
        setRoomId(e.target.value)
        webRTCState.updateRoomId(e.target.value)
    }

    useEffect(() => {
        webRTCState.init(socketState.socket, roomId, remoteVideo.current)
    }, [])

    const initWebRTC = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: true,
                video: true,
            })
            localVideo.current.srcObject = stream
            console.log(localVideo.current.srcObject)

            stream.getTracks().forEach(track => {
                webRTCState.pc.addTrack(track, stream)
            })
            await webRTCState.make_offer()
        } catch (e) {
            console.error(`Ошибка инициализации WebRTC: ${e}`)
        }
    }

    const createRoom = () => {
        socketState.socket.emit('createRoom', roomId)
    }

    const joinRoom = () => {
        socketState.socket.emit('joinRoom', roomId)
        initWebRTC()
    }

    return (
        <div>
            <div>
                <input
                    type='text'
                    value={roomId}
                    onChange={handleInput}
                />
                <button onClick={createRoom}>Create Room</button>
                <button onClick={joinRoom}>Join Room</button>
            </div>
            <div>
                <video
                    width={500}
                    height={500}
                    ref={localVideo}
                    autoPlay
                    muted
                ></video>
                <video
                    width={500}
                    height={500}
                    ref={remoteVideo}
                    autoPlay
                ></video>
            </div>
        </div>
    )
}
