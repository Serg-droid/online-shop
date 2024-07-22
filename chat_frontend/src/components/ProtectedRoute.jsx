import { useEffect, useState, cloneElement, useContext, useCallback } from "react"
import { Navigate } from "react-router-dom";
import axios from "axios"
import { StateContext, checkAuth } from "../state";



async function _checkAuth() {
    return checkAuth()
}



export function AuthProtectedRoute({ children }) {
    const { authState } = useContext(StateContext)
    const [isAuthed, setIsAuthed] = useState(null)
    const [isPending, setIsPending] = useState(true)

    const [state, setState] = useState("state");

    const _checkAuth = useCallback(async () => {
        const isAuthed = await checkAuth()
        setIsAuthed(isAuthed)
    }, [state])

    useEffect(() => {
        _checkAuth()
    }, [_checkAuth])

    if (isAuthed == null) {
        return <p>LOADING...</p>
    }
    return (isAuthed && {...children}) || <Navigate to="/login"></Navigate>
}