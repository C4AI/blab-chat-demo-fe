import { Container, createTheme, ThemeProvider } from "@mui/material";
import { Suspense, useEffect, useState } from "react";

import "./App.css";
import Lobby from "./Lobby/Lobby";
import Chat from "./Chat/Chat";
import axios from "axios";

import { useTranslation } from "react-i18next";

const theme = createTheme({
  palette: {
    primary: { main: "#1094ab" },
    secondary: { main: "#fcb421" },
  },
});

function Main() {
  const { i18n } = useTranslation();

  const conversationIdKey = "conversationId";
  const myParticipantIdKey = "myParticipantId";
  const conversationNameKey = "conversationName";

  const [conversationId, setConversationId] = useState(
    localStorage.getItem(conversationIdKey)
  );

  const [myParticipantId, setMyParticipantId] = useState(
    localStorage.getItem(myParticipantIdKey)
  );

  const [conversationName, setConversationName] = useState(
    localStorage.getItem(conversationNameKey)
  );

  useEffect(() => {
    if (conversationId) localStorage.setItem(conversationIdKey, conversationId);
    else localStorage.removeItem(conversationIdKey);
  }, [conversationId]);

  useEffect(() => {
    if (conversationName)
      localStorage.setItem(conversationNameKey, conversationName);
    else localStorage.removeItem(conversationNameKey);
  }, [conversationName]);

  useEffect(() => {
    if (myParticipantId)
      localStorage.setItem(myParticipantIdKey, myParticipantId);
    else localStorage.removeItem(myParticipantIdKey);
  }, [myParticipantId]);

  function createConversation(nickname, conversationName) {
    axios
      .post("/api/chat/conversations/", {
        nickname: nickname,
        name: conversationName,
      })
      .then((r) => {
        setConversationName(r.data.conversation.name);
        setMyParticipantId(r.data.my_participant_id);
        setConversationId(r.data.conversation.id);
      })
      .catch((e) => console.log(e));
  }

  function joinConversation(nickname, conversationId) {
    axios
      .post("/api/chat/conversations/" + conversationId + "/join/", {
        nickname: nickname,
      })
      .then((r) => {
        setMyParticipantId(r.data.my_participant_id);
        setConversationName(r.data.conversation.name);
        setConversationId(r.data.conversation.id);
      })
      .catch((e) => console.log(e));
  }

  return (
    <Container component="main" maxWidth="xs">
      {process.env.REACT_APP_CHAT_MODE === "rooms" ? (
        !conversationId ? (
          <Lobby
            handleRoomCreation={createConversation}
            handleJoining={joinConversation}
          />
        ) : (
          <Chat
            conversationId={conversationId}
            myParticipantId={myParticipantId}
            initialConversationName={conversationName}
            onLeave={() => {
              setConversationId(null);
              setMyParticipantId(null);
            }}
          />
        )
      ) : (
        <p>
          INVALID MODE. PLEASE SET THE ENVIRONMENT VALUE{" "}
          <code>REACT_APP_CHAT_MODE</code> TO <i>rooms</i> OR <i>bots</i> AND
          TRY AGAIN.
        </p>
      )}
      {process.env.NODE_ENV === "development" && (
        <div>
          <p>
            ENVIRONMENT: <b>{process.env.NODE_ENV}</b>
          </p>
          <p>
            MODE: <b>{process.env.REACT_APP_CHAT_MODE}</b>
          </p>
          <p>
            LANGUAGE: <b>{i18n.language}</b> (
            {i18n.languages ? i18n.languages.join(", ") : "?"}) &rarr;{" "}
            {i18n.resolvedLanguage}
          </p>
        </div>
      )}
    </Container>
  );
}

function App() {
  return (
    <Suspense fallback={<div>Loading... </div>}>
      <ThemeProvider theme={theme}>
        <Main />
      </ThemeProvider>
    </Suspense>
  );
}

export default App;
