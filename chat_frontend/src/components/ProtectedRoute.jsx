import { useEffect, useState, cloneElement } from "react"
import { Navigate } from "react-router-dom";
import axios from "axios"


export function AuthProtectedRoute({ children }) {
    const [isAuthed, setIsAuthed] = useState(null)
    const [token, setToken] = useState(null)

    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem("token")
            if (token == null) {
                setIsAuthed(false)
            }

            const res = await axios.get("http://localhost:8000/chat/is_authed/", {
                headers: {
                    "Authorization": `Token ${token}`
                }
            }).catch(() => {})
            if (res.data.ok == true) {
                setIsAuthed(true)
                setToken(token)
            } else {
                setIsAuthed(false)
            }
        }
        checkAuth()
    }, [])

    if (isAuthed == null) {
        return <p>LOADING...</p>
    }
    const clonedChildren = cloneElement(children, { token })
    return (isAuthed && {...clonedChildren}) || <Navigate to="/login"></Navigate>
}