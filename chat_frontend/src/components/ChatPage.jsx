import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios, { AxiosError } from "axios"

export function ChatPage({ token }) {
    const urlParams = useParams()
    const navigate = useNavigate()
    const [chatData, setChatData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchChat() {
            const companion_id = urlParams["companion_id"]
            try {
                const res = await axios.get(`http://localhost:8000/chat/${companion_id}`, {
                    headers: {
                        "Authorization": `Token ${token}`
                    }
                })
                setChatData(res.data)
                setLoading(false)
            } catch (e) {
                if (e instanceof AxiosError && e.response.status === 404) {
                    navigate("error_404")
                }
            }
        }
        fetchChat()
    }, [])

    if (loading) {
        return <p>Loading...</p>
    }

    if (chatData == null) {
        return <div>No chat data</div>
    }

    const { companion, messages } = chatData
    return (    
        <div>
            <ul>
                {messages.map(msg => (
                    <li key={msg.publicated_at}>
                        <div style={{textAlign: companion.id === msg.msg_from ? "left" : "right"}}>
                            { msg.text }
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}