import MESSAGE_TYPES from "./io";
import MessageBubble from "./MessageBubble";
import SystemMessage from "./SystemMessage";

function MessageRow({ message, myParticipantId }) {
  const origin =
    message.type === MESSAGE_TYPES.SYSTEM
      ? "system"
      : myParticipantId && message.sender.id === myParticipantId
      ? message.id
        ? "sent"
        : "sending"
      : "received";
  return (
    <div
      className="message-row"
      data-msg-id={"msg_" + message.id}
      data-origin={origin}
    >
      {message["type"] === MESSAGE_TYPES.SYSTEM ? (
        <SystemMessage message={message} myParticipantId={myParticipantId} />
      ) : (
        <MessageBubble message={message} origin={origin} />
      )}
    </div>
  );
}

export default MessageRow;
