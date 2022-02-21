import PropTypes from "prop-types";

import { IconButton } from "@mui/material";
import MessageBubble from "./MessageBubble";
import ReplyIcon from "@mui/icons-material/Reply";
import { Message, MessageTypes } from "./data-structures";
import SystemMessageBubble from "./SystemMessageBubble";

/**
 * Display a row correspondent to a message
 * (including blank space, quote button, etc.).
 */
export default function MessageRow({
  message,
  myParticipantId,
  handleQuote,
  quotedMessage = null,
}) {
  const origin =
    message.type === MessageTypes.SYSTEM
      ? "system"
      : myParticipantId && message.senderId === myParticipantId
      ? message.id
        ? "sent"
        : "sending"
      : "received";
  const replyBtn =
    message["type"] !== MessageTypes.SYSTEM ? (
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
      {message["type"] === MessageTypes.SYSTEM ? (
        <SystemMessageBubble
          message={message}
          myParticipantId={myParticipantId}
        />
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

MessageRow.propTypes = {
  /** the message to be displayed in this row */
  message: PropTypes.instanceOf(Message).isRequired,

  /** id of the current user (not necessarily the message sender)
   * (used to show messages with "you" if it's the same user)
   */
  myParticipantId: PropTypes.string,

  /** function to be called when the user chooses to
   * reply to this message
   */
  handleQuote: PropTypes.func,

  /** the message quoted by this message */
  quotedMessage: PropTypes.instanceOf(Message),
};
