// import adapter from 'webrtc-adapter';

let localStream

export const setupDevice = () => {
    console.log('setupDevice invoked')
    navigator.mediaDevices.enumerateDevices().then(devices => {
        console.log(devices)
    })
    // need to have micro and camera: types: audioinput and videoinput
    // navigator.getUserMedia(
    //     { audio: false, video: true },
    //     stream => {
    //         // render local stream on DOM
    //         const localPlayer = document.getElementById('localPlayer')
    //         localPlayer.srcObject = stream
    //         localStream = stream
    //     },
    //     error => {
    //         console.error('getUserMedia error:', error)
    //     },
    // )
    navigator.mediaDevices.getDisplayMedia(
        { audio: true, video: true },
        stream => {
            // render local stream on DOM
            const localPlayer = document.getElementById('localPlayer')
            localPlayer.srcObject = stream
            localStream = stream
        },
        error => {
            console.error('getUserMedia error:', error)
        },
    )
}

const constraints = {
    video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
    },
    audio: true,
}

navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
        // Handle the media stream as needed.
    })
    .catch(error => {
        // Handle the error if constraints cannot be satisfied.
    })

const servers = []
const pcConstraints = {
    optional: [{ DtlsSrtpKeyAgreement: true }],
}

// When user clicks call button, we will create the p2p connection with RTCPeerConnection
export const callOnClick = () => {
    console.log('callOnClick invoked')
    if (localStream.getVideoTracks().length > 0) {
        console.log(
            `Using video device: ${localStream.getVideoTracks()[0].label}`,
        )
    }
    if (localStream.getAudioTracks().length > 0) {
        console.log(
            `Using audio device: ${localStream.getAudioTracks()[0].label}`,
        )
    }
    localPeerConnection = new RTCPeerConnection(servers, pcConstraints)
    localPeerConnection.onicecandidate = gotLocalIceCandidateOffer
    localPeerConnection.onaddstream = gotRemoteStream
    localPeerConnection.addStream(localStream)
    localPeerConnection.createOffer().then(gotLocalDescription)
}
// async function to handle offer sdp
const gotLocalDescription = offer => {
    console.log('gotLocalDescription invoked:', offer)
    localPeerConnection.setLocalDescription(offer)
}
// async function to handle received remote stream
const gotRemoteStream = event => {
    console.log('gotRemoteStream invoked')
    const remotePlayer = document.getElementById('peerPlayer')
    remotePlayer.srcObject = event.stream
}
// async function to handle ice candidates
const gotLocalIceCandidateOffer = event => {
    console.log(
        'gotLocalIceCandidateOffer invoked',
        event.candidate,
        localPeerConnection.localDescription,
    )
    // when gathering candidate finished, send complete sdp
    if (!event.candidate) {
        const offer = localPeerConnection.localDescription
        // send offer sdp to signaling server via websocket
        sendWsMessage('send_offer', {
            channelName,
            userId,
            sdp: offer,
        })
    }
}

const onAnswer = offer => {
    console.log('onAnswer invoked')
    setCallButtonDisabled(true)
    setHangupButtonDisabled(false)

    if (localStream.getVideoTracks().length > 0) {
        console.log(
            `Using video device: ${localStream.getVideoTracks()[0].label}`,
        )
    }
    if (localStream.getAudioTracks().length > 0) {
        console.log(
            `Using audio device: ${localStream.getAudioTracks()[0].label}`,
        )
    }
    localPeerConnection = new RTCPeerConnection(servers, pcConstraints)
    localPeerConnection.onicecandidate = gotLocalIceCandidateAnswer
    localPeerConnection.onaddstream = gotRemoteStream
    localPeerConnection.addStream(localStream)
    localPeerConnection.setRemoteDescription(offer)
    localPeerConnection.createAnswer().then(gotAnswerDescription)

    const gotRemoteStream = event => {
        console.log('gotRemoteStream invoked')
        const remotePlayer = document.getElementById('peerPlayer')
        remotePlayer.srcObject = event.stream
    }
    const gotAnswerDescription = answer => {
        console.log('gotAnswerDescription invoked:', answer)
        localPeerConnection.setLocalDescription(answer)
    }

    const gotLocalIceCandidateAnswer = event => {
        console.log(
            'gotLocalIceCandidateAnswer invoked',
            event.candidate,
            localPeerConnection.localDescription,
        )
        // gathering candidate finished, send complete sdp
        if (!event.candidate) {
            const answer = localPeerConnection.localDescription
            sendWsMessage('send_answer', {
                channelName,
                userId,
                sdp: answer,
            })
        }
    }
}
