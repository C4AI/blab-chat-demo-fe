import { Paper } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import MessageRow from "./MessageRow";
import PropTypes from "prop-types";

import QuotedMessage from "./QuotedMessage";
import MessageIO from "./io";
import MessageInputArea from "./MessageInputArea";
import { Message } from "./data-structures";
import { Conversation, Participant } from "../Lobby/data-structures";
import ChatHeader from "./ChatHeader";

/** Display the chat area, with header, message history and input fields.*/
export default function Chat({ conversation, onLeave }) {
  const insertMessage = useCallback(
    (messages, newMessage) => {
      if (
        newMessage.sender &&
        newMessage.senderId === conversation.myParticipantId
      ) {
        setSentMessageLocalIds((sent) => new Set(sent).add(newMessage.localId));
      }

      if (!messages.length) return [newMessage];
      const last = messages[messages.length - 1];
      if (last.time <= newMessage.time) {
        // most common case: just append the new value
        // (or replace old if repeated)
        return [
          ...(last.id === newMessage.id
            ? messages.slice(0, messages.length - 1)
            : messages),
          newMessage,
        ];
      }
      // having an old message: we have to find the correct position to keep the array sorted
      // (note that the state array has to be rebuilt, so it's already O(n) and binary search wouldn't help)
      const older = [],
        newer = [];
      messages.forEach((m) =>
        (m.time <= newMessage.time ? older : newer).push(m)
      );
      if (older.length && older[older.length - 1].id === newMessage.id)
        older.pop();
      if (newer.length && newer[0].id === newMessage.id) newer.shift();
      return [...older, newMessage, ...newer];
    },
    [conversation.myParticipantId]
  );

  const receiveMessage = useCallback(
    function (message) {
      setMessages((existing) => insertMessage(existing, message));
      setFirstMessageTime((first) =>
        first === null ? new Date(message.time) : first
      );
      setMessagesById((messagesById) => {
        return { ...messagesById, [message.id]: message };
      });
    },
    [insertMessage]
  );

  const receiveState = useCallback(function (state) {
    if ("participants" in state)
      setParticipants(state["participants"].map(Participant.fromServerData));
    if ("conversation_name" in state)
      setConversationName(state["conversation_name"]);
  }, []);

  const onReceiveEvent = useCallback(
    (type, event) => {
      switch (type) {
        case "message":
          receiveMessage(
            Message.fromServerData(event, conversation.myParticipantId)
          );
          break;
        case "state":
          receiveState(event);
          break;
        default:
          break;
      }
    },
    [receiveState, receiveMessage, conversation.myParticipantId]
  );

  const messageInputRef = useRef(null);

  // messages returned by the server (sent, received, system)
  const [messages, setMessages] = useState([]);

  // old messages (sent before the user joined)
  const [oldMessages, setOldMessages] = useState([]);

  const [messagesById, setMessagesById] = useState({});

  const [pendingMessages, setPendingMessages] = useState([]);

  const [firstMessageTime, setFirstMessageTime] = useState(null);

  const ioRef = useRef(null);
  useEffect(() => {
    if (!ioRef.current)
      ioRef.current = new MessageIO(
        conversation.id,
        conversation.myParticipantId,
        onReceiveEvent,
        setPendingMessages
      );
    const s = ioRef.current;
    return () => {
      s && s.close();
    };
  }, [conversation.id, conversation.myParticipantId, onReceiveEvent]);
  const io = ioRef.current;

  useEffect(() => {
    if (firstMessageTime !== null) {
      io.getOldMessages(
        firstMessageTime,
        (old) => {
          setOldMessages(old);
          setMessagesById((messagesById) => ({
            ...messagesById,
            ...Object.fromEntries(old.map((m) => [m.id, m])),
          }));
        },
        200
      );
    }
  }, [firstMessageTime, io]);

  const [sentMessageLocalIds, setSentMessageLocalIds] = useState(new Set());

  const messageListEndRef = useRef(null);

  const [participants, setParticipants] = useState(conversation.participants);
  const [participantsById, setParticipantsById] = useState(
    Object.fromEntries(participants.map((p) => [p.id, p]))
  );

  const [conversationName, setConversationName] = useState(conversation.name);

  const [quotedMessage, setQuotedMessage] = useState(null);

  useEffect(() => {
    setParticipantsById(Object.fromEntries(participants.map((p) => [p.id, p])));
  }, [participants, setParticipantsById]);

  useEffect(() => {
    setTimeout(
      () => messageListEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  }, [oldMessages, messages, pendingMessages]);

  const sendMessage = (message) => {
    if (!message) return;
    message.senderId = conversation.myParticipantId;
    message.quotedMessageId = quotedMessage?.id;
    const send = (message) => {
      if (io) io.enqueueMessage(message);
      else setTimeout(() => send(message), 100);
    };
    send(message);
    setQuotedMessage(null);
  };

  return (
    <div className="chat-wrapper">
      {/* header */}
      <ChatHeader
        conversationName={conversationName}
        participants={participants.filter(
          (p) => p.id !== conversation.myParticipantId
        )}
        onTrigger={(action, args = {}) => {
          switch (action) {
            case "leave":
              onLeave();
              break;
            case "changeMyName":
              io.changeParticipantName(args.name);
              break;
            default:
              break;
          }
        }}
      />

      {/* messages */}
      <Paper variant="outlined" className="message-container">
        {[...oldMessages, ...messages].map((message) => (
          <MessageRow
            key={message.id}
            message={message}
            participants={participantsById}
            myParticipantId={conversation.myParticipantId}
            handleQuote={() => {
              setQuotedMessage(message);
              messageInputRef.current.focus();
            }}
            quotedMessage={messagesById[message.quotedMessageId] || null}
          />
        ))}
        {pendingMessages
          .filter((m) => {
            return !sentMessageLocalIds.has(m.localId);
          })
          .map((message) => (
            <MessageRow
              key={message.localId}
              message={message}
              participants={participantsById}
              myParticipantId={conversation.myParticipantId}
              quotedMessage={messagesById[message.quotedMessageId] || null}
            />
          ))}
        <div className="after-bubbles" ref={messageListEndRef}></div>
      </Paper>

      {/* quoted message */}

      <QuotedMessage
        message={quotedMessage}
        participants={participantsById}
        handleRemoveQuote={(e) => {
          setQuotedMessage(null);
          messageInputRef.current.focus();
        }}
      />

      {/* message field */}
      <MessageInputArea onSendMessage={sendMessage} ref={messageInputRef} />
    </div>
  );
}

Chat.propTypes = {
  /** conversation */
  conversation: PropTypes.instanceOf(Conversation).isRequired,

  /** function called when user leaves the conversation */
  onLeave: PropTypes.func.isRequired,
};
