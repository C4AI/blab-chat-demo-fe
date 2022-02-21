import {
  Card,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Paper,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import MessageRow from "./MessageRow";

import MoreVertIcon from "@mui/icons-material/MoreVert";

import { Trans } from "react-i18next";
import QuotedMessage from "./QuotedMessage";
import MessageIO from "./io";
import MessageInputArea from "./MessageInputArea";
import { Message } from "./data-structures";

function RightMenu(onTrigger) {
  const [menuAnchor, setMenuAnchor] = useState(null);

  return (
    <div>
      <IconButton
        id="right-menu-button"
        onClick={(e) => setMenuAnchor(e.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={(e) => setMenuAnchor(null)}
      >
        <MenuItem
          key="leave"
          onClick={(e) => {
            onTrigger("leave");
            setMenuAnchor(null);
          }}
        >
          <Trans i18nKey="leaveConversation">Leave</Trans>
        </MenuItem>
      </Menu>
    </div>
  );
}

function Chat({
  conversationId,
  myParticipantId,
  onLeave,
  initialConversationName = "",
}) {
  const insertMessage = useCallback(
    (messages, newMessage) => {
      if (newMessage.sender && newMessage.sender.id === myParticipantId) {
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
    [myParticipantId]
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
    if ("participants" in state) setParticipants(state["participants"]);
    if ("conversation_name" in state)
      setConversationName(state["conversation_name"]);
  }, []);

  const onReceiveEvent = useCallback(
    (type, event) => {
      switch (type) {
        case "message":
          receiveMessage(Message.fromServerData(event));
          break;
        case "state":
          receiveState(event);
          break;
        default:
          break;
      }
    },
    [receiveState, receiveMessage]
  );

  const messageInputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  // messages returned by the server (sent, received, system)

  const [oldMessages, setOldMessages] = useState([]);
  // old messages (sent before the user joined)

  const [messagesById, setMessagesById] = useState({});

  const [pendingMessages, setPendingMessages] = useState([]);

  const [firstMessageTime, setFirstMessageTime] = useState(null);

  const ioRef = useRef(null);
  useEffect(() => {
    if (!ioRef.current)
      ioRef.current = new MessageIO(
        conversationId,
        myParticipantId,
        onReceiveEvent,
        setPendingMessages
      );
    const s = ioRef.current;
    return () => {
      s && s.close();
    };
  }, [conversationId, myParticipantId, onReceiveEvent]);
  const io = ioRef.current;

  useEffect(() => {
    if (firstMessageTime !== null) {
      io.getOldMessages(
        firstMessageTime,
        (old) => {
          setOldMessages(old);
        },
        200
      );
    }
  }, [firstMessageTime, io]);

  const [sentMessageLocalIds, setSentMessageLocalIds] = useState(new Set());

  const messageListEndRef = useRef(null);

  const [participants, setParticipants] = useState([]);
  const [conversationName, setConversationName] = useState(
    initialConversationName
  );

  const [quotedMessage, setQuotedMessage] = useState(null);

  useEffect(() => {
    messageListEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [oldMessages, messages, pendingMessages]);

  const sendMessage = (message) => {
    if (!message) return;
    message.senderId = myParticipantId;
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
      <Card className="chat-header">
        <CardHeader
          className="chat-header"
          title={conversationName}
          subheader={participants.map((p) => p.name).join(", ")}
          action={RightMenu((action) => {
            switch (action) {
              case "leave":
                onLeave();
                break;
              default:
                break;
            }
          })}
        />
      </Card>

      {/* messages */}
      <Paper variant="outlined" className="message-container">
        {[...oldMessages, ...messages].map((message) => (
          <MessageRow
            key={message.id}
            message={message}
            myParticipantId={myParticipantId}
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
              myParticipantId={myParticipantId}
              quotedMessage={messagesById[message.quotedMessageId] || null}
            />
          ))}
        <div className="after-bubbles" ref={messageListEndRef}></div>
      </Paper>

      {/* quoted message */}
      {quotedMessage && (
        <QuotedMessage
          message={quotedMessage}
          handleRemoveQuote={(e) => {
            setQuotedMessage(null);
            messageInputRef.current.focus();
          }}
        />
      )}

      {/* message field */}
      <MessageInputArea onSendMessage={sendMessage} ref={messageInputRef} />
    </div>
  );
}

export default Chat;
