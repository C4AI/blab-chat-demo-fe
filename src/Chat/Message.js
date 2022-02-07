import { useTheme } from "@emotion/react";
import { Tooltip } from "@mui/material";
import Chip from "@mui/material/Chip";
import { Trans } from "react-i18next";

const MESSAGE_TYPES = {
  TEXT: "T",
  MEDIA: "M",
  VOICE: "V",
  ATTACHMENT: "A",
  SYSTEM: "S",
};

function MessageRow({ message, myParticipantId }) {
  const origin =
    message.type === "S"
      ? "system"
      : myParticipantId && message.sender.id === myParticipantId
      ? message.id
        ? "sent"
        : "sending"
      : "received";
  return (
    <div
      className="message-row"
      data-msg-id={"msg_" + message.id}
      data-origin={origin}
    >
      {message["type"] === MESSAGE_TYPES.SYSTEM ? (
        <SystemMessage message={message} myParticipantId={myParticipantId} />
      ) : (
        <MessageBubble message={message} origin={origin} />
      )}
    </div>
  );
}

const getLanguage = () =>
  localStorage.getItem("i18nextLng") || navigator.language;

function SystemMessage({ message, myParticipantId }) {
  let text = "";
  const name = message["data"]["participant_name"];
  const me =
    message["data"] && message["data"]["participant_id"] === myParticipantId;

  switch (message["event"]) {
    case "participant-joined":
      text = (
        <Trans
          i18nKey={me ? "youJoinedConversation" : "joinedConversation"}
          name={name}
        >
          <em>{{ name }}</em> joined the conversation.
        </Trans>
      );
      break;
    case "participant-left":
      text = (
        <Trans
          i18nKey={me ? "youLeftConversation" : "leftConversation"}
          name={name}
        >
          <em>{{ name }}</em> left the conversation.
        </Trans>
      );
      break;
    case "conversation-created":
      text = <Trans i18nKey="createdConversation">Conversation created</Trans>;
      break;
    default:
      text = JSON.stringify(message);
  }

  const fullTimeStr = Intl.DateTimeFormat(getLanguage(), {
    timeStyle: "medium",
    dateStyle: "long",
  }).format(new Date(message.time));

  return (
    <Tooltip title={fullTimeStr}>
      <Chip data-msg-id={"msg_" + message.id} label={text} />
    </Tooltip>
  );
}

function BubbleTimestamp({ time }) {
  const t = new Date(time);
  const timeStr = Intl.DateTimeFormat(getLanguage(), {
    timeStyle: "short",
  }).format(t);
  const fullTimeStr = Intl.DateTimeFormat(getLanguage(), {
    timeStyle: "medium",
    dateStyle: "long",
  }).format(t);
  return (
    <div className="timestamp">
      <div className="timestamp-invisible-space">{timeStr}</div>
      <Tooltip title={fullTimeStr}>
        <div className="timestamp-visible">{timeStr}</div>
      </Tooltip>
    </div>
  );
}

function MessageBubble({ message, origin }) {
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
      {origin === "received" ? (
        <div className="message-sender" style={{ color: "black" }}>
          {message.sender.name}
        </div>
      ) : (
        ""
      )}
      <div className="message-text">{message.text}</div>
      <BubbleTimestamp time={message.time} />
    </div>
  );
}

export default MessageRow;
