import { Box, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import ConversationList from "./ConversationList";
import axios from "axios";
import { Trans } from "react-i18next";

function Lobby({ handleJoining, handleRoomCreation }) {
  const [conversations, setConversations] = useState([]);

  const [selectedId, setSelectedId] = useState(null);
  const [newConversationName, setNewConversationName] = useState(null);

  const nicknameKey = "nickname";

  const [nickname, setNickname] = useState(localStorage.getItem(nicknameKey));

  const idForNewConversation = "NEW";

  const refreshConversations = () => {
    axios
      .get("/api/chat/conversations")
      .then((r) => setConversations(r.data.results))
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    refreshConversations();
    const interval = setInterval(refreshConversations, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (nickname) localStorage.setItem(nicknameKey, nickname);
    else localStorage.removeItem(nicknameKey);
  }, [nickname]);

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

      <Button
        className="join-chat-btn"
        variant="contained"
        onClick={() =>
          selectedId === idForNewConversation
            ? handleRoomCreation(nickname, newConversationName)
            : handleJoining(nickname, selectedId)
        }
        disabled={
          !selectedId ||
          (selectedId === "NEW" && !newConversationName) ||
          !nickname
        }
      >
        {selectedId !== idForNewConversation ? (
          <Trans i18nKey="joinConversation">Join conversation</Trans>
        ) : (
          <Trans i18nKey="createConversation">Create conversation</Trans>
        )}
      </Button>
    </Box>
  );
}

export default Lobby;
