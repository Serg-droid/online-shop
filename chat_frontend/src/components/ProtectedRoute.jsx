import { useEffect, useState, cloneElement, useContext } from "react"
import { Navigate } from "react-router-dom";
import axios from "axios"
import { StateContext } from "../main";


export function AuthProtectedRoute({ children }) {
    const { authState } = useContext(StateContext)
    const [isAuthed, setIsAuthed] = useState(null)

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
                authState.token = token
            } else {
                setIsAuthed(false)
            }
        }
        checkAuth()
    }, [])

    if (isAuthed == null) {
        return <p>LOADING...</p>
    }
    return (isAuthed && {...children}) || <Navigate to="/login"></Navigate>
}