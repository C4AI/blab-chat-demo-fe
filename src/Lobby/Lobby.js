import { Box, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useEffect, useRef, useState } from "react";
import ConversationList from "./ConversationList";
import { Trans } from "react-i18next";
import PropTypes from "prop-types";
import LobbyIO from "./io.js";
import BotSelector from "./BotSelector";

/** Display a chat lobby, with the existing conversations
 * and an option to create a new one. */
export default function Lobby({
  onJoinConversation,
  onCreateConversation,
  mode,
  bots,
}) {
  const [conversations, setConversations] = useState([]);

  const [selectedId, setSelectedId] = useState(null);
  const [newConversationName, setNewConversationName] = useState(null);

  const nicknameKey = "nickname";

  const [nickname, setNickname] = useState(localStorage.getItem(nicknameKey));

  const [selectedBots, setSelectedBots] = useState([]);

  const idForNewConversation = "NEW";

  const [isJoining, setIsJoining] = useState(false);

  const [availableBots, setAvailableBots] = useState(null);

  const ioRef = useRef(null);
  useEffect(() => {
    if (!ioRef.current) {
      ioRef.current = new LobbyIO();
      ioRef.current.getConversations(setConversations, console.log, 1000);
      ioRef.current.getBots(setAvailableBots, 1000);
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

  useEffect(() => {
    if (availableBots !== null && mode === "bots") {
      setSelectedBots(bots.filter((b) => bots.includes(b)));
      setNewConversationName(" ");
      setSelectedId(idForNewConversation);
      bots
        .filter((b) => !availableBots.includes(b))
        .forEach((b) => console.log(`ERROR: bot "${b}" is not available.`));
    }
  }, [availableBots, mode, bots]);

  const onFailEnteringConversation = (e) => {
    console.log(e);
    setIsJoining(false);
  };

  if (mode === "bots") {
    if (!bots.length) {
      console.log("ERROR: `mode` is 'bots', but `bots` is an empty array");
      return null;
    }
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
      {mode === "rooms" && (
        <ConversationList
          conversations={conversations}
          idForNewConversation={idForNewConversation}
          selectedId={selectedId}
          handleSelectionChange={setSelectedId}
          handleConversationNameChange={setNewConversationName}
        />
      )}
      {mode === "bots" && (
        <Typography className="welcome-message" align="center">
          <br />
          <br />
          <Trans i18nKey="welcomeMessage">Welcome!</Trans>
          <br />
          <br />
        </Typography>
      )}
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
      {mode === "rooms" && selectedId === idForNewConversation && (
        <div className="bot-selector-wrapper">
          <BotSelector
            bots={availableBots || []}
            onChangeSelection={setSelectedBots}
          />
        </div>
      )}

      <div className="join-chat-btn-wrapper">
        <Button
          className="join-chat-btn"
          variant="contained"
          onClick={() => {
            setIsJoining(true);
            if (selectedId === idForNewConversation) {
              io.createConversation(
                nickname,
                newConversationName,
                selectedBots,
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
            (selectedId === idForNewConversation && !newConversationName) ||
            !nickname ||
            isJoining
          }
        >
          {mode === "bots" ? (
            <Trans i18nKey="startConversation">Start conversation</Trans>
          ) : selectedId !== idForNewConversation ? (
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

  /** mode ("rooms" should be used for testing purposes, "bots"
   * otherwise)
   */
  mode: PropTypes.oneOf(["rooms", "bots"]).isRequired,

  /**
   * bots that should be automatically invited to the conversation
   * (only if `mode` == "bots")
   */
  bots: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};
