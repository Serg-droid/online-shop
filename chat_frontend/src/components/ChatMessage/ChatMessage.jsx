import { observer } from "mobx-react-lite";

export const ChatMessage = observer(({ msg, isIncoming }) => {

  return (
    <div
      style={{
        padding: "10px 5px 5px 10px",
        margin: "5px 0px",
        textAlign: isIncoming ? "left" : "right",
        backgroundColor: isIncoming ? "gray" : "#458745"
      }}
    >
      <div>{msg.text}</div>
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
});
