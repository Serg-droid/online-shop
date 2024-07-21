import { useEffect } from 'react'
import './App.css'
import axios from "axios"

function App() {
  useEffect(() => {
    async function fetchData() {
      const res = await axios.post("http://localhost:8000/chat/api-token-auth/", {
        username: "admin",
        password: "admin"
      })
      localStorage.setItem("token", res.data.token)
    }
    fetchData()
  }, [])

  return (
    <>
      <h1>Chat</h1>
    </>
  )
}

export default App
