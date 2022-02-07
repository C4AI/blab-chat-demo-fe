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
import { w3cwebsocket as W3CWebSocket } from "websocket";
import MessageRow from "./Message";
import SendIcon from "@mui/icons-material/Send";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { v4 as uuidv4 } from "uuid";
import { Trans } from "react-i18next";

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

function Chat({ conversationId, onLeave }) {
  const [messages, setMessages] = useState([]);
  // messages returned by the server (sent, received, system)

  const [pendingMessages, setPendingMessages] = useState([]);

  const [sentMessageLocalIds, setSentMessageLocalIds] = useState(new Set());

  const [typedMessage, setTypedMessage] = useState("");
  // current message typed by the user

  const socket = useRef(null);
  const messageListEndRef = useRef(null);

  const [myParticipantId, setMyParticipantId] = useState(null);

  const [participants, setParticipants] = useState([]);
  const [conversationName, setConversationName] = useState("");

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

  useEffect(() => {
    messageListEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const receiveMessage = useCallback(
    function (message) {
      setMessages((existing) => insertMessage(existing, message));
    },
    [insertMessage]
  );

  const receiveState = useCallback(function (state) {
    if ("participants" in state) setParticipants(state["participants"]);
    if ("conversation_name" in state)
      setConversationName(state["conversation_name"]);
    if ("my_participant_id" in state)
      setMyParticipantId(state["my_participant_id"]);
  }, []);

  const onReceiveEvent = useCallback(
    (m) => {
      const event = JSON.parse(m.data);
      if ("message" in event) receiveMessage(event["message"]);
      if ("state" in event) receiveState(event["state"]);
    },
    [receiveState, receiveMessage]
  );

  useEffect(() => {
    if (!socket.current || socket.current.readyState !== W3CWebSocket.OPEN) {
      setMessages([]);
      socket.current = conversationId
        ? new W3CWebSocket(
            "ws://localhost:8000/ws/chat/" + conversationId + "/"
          )
        : null;
      if (socket.current) {
        socket.current.onopen = () => {};
        socket.current.onmessage = (m) => onReceiveEvent(m);
        socket.current.onerror = (ev) => {
          onLeave();
        };
        const s = socket.current;
        return () => {
          s.close();
        };
      }
    }
  }, [conversationId, onLeave, onReceiveEvent]);

  const sendPlainTextMessage = (text) => {
    const t = new Date();
    const message = {
      type: "T",
      text: text,
      sender: { id: myParticipantId },
      local_id: uuidv4().replace(/-/g, ""),
      time: t,
      timestamp: t.toISOString(),
    };
    setPendingMessages((pending) => [...pending, message]);
    sendMessage(message);
    setTypedMessage("");
  };

  const sendMessage = (message) => {
    socket.current.send(JSON.stringify(message));
  };

  return (
    <div className="chat-wrapper">
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

      <Paper variant="outlined" className="message-container">
        {messages.map((message) => (
          <MessageRow
            key={message.id}
            message={message}
            myParticipantId={myParticipantId}
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

      <TextField
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