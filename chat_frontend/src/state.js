import { makeAutoObservable, runInAction } from "mobx";
import { createContext } from "react";
import axios from "axios"
import { io } from "socket.io-client"

class SocketState {
  socket = null;

  constructor() {
    makeAutoObservable(this);
  }

  connectSocket(token, user_id) {
    this.socket = io(import.meta.env.VITE_SOCKET_IO_DOMAIN, {
      withCredentials: true,
      query: {
        token,
        user_id,
      },
    });
  }

  setupHandlers(state) {
    this.socket.on("add message", (message) => {
      console.log("socket event: add message");
      runInAction(() => {
        state.chatState.messages.push(message);
      });
    });
  }
}

class AuthState {
  token = null;
  user_id = null;

  constructor() {
    makeAutoObservable(this);
  }
}

class ChatState {
  messages = [];
  companion = null;

  chats_list = [];

  constructor() {
    makeAutoObservable(this);
  }

  async getChat({ token, onError, companion_id }) {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/${companion_id}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      // console.log(res.data.messages)
      this.messages = res.data.messages;
      this.companion = res.data.companion;
    } catch (e) {
      onError(e)
    }
  }

  async sendMessage({ data, token, companion_id }) {
    const res = await axios.post(
      `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/send_message/`,
      {
        message: data,
        companion_id: companion_id,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
    runInAction(() => {
      this.messages.push(res.data);
    });
  }

  async sendMessageWithImage({formData, token, onUploadProgress}) {
    const res = await axios.post(
      `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/send_message/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${token}`
        },
        onUploadProgress
      }
    );
    runInAction(() => {
      this.messages.push(res.data);
    });
  }

  async alterMessage({ token, message_text, message_id }) {
    const res = await axios.put(
      `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/alter_message/`,
      {
        message_text,
        message_id,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
    const altered_message = res.data;
    runInAction(() => {
      const old_message = this.messages.find((msg) => msg.id === altered_message.id)
      Object.assign(old_message, altered_message)
    });
  }

  async deleteMessage({ message_id, token }) {
    const res = await axios.delete(
      `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/delete_message/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
        data: {
          message_id,
        },
      }
    );
    const deleted_message = res.data;
    runInAction(() => {
      const msg = this.messages.find((msg) => msg.id === deleted_message.id)
      Object.assign(msg, deleted_message)
    });
  }

  async loadChatsList(authState) {
    const res = await axios.get(
      `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/list/`,
      {
        headers: {
          Authorization: `Token ${authState.token}`,
        },
      }
    );
    console.log(res.data);
    runInAction(() => {
      this.chats_list = res.data;
    });
  }
}

export async function checkAuth() {
  if (state.authState.token) return true;
  const token = localStorage.getItem("token");
  if (token == null) {
    return false;
  }
  const res = await axios
    .get(`${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/is_authed/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .catch(() => {});
  if (res.data.ok == true) {
    const user_id = res.data.user_id;
    state.authState.token = token;
    state.authState.user_id = user_id;
    return true;
  } else {
    return false;
  }
}

export const state = {
  socketState: new SocketState(),
  chatState: new ChatState(),
  authState: new AuthState(),
};

export const StateContext = createContext({});
