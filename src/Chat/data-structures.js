export const MessageTypes = Object.freeze({
  TEXT: "T",
  MEDIA: "M",
  VOICE: "V",
  ATTACHMENT: "A",
  SYSTEM: "S",
});

export class Message {
  constructor(
    type,
    time,
    localId,
    id,
    text,
    senderId,
    senderName,
    downloadUrl,
    quotedMessageId,
    event,
    additionalMetadata
  ) {
    this.type = type;
    this.time = time instanceof Date ? time : new Date(time);
    this.localId = localId;
    this.id = id;
    this.text = text;
    this.senderId = senderId;
    this.senderName = senderName;
    this.downloadUrl = downloadUrl;
    this.quotedMessageId = quotedMessageId;
    this.event = event;
    this.additionalMetadata = additionalMetadata;
  }

  asObjectToSend() {
    return {
      type: this.type,
      text: this.text,
      quoted_message_id: this.quotedMessageId,
      local_id: this.localId,
    };
  }

  static fromServerData(m) {
    return new Message(
      m.type,
      m.time,
      m.local_id,
      m.id,
      m.text,
      m.sender?.id,
      m.sender?.name,
      m.downloadUrl,
      m.quoted_message_id,
      m.event,
      m.additional_metadata
    );
  }
}
