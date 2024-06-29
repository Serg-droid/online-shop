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

class SocketState {
  socket = io("http://localhost:3000", {
    withCredentials: true
  })

  constructor() {
    makeAutoObservable(this)
  }


}

class AuthState {
  token = null

  constructor() {
    makeAutoObservable(this)
  }
}

class ChatState {
  messages = []
  companion = null

  constructor() {
    makeAutoObservable(this)
  }
}


const state = {
  socketState: new SocketState(),
  chatState: new ChatState(),
  authState: new AuthState()
}

state.socketState.socket.on("add message", (message) => {
  runInAction(() => {
    state.chatState.messages.push(message)
  })
})


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
        path: "login/",
        element: <LoginPage/>
      },
      {
        path: "app/",
        element: <App />
      },
    ]
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
