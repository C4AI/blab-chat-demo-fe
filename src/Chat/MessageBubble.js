import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { Tooltip } from "@mui/material";
import i18n from "../i18n";
import QuotedMessage from "./QuotedMessage";
import { Message, MessageConditions } from "./data-structures";
import { Participant } from "../Lobby/data-structures";

/**
 * Display a timestamp on the bottom-right corner.
 */
function BottomRightTimestamp({ time }) {
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
BottomRightTimestamp.propTypes = {
  /** the time to display */
  time: PropTypes.instanceOf(Date).isRequired,
};

/**
 * Display a bubble with the contents of a message.
 */
export default function MessageBubble({
  message,
  participants,
  quotedMessage = null,
}) {
  const theme = useTheme();
  const received = message.condition === MessageConditions.RECEIVED;
  const s = {
    backgroundColor: received
      ? theme.palette.secondary.light
      : theme.palette.primary.dark,
    color: received ? "black" : "white",
  };

  return (
    <div data-msg-id={"msg_" + message.id} className="message-bubble" style={s}>
      {/* sender (only if it is someone else) */}
      {received && (
        <div className="message-sender">
          {participants[message.senderId].name}
        </div>
      )}

      {/* quoted message */}
      <QuotedMessage message={quotedMessage} participants={participants} />

      {/* message text */}
      {message.text && <div className="message-text">{message.text}</div>}

      {/* timestamp */}
      <BottomRightTimestamp time={message.time} />
    </div>
  );
}

MessageBubble.propTypes = {
  /** the message to be displayed */
  message: PropTypes.instanceOf(Message).isRequired,

  /** conversation participants (id -> Participant) */
  participants: PropTypes.objectOf(PropTypes.instanceOf(Participant).isRequired)
    .isRequired,

  /** the quoted message, if any */
  quotedMessage: PropTypes.instanceOf(Message),
};
