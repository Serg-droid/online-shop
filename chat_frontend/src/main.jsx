import React from 'react'
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root/>,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: "chats_list/",
        element: (
          <AuthProtectedRoute>
            <ChatsListPage/>
          </AuthProtectedRoute>
        ),
      },
      {
        path: "chat/:companion_id",
        element: (
          <AuthProtectedRoute>
            <ChatPage/>
          </AuthProtectedRoute>
        )
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
    <RouterProvider router={router} />
  </React.StrictMode>,
)
