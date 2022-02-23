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

  useEffect(() => {
    if (conversationId && !conversation) {
      new LobbyIO().joinConversation("", conversationId, enterConversation);
    }
  }, [conversationId, conversation]);

  return (
    <Container component="main" maxWidth="xs">
      {process.env.REACT_APP_CHAT_MODE === "rooms" ? (
        !conversation ? (
          !conversationId ? (
            <Lobby
              onCreateConversation={enterConversation}
              onJoinConversation={enterConversation}
            />
          ) : (
            <div>
              {/* this is rendered when the user was 
              previously in a conversation, but the
              conversation data hasn't been loaded yet */}
            </div>
          )
        ) : (
          <Chat
            conversation={conversation}
            onLeave={() => {
              setConversationId(null);
              setConversation(null);
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

BlabMain.propTypes = {};
