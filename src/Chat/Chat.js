import {
  Card,
  CardHeader,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  TextField,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import MessageRow from "./MessageRow";
import SendIcon from "@mui/icons-material/Send";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { v4 as uuidv4 } from "uuid";
import { Trans } from "react-i18next";
import QuotedMessage from "./QuotedMessage";
import MessageIO from "./io";

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
        setSentMessageLocalIds((sent) =>
          new Set(sent).add(newMessage.local_id)
        );
      }

      newMessage.timestamp = new Date(newMessage.time);
      if (!messages.length) return [newMessage];
      const last = messages[messages.length - 1];
      if (last.timestamp <= newMessage.timestamp) {
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
        (m.timestamp <= newMessage.timestamp ? older : newer).push(m)
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
          receiveMessage(event);
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

  const [messagesById, setMessagesById] = useState({});

  const [pendingMessages, setPendingMessages] = useState([]);

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

  const [sentMessageLocalIds, setSentMessageLocalIds] = useState(new Set());

  const [typedMessage, setTypedMessage] = useState("");
  // current message typed by the user

  const messageListEndRef = useRef(null);

  const [participants, setParticipants] = useState([]);
  const [conversationName, setConversationName] = useState(
    initialConversationName
  );

  const [quotedMessage, setQuotedMessage] = useState(null);

  useEffect(() => {
    messageListEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingMessages]);

  const sendPlainTextMessage = (text) => {
    const t = new Date();
    if (!text) return;
    const message = {
      type: MessageIO.MessageTypes.TEXT,
      text: text,
      sender: { id: myParticipantId },
      local_id: uuidv4().replace(/-/g, ""),
      time: t,
      timestamp: t.toISOString(),
      quoted_message_id: quotedMessage ? quotedMessage.id : null,
    };
    io.enqueueMessage(message);
    setTypedMessage("");
    setQuotedMessage(null);
  };

  return (
    <div className="chat-wrapper">
      {/* header */}
      <Card className="chat-header">
        <CardHeader
          className="chat-header"
          title={conversationName}
          subheader={participants
            .filter((p) => p.is_present)
            .map((p) => p.name)
            .join(", ")}
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
        {messages.map((message) => (
          <MessageRow
            key={message.id}
            message={message}
            myParticipantId={myParticipantId}
            handleQuote={() => {
              setQuotedMessage(message);
              messageInputRef.current.focus();
            }}
            quotedMessage={messagesById[message.quoted_message_id] || null}
          />
        ))}
        {pendingMessages
          .filter((m) => {
            return !sentMessageLocalIds.has(m.local_id);
          })
          .map((message) => (
            <MessageRow
              key={message.local_id}
              message={message}
              myParticipantId={myParticipantId}
            />
          ))}
        <div className="after-bubbles" ref={messageListEndRef}></div>
      </Paper>

      <div></div>

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
      <TextField
        inputRef={messageInputRef}
        value={typedMessage}
        fullWidth
        multiline
        minRows={4}
        label={<Trans i18nKey="typeMessage">Type a message</Trans>}
        variant="outlined"
        onChange={(e) => setTypedMessage(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            sendPlainTextMessage(typedMessage.trim());
            e.preventDefault();
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                disabled={!typedMessage.trim()}
                onClick={(e) => {
                  sendPlainTextMessage(typedMessage.trim());
                }}
                onMouseDown={(e) => e.preventDefault()} // don't lose focus
              >
                <SendIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
}

export default Chat;
