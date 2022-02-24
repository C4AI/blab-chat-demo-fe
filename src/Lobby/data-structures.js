/**
 * Represents participant types.
 *
 * @property {String} BOT bot participant
 * @property {String} HUMAN human participant
 */
export const ParticipantTypes = Object.freeze({
  BOT: "B",
  HUMAN: "H",
});

/** Represents a conversation participant */
export class Participant {
  /**
   * Create an instance.
   * @param {string} id participant id
   * @param {string} name participant name
   * @param {string} type participant type (see {@link ParticipantTypes})
   */
  constructor(id, name, type) {
    this.id = id;
    this.name = name;
    this.type = type;
  }

  /**
   * Build a {@link Participant} instance from data returned by the server.
   *
   * @param {Object} p participant data (as received from the server)
   * @param {string} p.id participant id
   * @param {string} p.name participant name
   * @param {string} p.type participant type (see {@link ParticipantTypes})
   *
   */
  static fromServerData(p) {
    return new Participant(p.id, p.name, p.type);
  }
}

/** Represents a conversation and its participants. */
export class Conversation {
  /**
   * Create an instance.
   * @param {string} id conversation id
   * @param {string} name conversation name
   * @param {Array<Participant>} participants list of participants
   * @param {string|null} myParticipantId id of the current participant
   *     (or `null` if not present)
   */
  constructor(id, name, participants, myParticipantId = null) {
    this.id = id;
    this.name = name;
    this.participants = participants;
    this.myParticipantId = myParticipantId;
  }

  /**
   * Build a {@link Conversation} instance from data returned by the server.
   *
   * @param {Object} c participant data (as received from the server)
   * @param {string} c.id conversation id
   * @param {string} c.name conversation name
   * @param {Array<Object>} c.participants list of participants
   * @param {string|null} c.my_participant_id id of the current participant
   *     (or `null` if not present)
   */
  static fromServerData(c) {
    return new Conversation(
      c.id,
      c.name,
      c.participants.map((p) => Participant.fromServerData(p)),
      c.my_participant_id
    );
  }
}
