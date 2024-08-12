import { useContext, useEffect } from "react"
import { useParams } from "react-router-dom"
import { StateContext } from "../../state"

export function Call() {



    const { user_id: callee_id } = useParams()

    useEffect(() => {
        
    }, [])

    return (
        <div>Call</div>
    )
}