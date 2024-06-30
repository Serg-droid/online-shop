import React, { createContext } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Root } from './components/Root.jsx'
import { ErrorPage } from './components/ErrorPage.jsx'
import { ChatsListPage } from './components/ChatsListPage.jsx'
import { LoginPage } from './components/LoginPage.jsx'
import { ChatPage } from './components/ChatPage.jsx'
import { AuthProtectedRoute } from './components/ProtectedRoute.jsx'
import App from './App.jsx'
import { Page404 } from './components/Page404.jsx'
import { io } from "socket.io-client"
import { makeAutoObservable, runInAction } from "mobx"
import axios from "axios"

class SocketState {
  socket = null

  constructor() {
    makeAutoObservable(this)
  }

  connectSocket(token, user_id) {
    this.socket = io(import.meta.env.VITE_SOCKET_IO_DOMAIN, {
      withCredentials: true,
      query: {
        token,
        user_id
      }
    })
  }

  setupHandlers(state) {
    this.socket.on("add message", (message) => {
      console.log("afiuabf")
      runInAction(() => {
        state.chatState.messages.push(message)
      })
    })
  }
}

class AuthState {
  token = null
  user_id = null

  constructor() {
    makeAutoObservable(this)
  }
}

class ChatState {
  messages = []
  companion = null

  chats_list = []

  constructor() {
    makeAutoObservable(this)
  }

  async loadChatsList(authState) {
    const res = await axios.get(`${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/list/`, {
      headers: {
          "Authorization": `Token ${authState.token}`
      }
    })
    console.log(res.data)
    runInAction(() => {
      this.chats_list = res.data
    })
  }
}


const state = {
  socketState: new SocketState(),
  chatState: new ChatState(),
  authState: new AuthState()
}


export async function checkAuth() {
  if (state.authState.token) return true
  const token = localStorage.getItem("token")
  if (token == null) {
      return false
  }
  const res = await axios.get(`${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/is_authed/`, {
      headers: {
          "Authorization": `Token ${token}`
      }
  }).catch(() => {})
  if (res.data.ok == true) {
      const user_id = res.data.user_id
      state.authState.token = token
      state.authState.user_id = user_id
      return true
  } else {
      return false
  }
}

async function init() {
  const isAuthed = await checkAuth()
  if (!isAuthed) return
  const { token, user_id } = state.authState
  state.socketState.connectSocket(token, user_id)
  state.socketState.setupHandlers(state)
  try {

  } catch(e) {
    console.error(e)
  }
}

try {
  await init()
} catch (e) {
  console.error(e)
}


export const StateContext = createContext({})


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProtectedRoute>
        <Root />
      </AuthProtectedRoute>
    ),
    errorElement: <ErrorPage/>,
    children: [
      {
        path: "chats_list/",
        element: <ChatsListPage />,
      },
      {
        path: "chat/:companion_id",
        element: <ChatPage />
      },
      {
        path: "app/",
        element: <App />
      },
    ]
  },
  {
    path: "login/",
    element: <LoginPage/>
  },
  {
    path: "*",
    element: <Page404/>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StateContext.Provider value={state}>
      <RouterProvider router={router} />
    </StateContext.Provider>
  </React.StrictMode>,
)
