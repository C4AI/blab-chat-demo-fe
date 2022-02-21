import MessageIO from "./io";
import { v4 as uuidv4 } from "uuid";
import SendIcon from "@mui/icons-material/Send";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Trans } from "react-i18next";

const MessageInputArea = forwardRef(function ({ onSendMessage }, ref) {
  const textFieldRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus() {
      textFieldRef.current.focus();
    },
  }));

  const [typedMessage, setTypedMessage] = useState("");

  function collectMessage() {
    const t = new Date();
    const text = typedMessage.trim();
    if (!text) return;
    const message = {
      type: MessageIO.MessageTypes.TEXT,
      text: text,

      local_id: uuidv4().replace(/-/g, ""),
      time: t,
      timestamp: t.toISOString(),
    };
    return message;
  }

  function sendMessage() {
    const message = collectMessage();
    if (message === null) return;
    setTypedMessage("");
    onSendMessage(message);
  }

  return (
    <TextField
      inputRef={textFieldRef}
      value={typedMessage}
      fullWidth
      multiline
      minRows={4}
      label={<Trans i18nKey="typeMessage">Type a message</Trans>}
      variant="outlined"
      onChange={(e) => setTypedMessage(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          sendMessage(typedMessage.trim());
          e.preventDefault();
        }
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              disabled={!typedMessage.trim()}
              onClick={(e) => {
                sendMessage(typedMessage.trim());
              }}
              onMouseDown={(e) => e.preventDefault()} // don't lose focus
            >
              <SendIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
});

export default MessageInputArea;
