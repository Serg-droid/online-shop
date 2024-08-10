import {Button, Input, Textarea, Typography} from "@mui/joy"
import { useEffect, useRef } from "react";
import { callOnClick, setupDevice } from "./webrtc";



const URL_WEB_SOCKET = 'ws://localhost:8090/ws';


export function WebRTC() {

    const ws = useRef(null);
    useEffect(() => {
        const wsClient = new WebSocket(URL_WEB_SOCKET);
        wsClient.onopen = () => {
            console.log('ws opened');
            ws.current = wsClient;
            // setup camera and join channel after ws opened
            // join();
            setupDevice();
        };
        wsClient.onclose = () => console.log('ws closed');
        wsClient.onmessage = (message) => {
            console.log('ws message received', message.data);
            const parsedMessage = JSON.parse(message.data);
            switch (parsedMessage.type) {
            case 'joined': {
                const body = parsedMessage.body;
                console.log('users in this channel', body);
                break;
            }
            case 'offer_sdp_received': {
                const offer = parsedMessage.body;
                onAnswer(offer);
                break;
            }
            case 'answer_sdp_received': {
                gotRemoteDescription(parsedMessage.body);
                break;
            }
            case 'quit': {
                break;
            }
            default:
                break;
            }
        };
        return () => {
            wsClient.close();
        };
    }, []);
    const sendWsMessage = (type, body) => {
        console.log('sendWsMessage invoked', type, body);
        ws.current.send(JSON.stringify({
            type,
            body,
        }));
    };

    const renderHelper = () => {
        return (
            <div className="wrapper">
                <Input
                    placeholder="User ID"
                    style={{width: 240, marginTop: 16}}
                />
                <Input
                    placeholder="Channel Name"
                    style={{width: 240, marginTop: 16}}
                />
                <Button
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                    onClick={callOnClick}
                >
                    Call
                </Button>
                <Button
                    danger="true"
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                >
                    Hangup
                </Button>
            </div>
        );
    };

    const renderTextarea = () => {
        return (
            <div className="wrapper">
                <Textarea
                    style={{width: 240, marginTop: 16}}
                    placeholder='Send message'
                />
                <Textarea
                    style={{width: 240, marginTop: 16}}
                    placeholder='Receive message'
                    disabled
                />
                <Button
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                    disabled={true}
                >
                    Send Message
                </Button>
            </div>
        );
    };

    return (
        <div className="App">
            <div className="App-header">
                <h2>WebRTC</h2>
                <Typography>This is a simple demo app that demonstrates how to build a WebRTC application from scratch, including a signaling server. It serves as a step-by-step guide to help you understand the process of implementing WebRTC in your own projects.</Typography>
                <div className='wrapper-row' style={{justifyContent: 'space-evenly', width: '50%'}}>
                    {renderHelper()}
                    {renderTextarea()}
                </div>
                <div
                    className='playerContainer'
                    id="playerContainer"
                >
                    <video
                        id="peerPlayer"
                        autoPlay
                        style={{width: 640, height: 480}}
                    />
                    <video
                        id="localPlayer"
                        autoPlay
                        style={{width: 640, height: 480}}
                    />
                </div>
            </div>
        </div>
    );
}