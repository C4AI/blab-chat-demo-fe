import { IconButton } from "@mui/material";
import MessageBubble from "./MessageBubble";
import SystemMessage from "./SystemMessage";
import ReplyIcon from "@mui/icons-material/Reply";
import MessageIO from "./io";

function MessageRow({
  message,
  myParticipantId,
  handleQuote,
  quotedMessage = null,
}) {
  const origin =
    message.type === MessageIO.MessageTypes.SYSTEM
      ? "system"
      : myParticipantId && message.sender.id === myParticipantId
      ? message.id
        ? "sent"
        : "sending"
      : "received";
  const replyBtn =
    message["type"] !== MessageIO.MessageTypes.SYSTEM ? (
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
      {message["type"] === MessageIO.MessageTypes.SYSTEM ? (
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
