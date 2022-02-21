import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import SendIcon from "@mui/icons-material/Send";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Trans } from "react-i18next";
import { Message, MessageConditions, MessageTypes } from "./data-structures";

/**
 * Display elements where the user can insert a message and send it.
 *
 * @type React.FC<MessageInputAreaPropTypes>
 */
const MessageInputArea = forwardRef(function ({ onSendMessage }, ref) {
  const textFieldRef = useRef(null);
  useImperativeHandle(ref, () => ({
    /** Focus the text field */
    focus() {
      textFieldRef.current.focus();
    },
  }));

  // text typed by the user
  const [typedText, setTypedText] = useState("");

  /** If there is a message (typed, attachment inserted, etc.),
   * store its data in a {@link Message} instance; otherwise,
   * return `null`.
   *
   * @return a {@link Message} with the data the user inserted,
   * or `null` if the fields are blank
   */
  function collectMessage() {
    const text = typedText.trim();
    if (!text) return null;
    return new Message(
      MessageTypes.TEXT,
      MessageConditions.SENDING,
      new Date(),
      uuidv4().replace(/-/g, ""),
      undefined,
      text
    );
  }

  /**
   * If there is a message (typed, attachment inserted, etc.),
   * collect its data in  a {@link Message} instance, call
   * the callback function and clear the fields.
   * @returns
   */
  function sendMessage() {
    const message = collectMessage();
    if (message === null) return;
    setTypedText("");
    onSendMessage(message);
  }

  return (
    <TextField
      inputRef={textFieldRef}
      value={typedText}
      fullWidth
      multiline
      minRows={4}
      label={<Trans i18nKey="typeMessage">Type a message</Trans>}
      variant="outlined"
      onChange={(e) => setTypedText(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          sendMessage(typedText.trim());
          e.preventDefault();
        }
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              disabled={!typedText.trim()}
              onClick={(e) => {
                sendMessage(typedText.trim());
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

const MessageInputAreaPropTypes = {
  /** called when a message is sent */
  onSendMessage: PropTypes.func.isRequired,
};
MessageInputArea.propTypes = MessageInputAreaPropTypes;

export default MessageInputArea;
