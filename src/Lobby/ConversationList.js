import PropTypes from "prop-types";
import { List } from "@mui/material";
import ConversationRow from "./ConversationRow";
import NewConversation from "./NewConversation";

/** Display a list of existing conversations and an option
 * to create a new one. */
export default function ConversationList({
  conversations,
  selectedId,
  idForNewConversation,
  handleSelectionChange,
  handleConversationNameChange,
}) {
  return (
    <List component="nav">
      {conversations.map((conversation) => {
        return (
          <ConversationRow
            key={conversation.id}
            conversation={conversation}
            isSelected={conversation.id === selectedId}
            handleSelect={(
              (id) => (sel) =>
                handleSelectionChange(sel === null ? null : id)
            )(conversation.id)}
          />
        );
      })}
      <NewConversation
        key={idForNewConversation}
        isSelected={idForNewConversation === selectedId}
        handleSelect={(
          (id) => (sel) =>
            handleSelectionChange(sel === null ? null : id)
        )(idForNewConversation)}
        handleNameChange={handleConversationNameChange}
      />
    </List>
  );
}
ConversationList.propTypes = {
  /** existing conversations */
  conversations: PropTypes.arrayOf(
    PropTypes.shape({
      /** conversation id */
      id: PropTypes.string.isRequired,

      /** conversation name */
      name: PropTypes.string.isRequired,
    })
  ),

  /** currently selected conversation id, or null if selection is empty */
  selectedId: PropTypes.string,

  /** fake id, used if "new conversation" is selected */
  idForNewConversation: PropTypes.string.isRequired,

  /** function called when the selected conversation changes
   * (the first argument is the id of the selected conversation,
   * or null if the selection is empty)
   */
  handleSelectionChange: PropTypes.func.isRequired,

  /** function called when the new conversation name changes
   * (it is called with the new name in the first argument)
   */
  handleConversationNameChange: PropTypes.func.isRequired,
};
