import { Box, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import { useEffect, useRef, useState } from "react";
import ConversationList from "./ConversationList";
import { Trans } from "react-i18next";
import PropTypes from "prop-types";
import LobbyIO from "./io.js";

/** Display a chat lobby, with the existing conversations
 * and an option to create a new one. */
export default function Lobby({ onJoinConversation, onCreateConversation }) {
  const [conversations, setConversations] = useState([]);

  const [selectedId, setSelectedId] = useState(null);
  const [newConversationName, setNewConversationName] = useState(null);

  const nicknameKey = "nickname";

  const [nickname, setNickname] = useState(localStorage.getItem(nicknameKey));

  const idForNewConversation = "NEW";

  const [isJoining, setIsJoining] = useState(false);

  const ioRef = useRef(null);
  useEffect(() => {
    if (!ioRef.current) {
      ioRef.current = new LobbyIO();
      ioRef.current.getConversations(setConversations, console.log, 1000);
    }
    const s = ioRef.current;

    return () => {
      s && s.close();
    };
  }, []);
  const io = ioRef.current;

  useEffect(() => {
    if (nickname) localStorage.setItem(nicknameKey, nickname);
    else localStorage.removeItem(nicknameKey);
  }, [nickname]);

  const onFailEnteringConversation = (e) => {
    console.log(e);
    setIsJoining(false);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
      <ConversationList
        conversations={conversations}
        idForNewConversation={idForNewConversation}
        selectedId={selectedId}
        handleSelectionChange={setSelectedId}
        handleConversationNameChange={setNewConversationName}
      />

      <TextField
        required
        id="name"
        className="user-name-field"
        label={<Trans i18nKey="yourName">Your name</Trans>}
        name="user_name"
        variant="outlined"
        value={nickname || ""}
        onChange={(e) => setNickname(e.target.value)}
      />

      <div class="join-chat-btn-wrapper">
        <Button
          className="join-chat-btn"
          variant="contained"
          onClick={() => {
            setIsJoining(true);
            if (selectedId === idForNewConversation) {
              io.createConversation(
                nickname,
                newConversationName,
                onCreateConversation,
                onFailEnteringConversation
              );
            } else {
              io.joinConversation(
                nickname,
                selectedId,
                onJoinConversation,
                onFailEnteringConversation
              );
            }
          }}
          disabled={
            !selectedId ||
            (selectedId === "NEW" && !newConversationName) ||
            !nickname ||
            isJoining
          }
        >
          {selectedId !== idForNewConversation ? (
            <Trans i18nKey="joinConversation">Join conversation</Trans>
          ) : (
            <Trans i18nKey="createConversation">Create conversation</Trans>
          )}
        </Button>
      </div>
    </Box>
  );
}

Lobby.propTypes = {
  /** function to be called when the user joins a conversation
   * (it is called with two arguments: the participant's nickname
   * and the conversation id)
   */
  onJoinConversation: PropTypes.func.isRequired,

  /** function to be called when the user creates a conversation
   * (it is called with two arguments: the participant's nickname
   * and the conversation name)
   */
  onCreateConversation: PropTypes.func.isRequired,
};
