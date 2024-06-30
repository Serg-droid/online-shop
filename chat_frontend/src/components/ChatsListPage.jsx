import { useContext, useEffect, useState } from "react"
import { StateContext } from "../main"
import { Link } from "react-router-dom"

export function ChatsListPage() {
    const { chatState, authState } = useContext(StateContext)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        (async () => {
            await chatState.loadChatsList(authState)
            setLoading(false)
        })()
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            { chatState.chats_list.map(chat => (
                <Link key={chat.companion_id} to={`/chat/${chat.companion_id}`} style={{ display: "block" }}>
                    Chat with { chat.companion_username }
                </Link>
            )) }
        </div>
    )
}