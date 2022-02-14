import { IconButton } from "@mui/material";
import MESSAGE_TYPES from "./io";
import MessageBubble from "./MessageBubble";
import SystemMessage from "./SystemMessage";
import ReplyIcon from "@mui/icons-material/Reply";

function MessageRow({
  message,
  myParticipantId,
  handleQuote,
  quotedMessage = null,
}) {
  const origin =
    message.type === MESSAGE_TYPES.SYSTEM
      ? "system"
      : myParticipantId && message.sender.id === myParticipantId
      ? message.id
        ? "sent"
        : "sending"
      : "received";
  const replyBtn =
    message["type"] !== MESSAGE_TYPES.SYSTEM ? (
      <div className="reply-btn">
        <IconButton size="small" onClick={(e) => handleQuote()}>
          <ReplyIcon fontSize="small" />
        </IconButton>
      </div>
    ) : null;
  return (
    <div
      className="message-row"
      data-msg-id={"msg_" + message.id}
      data-origin={origin}
    >
      <div className="before"></div>
      {replyBtn && origin !== "received" && replyBtn}
      {message["type"] === MESSAGE_TYPES.SYSTEM ? (
        <SystemMessage message={message} myParticipantId={myParticipantId} />
      ) : (
        <MessageBubble
          message={message}
          origin={origin}
          quotedMessage={quotedMessage}
        />
      )}
      {replyBtn && origin === "received" && replyBtn}
      <div className="after"></div>
    </div>
  );
}

export default MessageRow;
