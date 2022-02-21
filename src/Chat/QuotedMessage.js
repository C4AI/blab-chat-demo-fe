import PropTypes from "prop-types";

import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Message } from "./data-structures";

/**
 * Display a quoted message.
 */
export default function QuotedMessage({ message, handleRemoveQuote = null }) {
  if (!message) return null;
  return (
    <div className="quoted-message">
      {/* vertical bar on the left */}
      <div className="left-quote"></div>

      <div data-msg-id={"msg_" + message.id} className="main-quote">
        {/* sender */}
        <div className="message-sender">{message.senderName}</div>

        {/* message contents */}
        {message.text && <div className="message-text">{message.text}</div>}
      </div>

      {/* "x" button */}
      {handleRemoveQuote && (
        <IconButton className="close" onClick={(e) => handleRemoveQuote()}>
          <CloseIcon />
        </IconButton>
      )}
    </div>
  );
}

QuotedMessage.propTypes = {
  /** the quoted message to be displayed (if absent, nothing is rendered) */
  message: PropTypes.instanceOf(Message),

  /** function to be called when the user removes the quote by clicking "x"
   * (if the function is not present, the "x" button is not shown)
   */
  handleRemoveQuote: PropTypes.func,
};
