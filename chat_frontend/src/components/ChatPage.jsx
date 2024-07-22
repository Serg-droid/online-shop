import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { StateContext } from "../state";
import { observer } from "mobx-react-lite";
import { UploadFile } from "./UploadFile";
import { ChatMessage } from "./ChatMessage";

export const ChatPage = observer(() => {
  const { chatState, authState, socketState } = useContext(StateContext);
  const urlParams = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");

  const companion_id = urlParams["companion_id"];

  useEffect(() => {
    (async () => {
      await chatState.getChat({
        token: authState.token,
        companion_id,
        onError: (e) => {
          if (e instanceof AxiosError && e.response.status === 404) {
            navigate("error_404");
          } else {
            console.error(e);
          }
        },
      })
      setLoading(false)
    })()
  }, []);

  const onFormSubmit = (e) => {
    e.preventDefault();
    chatState.sendMessage({
      data: messageText,
      token: authState.token,
      companion_id: companion_id,
    })
    // socketState.socket.emit("chat message", {
    //   data: messageText,
    //   token: authState.token,
    //   companion_id: companion_id,
    // });
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
          <li key={msg.id}>
            <ChatMessage msg={msg} isIncoming={companion.id === msg.msg_from}/>
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
