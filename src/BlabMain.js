import { Container } from "@mui/material";
import { useEffect, useState } from "react";

import Lobby from "./Lobby/Lobby";
import Chat from "./Chat/Chat";

import { useTranslation } from "react-i18next";
import LobbyIO from "./Lobby/io";

/**
 * Display the BLAB chatbot component.
 */
export default function BlabMain() {
  const { i18n } = useTranslation();

  const conversationIdKey = "conversationId";
  const myParticipantIdKey = "myParticipantId";

  const [conversationId, setConversationId] = useState(
    localStorage.getItem(conversationIdKey)
  );

  const [myParticipantId, setMyParticipantId] = useState(
    localStorage.getItem(myParticipantIdKey)
  );

  const [conversation, setConversation] = useState(null);

  useEffect(() => {
    if (conversationId) localStorage.setItem(conversationIdKey, conversationId);
    else localStorage.removeItem(conversationIdKey);
  }, [conversationId]);

  useEffect(() => {
    if (myParticipantId)
      localStorage.setItem(myParticipantIdKey, myParticipantId);
    else localStorage.removeItem(myParticipantIdKey);
  }, [myParticipantId]);

  function enterConversation(conversation) {
    setMyParticipantId(conversation.myParticipantId);
    setConversation(conversation);
    setConversationId(conversation.id);
  }

  function onLeave() {
    setConversationId(null);
    setConversation(null);
    setMyParticipantId(null);
  }

  const mode = process.env.REACT_APP_CHAT_MODE;
  const bots = JSON.parse(process.env.REACT_APP_CHAT_BOTS || "[]");

  useEffect(() => {
    if (conversationId && !conversation) {
      new LobbyIO().joinConversation(
        "",
        conversationId,
        enterConversation,
        onLeave
      );
    }
  }, [conversationId, conversation]);

  if (process.env.NODE_ENV === "development")
    console.log({
      environment: process.env.NODE_ENV,
      mode: process.env.REACT_APP_CHAT_MODE,
      language: i18n.language,
      languages: i18n.languages,
      resolvedLanguage: i18n.resolvedLanguage,
    });

  return (
    <Container component="main" maxWidth="xs">
      {["rooms", "bots"].includes(mode) ? (
        !conversation ? (
          !conversationId ? (
            <Lobby
              onCreateConversation={enterConversation}
              onJoinConversation={enterConversation}
              mode={mode}
              bots={bots}
            />
          ) : (
            <div>
              {/* this is rendered when the user was 
              previously in a conversation, but the
              conversation data hasn't been loaded yet */}
            </div>
          )
        ) : (
          <Chat conversation={conversation} onLeave={onLeave} />
        )
      ) : (
        <p>
          INVALID MODE. PLEASE SET THE ENVIRONMENT VALUE{" "}
          <code>REACT_APP_CHAT_MODE</code> TO <i>rooms</i> OR <i>bots</i> AND
          TRY AGAIN.
        </p>
      )}
    </Container>
  );
}

BlabMain.propTypes = {};
