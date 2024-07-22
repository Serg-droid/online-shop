import { useContext, useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatMessageEdit } from "./ChatMessageEdit";
import { StateContext } from "../../state";

export const ChatMessageWrapper = (props) => {
  
  const { authState } = useContext(StateContext)
  const [editable, setEditable] = useState(false)

  const setEdit = () => {
    if (authState.user_id !== props.msg.msg_from) return
    if (props.msg.deleted) return
    setEditable(true)
  }

  return (
    <div onClick={setEdit}>
      {editable ? <ChatMessageEdit {...props} denyEdit={() => setEditable(false)} /> : <ChatMessage {...props} />}
    </div>  
  );
};