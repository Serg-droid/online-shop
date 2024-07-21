import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { StateContext } from "../main";
import { observer } from "mobx-react-lite";
import { UploadFile } from "./UploadFile";

export const ChatPage = observer(() => {
  const { chatState, authState, socketState } = useContext(StateContext);
  const urlParams = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");

  const companion_id = urlParams["companion_id"];

  useEffect(() => {
    async function fetchChat() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/${companion_id}`,
          {
            headers: {
              Authorization: `Token ${authState.token}`,
            },
          }
        );
        // console.log(res.data.messages)
        chatState.messages = res.data.messages;
        chatState.companion = res.data.companion;
        setLoading(false);
      } catch (e) {
        if (e instanceof AxiosError && e.response.status === 404) {
          navigate("error_404");
        } else {
          console.error(e);
        }
      }
    }
    fetchChat();
  }, []);

  const onFormSubmit = (e) => {
    e.preventDefault();
    socketState.socket.emit("chat message", {
      data: messageText,
      token: authState.token,
      companion_id: companion_id,
    });
    setMessageText("");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const { companion, messages } = chatState;
  return (
    <div>
      <ul>
        {messages.map((msg) => (
          <li key={msg.publicated_at}>
            <div
              style={{
                textAlign: companion.id === msg.msg_from ? "left" : "right",
              }}
            >
              <div>{msg.text}</div>
              {msg.image && (
                <div>
                  <img width="100" height="100" src={`${import.meta.env.VITE_MASTER_SERVER_DOMAIN}${msg.image}`} alt="" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={onFormSubmit}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>

        <UploadFile companion_id={companion_id}/>
    </div>
  );
});
