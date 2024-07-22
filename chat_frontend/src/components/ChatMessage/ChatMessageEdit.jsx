import { useContext, useState } from "react";
import { StateContext } from "../../state";

export const ChatMessageEdit = ({ msg, isIncoming, denyEdit }) => {

    const {chatState, authState} = useContext(StateContext)

    const [value, setValue] = useState(msg.text)

    const onInputChange = async (e) => {
        setValue(e.target.value)
    }

    const applyChanges = async () => {
      await chatState.alterMessage({
        token: authState.token,
        message_text: value,
        message_id: msg.id
      })
      denyEdit()
    }

    const deleteMessage = async () => {
      await chatState.deleteMessage({
        token: authState.token,
        message_id: msg.id
      })
      denyEdit()
    }

    return (
      <div
        style={{
          padding: "10px 5px 5px 10px",
          margin: "5px 0px",
          textAlign: isIncoming ? "left" : "right",
          backgroundColor: isIncoming ? "gray" : "#458745"
        }}
      >
        <input value={value} onChange={onInputChange} />
        <button onClick={applyChanges}>✓</button>
        <button onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            denyEdit()
        }}>X</button>
        <button style={{ backgroundColor: "red" }} onClick={deleteMessage}>Delete</button>
        {msg.image && (
          <div>
            <img
              width="100"
              height="100"
              src={`${import.meta.env.VITE_MASTER_SERVER_DOMAIN}${msg.image}`}
              alt=""
            />
          </div>
        )}
      </div>
    );
  };