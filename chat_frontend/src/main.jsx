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
import { io } from 'socket.io-client'
import { makeAutoObservable, runInAction } from 'mobx'
import axios from 'axios'
import { checkAuth, state, StateContext } from './state.js'
import { StyledEngineProvider } from '@mui/joy'

async function init() {
    const isAuthed = await checkAuth()
    if (!isAuthed) return
    const { token, user_id } = state.authState
    state.socketState.connectSocket(token, user_id)
    state.socketState.setupHandlers(state)
    try {
    } catch (e) {
        console.error(e)
    }
}

try {
    await init()
} catch (e) {
    console.error(e)
}

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <AuthProtectedRoute>
                <StyledEngineProvider injectFirst>
                    <Root />
                </StyledEngineProvider>
            </AuthProtectedRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                path: 'chats_list/',
                element: <ChatsListPage />,
            },
            {
                path: 'chat/:companion_id/:token?',
                element: <ChatPage />,
            },
            {
                path: 'app/',
                element: <App />,
            },
        ],
    },
    {
        path: 'login/',
        element: <LoginPage />,
    },
    {
        path: '*',
        element: <Page404 />,
    },
])

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <StateContext.Provider value={state}>
            <RouterProvider router={router} />
        </StateContext.Provider>
    </React.StrictMode>,
)
