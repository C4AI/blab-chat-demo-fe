import { w3cwebsocket as W3CWebSocket } from "websocket";

class MessageIO {
  static MessageTypes = Object.freeze({
    TEXT: "T",
    MEDIA: "M",
    VOICE: "V",
    ATTACHMENT: "A",
    SYSTEM: "S",
  });

  static webSocketURL =
    process.env.REACT_APP_CHAT_WS_URL || "ws://" + window.location.hostname;

  constructor(
    conversationId,
    myParticipantId,
    onReceiveEvent,
    onUpdatePendingList
  ) {
    this.conversationId = conversationId;
    this.myParticipantId = myParticipantId;
    this.ws = this.#createSocket();
    this.pending = new Map();
    this.onReceiveEvent = onReceiveEvent;
    this.onUpdatePendingList = onUpdatePendingList;
    this.intentionallyClosed = false;
  }

  #createSocket() {
    const s = new W3CWebSocket(
      MessageIO.webSocketURL + "/ws/chat/" + this.conversationId + "/"
    );
    s.onmessage = (e) => this.#receiveEvent(e);
    s.onclose = (e) => this.#close(e);
    s.onopen = (e) => {
      this.#sendNextPendingMessage();
    };

    return s;
  }

  enqueueMessage(message) {
    this.pending.set(message.local_id, message);
    if (this.onUpdatePendingList)
      this.onUpdatePendingList(Array.from(this.pending.values()));
    if (this.pending.size === 1) this.#sendNextPendingMessage();
  }

  #close(event) {
    if (this.intentionallyClosed) return;
    console.log("Socket closed. Trying to reconnect soon...");
    setTimeout(() => {
      this.ws = this.#createSocket();
    }, 500);
  }

  #receiveEvent(event) {
    const eventData = JSON.parse(event.data);
    if (this.onReceiveEvent)
      for (const [type, evt] of Object.entries(eventData))
        this.onReceiveEvent(type, evt);
    if (
      "message" in eventData &&
      eventData["message"].sender &&
      eventData["message"].sender.id === this.myParticipantId &&
      this.pending.delete(eventData["message"].local_id)
    ) {
      if (this.onUpdatePendingList)
        this.onUpdatePendingList(Array.from(this.pending.values()));
      this.#sendNextPendingMessage();
    }
  }

  #sendNextPendingMessage() {
    if (this.pending.size >= 1 && this.ws.readyState === W3CWebSocket.OPEN)
      this.#sendMessage(this.pending.values().next().value);
  }

  #sendMessage(message) {
    this.ws.send(JSON.stringify(message));
  }

  close() {
    this.intentionallyClosed = true;
    this.ws && this.ws.close();
  }
}

export default MessageIO;
