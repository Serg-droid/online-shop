import { useContext, useEffect, useRef, useState } from 'react'
import { StateContext } from '../../state'

export function WebRTC() {
    const { socketState } = useContext(StateContext)

    const [roomId, setRoomId] = useState('')
    const peerConnectionRef = useRef(new RTCPeerConnection({
        iceServers: [
            {urls: "stun:stun.l.google.com:19302"}
        ]
    }))
    const candidateQueueRef = useRef([])
    const remoteVideo = useRef(null)
    const localVideo = useRef(null)

    useEffect(() => {
        socketState.socket.on("signal", async (signal) => {
            const peerConnection = peerConnectionRef.current
            const candidateQueue = candidateQueueRef.current
            if (signal.candidate) {
                candidateQueue.push(signal)
                // console.log("candidate", signal)
                // await peerConnection.addIceCandidate(new RTCIceCandidate(signal))
            } else {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(signal))
                for (signal of candidateQueue) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(signal))
                }
                candidateQueueRef.current = []
                    console.log("offer")
                    const description = await peerConnection.createAnswer()
                    await peerConnection.setLocalDescription(description)
                    socketState.socket.emit("signal", { roomId, signal: description })

            }
        })

        socketState.socket.on("userJoined", userId => {
            console.log("Пользователь присоединился", userId)
        })

        socketState.socket.on("userLeft", userId => {
            console.log("Пользователь отключился", userId)
        })

        socketState.socket.on("roomCreated", roomId => {
            console.log("Создана сессия", roomId)
        })
    }), []

    const initWebRTC = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: true,
                video: true,
            })
            localVideo.current.srcObject = stream

            const peerConnection = peerConnectionRef.current

            peerConnection.onicecandidate = (event) => {
                console.log("onicecandidate", event)
                if (event.candidate) {
                    socketState.socket.emit("signal", { roomId, signal: event.candidate })
                }
            }

            peerConnection.onicecandidateerror = (e) => {
                console.error("onicecandidate error", e)
            }

            peerConnection.ontrack = (event) => {
                console.log("ontrack", event)
                remoteVideo.current.srcObject = event.streams[0]
            }

            // peerConnection.onnegotiationneeded = e => {
            //     if (peerConnection.signalingState != "stable") return;
            //   }

            // peerConnection.addEventListener(
            //     "track",
            //     (e) => {
            //         remoteVideo.current.srcObject = e.streams[0]
            //     },
            //     false,
            //   );

            stream.getTracks().forEach(track => {
                peerConnection.addStream(stream)
                // peerConnection.addTrack(track, stream)
            })
            const offer = await peerConnection.createOffer()
            await peerConnection.setLocalDescription(offer)
            socketState.socket.emit("signal", { roomId, signal: offer })
        } catch (e) {
            console.error(`Ошибка инициализации WebRTC: ${e}`)
        }
    }

    const createRoom = () => {
        socketState.socket.emit('createRoom', roomId)
        initWebRTC()
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
                    onChange={e => setRoomId(e.target.value)}
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
