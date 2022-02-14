import { useTheme } from "@emotion/react";
import { Tooltip } from "@mui/material";
import i18n from "../i18n";
import QuotedMessage from "./QuotedMessage";

export function BubbleTimestamp({ time }) {
  const t = new Date(time);
  const timeStr = Intl.DateTimeFormat(i18n.language, {
    timeStyle: "short",
  }).format(t);
  const fullTimeStr = Intl.DateTimeFormat(i18n.language, {
    timeStyle: "medium",
    dateStyle: "long",
  }).format(t);
  return (
    <div className="timestamp">
      <div className="timestamp-invisible-space">{timeStr}</div>
      <Tooltip title={fullTimeStr}>
        <div className="timestamp-visible">{timeStr}</div>
      </Tooltip>
    </div>
  );
}

function MessageBubble({ message, origin, quotedMessage = null }) {
  const theme = useTheme();
  const s = {
    backgroundColor:
      origin === "received"
        ? theme.palette.secondary.light
        : theme.palette.primary.dark,
    color: origin === "received" ? "black" : "white",
  };

  return (
    <div data-msg-id={"msg_" + message.id} className="message-bubble" style={s}>
      {origin === "received" ? (
        <div className="message-sender">{message.sender.name}</div>
      ) : (
        ""
      )}

      {quotedMessage ? <QuotedMessage message={quotedMessage} /> : ""}

      {message.text ? <div className="message-text">{message.text}</div> : ""}
      <BubbleTimestamp time={message.time} />
    </div>
  );
}

export default MessageBubble;
