import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function QuotedMessage({ message, handleRemoveQuote = null }) {
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

export default QuotedMessage;
