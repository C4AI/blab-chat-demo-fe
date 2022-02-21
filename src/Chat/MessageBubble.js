import { useTheme } from "@emotion/react";
import { Tooltip } from "@mui/material";
import i18n from "../i18n";
import QuotedMessage from "./QuotedMessage";

function BubbleTimestamp({ time }) {
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
      {/* invisible element to make room for the timestamp if needed */}
      <div className="timestamp-invisible-space">{timeStr}</div>

      {/* visible timestamp (bottom-right corner) */}
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
      {/* sender (only if it is someone else) */}
      {origin === "received" && (
        <div className="message-sender">{message.senderName}</div>
      )}

      {/* quoted message */}
      {quotedMessage && <QuotedMessage message={quotedMessage} />}

      {/* message text */}
      {message.text && <div className="message-text">{message.text}</div>}

      {/* timestamp */}
      <BubbleTimestamp time={message.time} />
    </div>
  );
}

export default MessageBubble;
