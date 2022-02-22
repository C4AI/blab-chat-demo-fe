import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 0, retryDelay: axiosRetry.exponentialDelay });

/*
IMPORTANT: Parts of this file have been implemented for testing purposes, only in
development environments. The real BLAB chatbot does not display chatrooms to the user,
only a single conversation. Hence, some limitations are expected: 
- If there are too many conversations, only the first page is considered.
- Any user can see and join any conversation.
*/

/**
 * @callback conversationListCallback
 * @param {Array<Object>} conversations available conversations
 */

/**
 * @callback errorCallback
 * @param {*} e error
 */

/**
 * @callback enterConversationCallback
 * @param {Object} conversation conversation data
 */

export default class LobbyIO {
  /**
   * Provides methods to get the list of conversations and join/create a conversation.

   */
  constructor() {
    this.timeoutIds = [];
    this.intentionallyClosed = false;
  }

  /**
   * Get the list of current conversations.
   *
   * Since this method should only be used in a development environment, it only returns the first page of results.
   *
   * @param {number} interval interval between server requests to get the conversation list (or null to request only once)
   * @param {conversationListCallback} callback function called when the conversation list is refreshed
   * @param {errorCallback} failCallback function called if the request fails (after retries, if any)
   * @param {number} retries number of retries if the request fails with 5XX
   */
  getConversations(callback, failCallback, interval, retries = Infinity) {
    axios
      .get("/api/chat/conversations/", {
        "axios-retry": {
          retries: retries,
        },
      })
      .then((r) => {
        if (this.intentionallyClosed) return;
        callback(r.data.results);
        if (interval !== null)
          this.timeoutIds.push(
            setTimeout(
              () => this.getConversations(callback, failCallback, interval),
              interval
            )
          );
      })
      .catch((e) => failCallback && failCallback(e));
  }

  /**
   * Create a conversation.
   * @param {string} nickname participant's name
   * @param {string} conversationName conversation title
   * @param {enterConversationCallback} callback function to call if the
   *      conversation is created successfully (conversation data is
   *      passed in the first argument)
   * @param {errorCallback} failCallback function to call if the
   *      conversation creation fails (error is passed in the first argument)
   */
  createConversation(nickname, conversationName, callback, failCallback) {
    axios
      .post("/api/chat/conversations/", {
        nickname: nickname,
        name: conversationName,
      })
      .then((r) => callback(r.data))
      .catch((e) => failCallback && failCallback(e));
  }

  /**
   * Join a conversation.
   * @param {string} nickname participant's name
   * @param {string} conversationId conversation id
   * @param {enterConversationCallback} callback function to call if the
   *      conversation is joined successfully (conversation data is
   *      passed in the first argument)
   * @param {errorCallback} failCallback function to call if the
   *      conversation joining fails (error is passed in the first argument)
   */
  joinConversation(nickname, conversationId, callback, failCallback) {
    axios
      .post("/api/chat/conversations/" + conversationId + "/join/", {
        nickname: nickname,
      })
      .then((r) => callback(r.data))
      .catch((e) => failCallback && failCallback(e));
  }

  /** stop all connections */
  close() {
    this.intentionallyClosed = true;
    for (const t of this.timeoutIds) clearTimeout(t);
  }
}
