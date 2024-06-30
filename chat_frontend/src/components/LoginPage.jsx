import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom";

export function LoginPage() {

    const navigate = useNavigate();

    const [password, setPassword] = useState("")
    const [login, setLogin] = useState("")

    const onFormSubmit = async (e) => {
        e.preventDefault()
        console.log(password, login)
        try {
            const res = await axios.post("http://localhost:8000/chat/api-token-auth/", {
                username: login,
                password: password
            })
            localStorage.setItem("token", res.data.token)
            navigate("/chats_list/")
        } catch (e) {
            alert(e)
            alert()
        }
    }

    return (
        <div>
            qwqwefqwfe
            <form onSubmit={onFormSubmit}>
                <div>
                    <label htmlFor="login">Логин</label>
                    <input value={login} onChange={(e) => setLogin(e.target.value)} id="login" type="text" />
                </div>
                <div>
                    <label htmlFor="password">Пароль</label>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" />
                </div>
                <input type="submit" value="Submit" />
            </form>
        </div>
    )
}