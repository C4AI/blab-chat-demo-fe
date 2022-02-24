import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import SendIcon from "@mui/icons-material/Send";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { Trans } from "react-i18next";
import MicIcon from "@mui/icons-material/Mic";
import { Message, MessageConditions, MessageTypes } from "./data-structures";
import PermMediaIcon from "@mui/icons-material/PermMedia";
import AttachFileIcon from "@mui/icons-material/AttachFile";

/**
 * Display elements where the user can insert a message and send it.
 *
 * @type React.FC<MessageInputAreaPropTypes>
 */
const MessageInputArea = forwardRef(function (
  { onSendMessage, limits = {} },
  ref
) {
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

  const sendLbl = <Trans i18nKey="sendMessage">Send</Trans>;
  const insertMediaLbl = <Trans i18nKey="insertMedia">Insert media</Trans>;
  const insertFileLbl = <Trans i18nKey="insertAttachment">Insert file</Trans>;
  const insertVoiceLbl = <Trans i18nKey="recordVoice">Record voice</Trans>;

  const enableAudio = Boolean(limits.MAX_AUDIO_SIZE && limits.MAX_AUDIO_LENGTH);
  const enableVideo = Boolean(
    limits.MAX_VIDEO_SIZE &&
      limits.MAX_VIDEO_LENGTH &&
      limits.MAX_VIDEO_RESOLUTION
  );
  const enableImage = Boolean(
    limits.MAX_IMAGE_SIZE && limits.MAX_IMAGE_RESOLUTION
  );
  const enableMedia = Boolean(enableAudio || enableVideo || enableImage);
  const enableVoice = Boolean(
    limits.MAX_VOICE_LENGTH && limits.MAX_VOICE_LENGTH
  );
  const enableAttachment = Boolean(limits.MAX_ATTACHMENT_SIZE);

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
            <Stack>
              {enableMedia && (
                <Tooltip title={insertMediaLbl}>
                  <span>
                    <IconButton
                      aria-label={insertMediaLbl}
                      // disabled={}
                      // onClick={}
                      onMouseDown={(e) => e.preventDefault()} // don't lose focus
                    >
                      <PermMediaIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {enableAttachment && (
                <Tooltip title={insertFileLbl}>
                  <span>
                    <IconButton
                      aria-label={insertFileLbl}
                      // disabled={}
                      // onClick={}
                      onMouseDown={(e) => e.preventDefault()} // don't lose focus
                    >
                      <AttachFileIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Stack>
            {(typedText.trim() || !enableVoice) && (
              <Tooltip title={sendLbl}>
                <span>
                  <IconButton
                    aria-label={sendLbl}
                    disabled={!typedText.trim()}
                    onClick={(e) => sendMessage(typedText.trim())}
                    onMouseDown={(e) => e.preventDefault()} // don't lose focus
                  >
                    <SendIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {!typedText.trim() && enableVoice && (
              <Tooltip title={insertVoiceLbl}>
                <span>
                  <IconButton
                    aria-label={insertVoiceLbl}
                    // disabled={}
                    // onClick={}
                  >
                    <MicIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </InputAdornment>
        ),
      }}
    />
  );
});

const MessageInputAreaPropTypes = {
  /** called when a message is sent */
  onSendMessage: PropTypes.func.isRequired,

  /** chat limits */
  limits: PropTypes.object,
};
MessageInputArea.propTypes = MessageInputAreaPropTypes;

export default MessageInputArea;
