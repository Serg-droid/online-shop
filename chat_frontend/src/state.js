import { makeAutoObservable, runInAction } from 'mobx'
import { createContext } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'


export class CallStatus {
    static NO_CALL = "NO_CALL"
    static CALL_IN_PROCESS = "CALL_IN_PROCESS"
    static INCOMING_CALL_PENDING = "INCOMING_CALL_PENDING"
}

class CallState {

    socket = null
    initialized = false
    call_status = CallStatus.NO_CALL
    call_data = null

    constructor() {
        makeAutoObservable(this)
    }

    init({ socket }) {
        if (this.initialized) return
        this.socket = socket
        this.socket.on('call', call_data => {
            this.handle_incoming_call(call_data)
        })
        this.initialized = true
    }

    make_call({ caller_id, callee_id }) {
        if (this.call_status !== CallStatus.NO_CALL) return
        console.log("make_call")
        this.socket.emit("call", { caller_id, callee_id })
        this.call_status = CallStatus.CALL_IN_PROCESS
    }

    handle_incoming_call(call_data) {
        console.log("handle_incoming_call")
        this.call_data = call_data
        this.call_status = CallStatus.INCOMING_CALL_PENDING
    }
}

class WebRTCState {
    pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    initialized = false
    stream = null

    init(socket, roomId, localVideo, remoteVideo) {
        if (this.initialized) return
        this.socket = socket
        this.roomId = roomId
        this.localVideo = localVideo
        this.remoteVideo = remoteVideo
        this.socket.on('userJoined', userId => {
            console.log('Пользователь присоединился', userId)
        })

        this.socket.on('userLeft', userId => {
            console.log('Пользователь отключился', userId)
        })

        this.socket.on('roomCreated', roomId => {
            console.log('Создана сессия', roomId)
        })
        this.socket.on('web_rtc_offer', async offer => {
            console.log('web_rtc_offer')
            this.get_offer(offer)
        })
        this.socket.on('web_rtc_answer', async answer => {
            this.get_answer(answer)
        })
        this.socket.on('ice_candidate', async candidate => {
            this.handle_ice_candidate(candidate)
        })
        this.setupHandlers()

        this.initialized = true
    }

    async make_offer() {
        console.log('make offer, roomID:', this.roomId)
        const offer = await this.pc.createOffer()
        await this.pc.setLocalDescription(offer)
        this.socket.emit('web_rtc_offer', { offer, roomId: this.roomId })
    }

    async get_offer(offer) {
        console.log('get offer')
        await this.pc.setRemoteDescription(new RTCSessionDescription(offer))
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: true,
                video: true,
            })
            this.localVideo.srcObject = stream
            stream.getTracks().forEach(track => {
                this.pc.addTrack(track, stream)
            })
        } catch (e) {
            console.error(`Ошибка инициализации WebRTC: ${e}`)
        }
        const answer = await this.pc.createAnswer()
        await this.pc.setLocalDescription(answer)
        this.socket.emit('web_rtc_answer', { roomId: this.roomId, answer })
        console.log('sent answer')
    }

    async get_answer(answer) {
        console.log('get answer')
        await this.pc.setRemoteDescription(new RTCSessionDescription(answer))
    }

    async handle_ice_candidate(candidate) {
        console.log('handle ice candidate')
        console.log(this.pc.remoteDescription)
        await this.pc.addIceCandidate(candidate)
    }

    setupHandlers() {
        if (this.initialized) return
        this.pc.onicecandidate = event => {
            console.log('onicecandidate', event)
            if (event.candidate) {
                this.socket.emit('ice_candidate', {
                    roomId: this.roomId,
                    candidate: event.candidate,
                })
            }
        }
        ;(this.pc.onicecandidateerror = e => {
            console.error('onicecandidate error', e)
        }),
            (this.pc.ontrack = event => {
                console.log('ontrack', event.streams)
                this.remoteVideo.srcObject = event.streams[0]
            })
    }

    addStream(stream) {
        this.stream = stream
    }

    updateRoomId(roomId) {
        this.roomId = roomId
        console.log(this.roomId)
    }
}

class SocketState {
    socket = null

    constructor() {
        makeAutoObservable(this)
    }

    connectSocket(token, user_id) {
        this.socket = io(import.meta.env.VITE_SOCKET_IO_DOMAIN, {
            withCredentials: true,
            query: {
                token,
                user_id,
            },
        })
    }

    setupHandlers(state) {
        this.socket.on('add message', message => {
            console.log('socket event: add message')
            runInAction(() => {
                state.chatState.messages.push(message)
            })
        })
    }
}

class AuthState {
    token = null
    user_id = null

    constructor() {
        makeAutoObservable(this)
    }
}

class ChatState {
    messages = []
    companion = null

    chats_list = []

    constructor() {
        makeAutoObservable(this)
    }

    async getChat({ token, onError, companion_id }) {
        try {
            const res = await axios.get(
                `${
                    import.meta.env.VITE_MASTER_SERVER_DOMAIN
                }chat/${companion_id}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                },
            )
            // console.log(res.data.messages)
            this.messages = res.data.messages
            this.companion = res.data.companion
        } catch (e) {
            onError(e)
        }
    }

    async sendMessage({ data, token, companion_id }) {
        const res = await axios.post(
            `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/send_message/`,
            {
                message: data,
                companion_id: companion_id,
            },
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            },
        )
        runInAction(() => {
            this.messages.push(res.data)
        })
    }

    async sendMessageWithImage({ formData, token, onUploadProgress }) {
        const res = await axios.post(
            `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/send_message/`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Token ${token}`,
                },
                onUploadProgress,
            },
        )
        runInAction(() => {
            this.messages.push(res.data)
        })
    }

    async alterMessage({ token, message_text, message_id }) {
        const res = await axios.put(
            `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/alter_message/`,
            {
                message_text,
                message_id,
            },
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            },
        )
        const altered_message = res.data
        runInAction(() => {
            const old_message = this.messages.find(
                msg => msg.id === altered_message.id,
            )
            Object.assign(old_message, altered_message)
        })
    }

    async deleteMessage({ message_id, token }) {
        const res = await axios.delete(
            `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/delete_message/`,
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
                data: {
                    message_id,
                },
            },
        )
        const deleted_message = res.data
        runInAction(() => {
            const msg = this.messages.find(msg => msg.id === deleted_message.id)
            Object.assign(msg, deleted_message)
        })
    }

    async loadChatsList(authState) {
        const res = await axios.get(
            `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/list/`,
            {
                headers: {
                    Authorization: `Token ${authState.token}`,
                },
            },
        )
        console.log(res.data)
        runInAction(() => {
            this.chats_list = res.data
        })
    }
}

export async function checkAuth() {
    if (state.authState.token) return true
    const token = localStorage.getItem('token')
    if (token == null) {
        return false
    }
    const res = await axios
        .get(`${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/is_authed/`, {
            headers: {
                Authorization: `Token ${token}`,
            },
        })
        .catch(() => {})
    if (res.data.ok == true) {
        const user_id = res.data.user_id
        state.authState.token = token
        state.authState.user_id = user_id
        return true
    } else {
        return false
    }
}

export const state = {
    socketState: new SocketState(),
    chatState: new ChatState(),
    authState: new AuthState(),
    webRTCState: new WebRTCState(),
    callState: new CallState(),
}

export const StateContext = createContext({})
