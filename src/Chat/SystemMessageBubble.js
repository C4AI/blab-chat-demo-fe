import PropTypes from "prop-types";
import { Tooltip } from "@mui/material";
import Chip from "@mui/material/Chip";
import { Trans } from "react-i18next";
import i18n from "../i18n";
import { Message } from "./data-structures";
import { Participant } from "../Lobby/data-structures";

/**
 * Display a system message.
 */
export default function SystemMessageBubble({
  message,
  participants,
  myParticipantId,
}) {
  let text = "";
  const participantId = message.additionalMetadata["participant_id"];
  const name = participantId ? participants[participantId].name : null;
  const me =
    message.additionalMetadata &&
    message.additionalMetadata["participant_id"] === myParticipantId;

  switch (message["event"]) {
    case "participant-joined":
      text = (
        <Trans
          i18nKey={me ? "youJoinedConversation" : "joinedConversation"}
          name={name}
        >
          <strong>{{ name }}</strong> joined the conversation
        </Trans>
      );
      break;
    case "participant-left":
      text = (
        <Trans
          i18nKey={me ? "youLeftConversation" : "leftConversation"}
          name={name}
        >
          <strong>{{ name }}</strong> left the conversation
        </Trans>
      );
      break;
    case "conversation-created":
      text = <Trans i18nKey="createdConversation">Conversation created</Trans>;
      break;
    default:
      text = JSON.stringify(message);
  }

  const fullTimeStr = Intl.DateTimeFormat(i18n.language, {
    timeStyle: "medium",
    dateStyle: "long",
  }).format(new Date(message.time));

  return (
    <Tooltip title={fullTimeStr}>
      <Chip data-msg-id={"msg_" + message.id} label={text} />
    </Tooltip>
  );
}

SystemMessageBubble.propTypes = {
  /** the system message to display */
  message: PropTypes.instanceOf(Message).isRequired,

  /** conversation participants (id -> Participant) */
  participants: PropTypes.objectOf(PropTypes.instanceOf(Participant).isRequired)
    .isRequired,

  /** id of the current participant
   *  (used to display messages, e.g. "you left" rather than "Name left") */
  myParticipantId: PropTypes.string.isRequired,
};
