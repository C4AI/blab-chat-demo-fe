import { Container, createTheme, ThemeProvider } from "@mui/material";
import { Suspense, useEffect, useState } from "react";

import "./App.css";
import Lobby from "./Lobby/Lobby";
import Chat from "./Chat/Chat";
import axios from "axios";

const theme = createTheme({
  palette: {
    primary: { main: "#1094ab" },
    secondary: { main: "#fcb421" },
  },
});

function App() {
  const conversationIdKey = "conversationId";

  const [conversationId, setConversationId] = useState(
    localStorage.getItem(conversationIdKey)
  );

  useEffect(() => {
    if (conversationId) localStorage.setItem(conversationIdKey, conversationId);
    else localStorage.removeItem(conversationIdKey);
  }, [conversationId]);

  function createConversation(nickname, conversationName) {
    axios
      .post("/api/chat/conversations/", {
        nickname: nickname,
        name: conversationName,
      })
      .then((r) => setConversationId(r.data.id))
      .catch((e) => console.log(e));
  }

  function joinConversation(nickname, conversationId) {
    axios
      .post("/api/chat/conversations/" + conversationId + "/join/", {
        nickname: nickname,
      })
      .then((r) => setConversationId(conversationId))
      .catch((e) => console.log(e));
  }

  return (
    <Suspense fallback="...">
      <ThemeProvider theme={theme}>
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
                onLeave={() => setConversationId(null)}
              />
            )
          ) : (
            <p>
              INVALID MODE. PLEASE SET THE ENVIRONMENT VALUE{" "}
              <code>REACT_APP_CHAT_MODE</code> TO <i>rooms</i> OR <i>bots</i>{" "}
              AND TRY AGAIN.
            </p>
          )}
          {process.env.NODE_ENV !== "production" ? (
            <div>
              <p>
                ENVIRONMENT: <b>{process.env.NODE_ENV}</b>
              </p>
              <p>
                MODE: <b>{process.env.REACT_APP_CHAT_MODE}</b>
              </p>
            </div>
          ) : (
            ""
          )}
        </Container>
      </ThemeProvider>
    </Suspense>
  );
}

export default App;
