import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { StateContext } from '../state'
import { observer } from 'mobx-react-lite'
import { UploadFile } from './UploadFile'
import { ChatMessage } from './ChatMessage'
import { Box, Sheet, Stack } from '@mui/joy'
import { MessagesPaneHeader } from './MessagesPaneHeader'
import { AvatarWithStatus } from './AvatarWithStatus'
import MessageInput from './MessageInput'

import { chats } from '../fakeData'
import { ChatBubble } from './ChatBubble'

export const ChatPage = observer(() => {
    const { chatState, authState, socketState } = useContext(StateContext)
    const urlParams = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [messageText, setMessageText] = useState('')

    // FROM mui
    const chat = chats[0]
    const [chatMessages, setChatMessages] = useState(chat.messages)
    const [textAreaValue, setTextAreaValue] = useState('')
    // FROM mui

    const companion_id = urlParams['companion_id']

    useEffect(() => {
        ;(async () => {
            await chatState.getChat({
                token: authState.token,
                companion_id,
                onError: e => {
                    if (e instanceof AxiosError && e.response.status === 404) {
                        navigate('error_404')
                    } else {
                        console.error(e)
                    }
                },
            })
            setLoading(false)
        })()
    }, [])

    const onFormSubmit = e => {
        e.preventDefault()
        chatState.sendMessage({
            data: messageText,
            token: authState.token,
            companion_id: companion_id,
        })
        setMessageText('')
    }

    if (loading) {
        return <p>Loading...</p>
    }

    const { companion, messages } = chatState

    return (
        <div>
            <Sheet
                sx={{
                    height: {
                        xs: 'calc(100dvh - var(--Header-height))',
                        lg: '100dvh',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'background.level1',
                }}
            >
                <MessagesPaneHeader sender={chat.sender} />
                <Box
                    sx={{
                        display: 'flex',
                        flex: 1,
                        minHeight: 0,
                        px: 2,
                        py: 3,
                        overflowY: 'scroll',
                        flexDirection: 'column-reverse',
                    }}
                >
                    <Stack spacing={2} justifyContent='flex-end'>
                        {chatMessages.map((message, index) => {
                            const isYou = message.sender === 'You'
                            return (
                                <Stack
                                    key={index}
                                    direction='row'
                                    spacing={2}
                                    flexDirection={
                                        isYou ? 'row-reverse' : 'row'
                                    }
                                >
                                    {message.sender !== 'You' && (
                                        <AvatarWithStatus
                                            online={message.sender.online}
                                            src={message.sender.avatar}
                                        />
                                    )}
                                    <ChatBubble
                                        variant={isYou ? 'sent' : 'received'}
                                        {...message}
                                    />
                                </Stack>
                            )
                        })}
                    </Stack>
                </Box>
                <MessageInput
                    textAreaValue={textAreaValue}
                    setTextAreaValue={setTextAreaValue}
                    onSubmit={() => {
                        const newId = chatMessages.length + 1
                        const newIdString = newId.toString()
                        setChatMessages([
                            ...chatMessages,
                            {
                                id: newIdString,
                                sender: 'You',
                                content: textAreaValue,
                                timestamp: 'Just now',
                            },
                        ])
                    }}
                />
            </Sheet>

            <ul>
                {messages.map(msg => (
                    <li key={msg.id}>
                        <ChatMessage
                            msg={msg}
                            isIncoming={companion.id === msg.msg_from}
                        />
                    </li>
                ))}
            </ul>

            <form onSubmit={onFormSubmit}>
                <input
                    type='text'
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                />
                <button type='submit'>Send</button>
            </form>

            <UploadFile companion_id={companion_id} />
        </div>
    )
})
