import PropTypes from "prop-types";

import { IconButton } from "@mui/material";
import MessageBubble from "./MessageBubble";
import ReplyIcon from "@mui/icons-material/Reply";
import { Message, MessageConditions, MessageTypes } from "./data-structures";
import SystemMessageBubble from "./SystemMessageBubble";
import { Participant } from "../Lobby/data-structures";

/**
 * Display a row correspondent to a message
 * (including blank space, quote button, etc.).
 */
export default function MessageRow({
  message,
  myParticipantId,
  participants,
  handleQuote,
  quotedMessage = null,
}) {
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
      data-origin={message.condition}
    >
      <div className="before"></div>
      {replyBtn && message.condition !== MessageConditions.RECEIVED && replyBtn}
      {message["type"] === MessageTypes.SYSTEM ? (
        <SystemMessageBubble
          message={message}
          myParticipantId={myParticipantId}
        />
      ) : (
        <MessageBubble
          message={message}
          participants={participants}
          quotedMessage={quotedMessage}
        />
      )}
      {replyBtn && message.condition === MessageConditions.RECEIVED && replyBtn}
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

  /** conversation participants (id -> Participant) */
  participants: PropTypes.objectOf(PropTypes.instanceOf(Participant).isRequired)
    .isRequired,

  /** function to be called when the user chooses to
   * reply to this message
   */
  handleQuote: PropTypes.func,

  /** the message quoted by this message */
  quotedMessage: PropTypes.instanceOf(Message),
};
