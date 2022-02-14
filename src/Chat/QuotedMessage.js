import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function QuotedMessage({ message, handleRemoveQuote = null }) {
  return (
    <div className="quoted-message">
      <div className="left-quote"></div>
      <div data-msg-id={"msg_" + message.id} className="main-quote">
        <div className="message-sender" style={{ color: "black" }}>
          {message.sender.name}
        </div>

        {message.text ? <div className="message-text">{message.text}</div> : ""}
      </div>
      {handleRemoveQuote ? (
        <IconButton className="close" onClick={(e) => handleRemoveQuote()}>
          <CloseIcon />
        </IconButton>
      ) : (
        ""
      )}
    </div>
  );
}

export default QuotedMessage;
