import { w3cwebsocket as W3CWebSocket } from "websocket";

import axios from "axios";
import axiosRetry from "axios-retry";
import { Message } from "./data-structures";

axiosRetry(axios, { retries: 0, retryDelay: axiosRetry.exponentialDelay });

/**
 * @callback receiveEventCallback
 * @param {String} type event type
 * @param {String} event event contents
 */

/**
 * @callback updatePendingListCallback
 * @param {Array<Message>} messages pending messages
 */

/**
 * Provides methods to send/receive messages and other information
 * to/from the server.
 */
class MessageIO {
  /** URL of the web socket server */
  static webSocketURL =
    process.env.REACT_APP_CHAT_WS_URL || "ws://" + window.location.hostname;

  /**
   * Create an instance.
   *
   * @param {String} conversationId
   * @param {String} myParticipantId
   * @param {receiveEventCallback} onReceiveEvent called whenever an event
   *    is received
   * @param {updatePendingListCallback} onUpdatePendingList called whenever
   *    the list of pending messages changes
   */
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

  /**
   * Create a socket connection.
   *
   * @returns {W3CWebSocket} a new socket connection
   */
  #createSocket() {
    const s = new W3CWebSocket(
      MessageIO.webSocketURL + "/ws/chat/" + this.conversationId + "/"
    );
    s.onmessage = (e) => this.#receiveEvent(e);
    s.onclose = (e) => this.#onClose(e);
    s.onopen = (e) => {
      this.#sendNextPendingMessage();
    };
    return s;
  }

  /**
   * Enqueue a message to be sent.
   *
   * @param {Message} message the message to be sent
   */
  enqueueMessage(message) {
    this.pending.set(message.localId, message);
    if (this.onUpdatePendingList)
      this.onUpdatePendingList(Array.from(this.pending.values()));
    if (this.pending.size === 1) this.#sendNextPendingMessage();
  }

  /**
   * Called when the web socket is closed.
   *
   * This method tries to reconnect after 500 ms.
   *
   * @param {import("websocket").ICloseEvent} event the close event
   */
  #onClose(event) {
    if (this.intentionallyClosed) return;
    console.log("Socket closed. Trying to reconnect soon...");
    setTimeout(() => {
      this.ws = this.#createSocket();
    }, 500);
  }

  /**
   * Called when an event is received by the web socket.
   * @param {import("websocket").IMessageEvent} event the receive event
   *
   * This method calls the callback functions for the corresponding
   * event types. If one of the events corresponds to a message that
   * was previously sent by this user and was still pending, then
   * it is removed from the list of pending messages, the callback
   * function is called and the next pending message (if any) is sent.
   */
  #receiveEvent(event) {
    const eventData = JSON.parse(event.data);
    if (this.onReceiveEvent)
      for (const [type, evt] of Object.entries(eventData))
        this.onReceiveEvent(type, evt);
    if (
      "message" in eventData &&
      eventData["message"].sender &&
      eventData["message"].sender.id === this.myParticipantId &&
      this.pending.delete(eventData["message"]["local_id"])
    ) {
      if (this.onUpdatePendingList)
        this.onUpdatePendingList(Array.from(this.pending.values()));
      this.#sendNextPendingMessage();
    }
  }

  /**
   * Send the next pending message, if any.
   */
  #sendNextPendingMessage() {
    if (this.pending.size >= 1 && this.ws.readyState === W3CWebSocket.OPEN)
      this.#sendMessage(this.pending.values().next().value);
  }

  /**
   * Send a message.
   *
   * @param {Message} message the message to be sent
   */
  #sendMessage(message) {
    this.ws.send(JSON.stringify(message.asObjectToSend()));
  }

  /**
   * Retrieve old messages in the conversation.
   * @param {Date | String} until the maximum date/time
   *  (it can be a {@link Date} instance or an ISO-8601 string;
   *   "now" is also accepted to represent the current moment)
   * @param {function(Array<Message>)} callback
   *   the function to be called when the list of old messages is retrieved
   * @param {number} limit the maximum number of messages to fetch
   */
  getOldMessages(until, callback, limit = 100) {
    let url = `/api/chat/conversations/${this.conversationId}/messages/`;
    const params = {
      until: until === "now" ? "now" : until.toISOString(),
      limit: limit,
    };
    const fetch = (prev, page, cb) => {
      axios
        .get(url, {
          params: { ...params, page: page },
          "axios-retry": {
            retries: Infinity,
          },
        })
        .then((response) => {
          const partial = [...prev, ...response.data["results"]];
          if (response.data["next"]) fetch(partial, page + 1, cb);
          else cb(partial);
        });
    };
    fetch([], 1, (oldMessages) => {
      callback(
        oldMessages.map((m) => Message.fromServerData(m, this.myParticipantId))
      );
    });
  }

  /**
   * Close the connection.
   */
  close() {
    this.intentionallyClosed = true;
    this.ws && this.ws.close();
  }
}

export default MessageIO;
