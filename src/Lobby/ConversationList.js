import { List } from "@mui/material";
import Conversation from "./Conversation";
import NewConversation from "./NewConversation";

function ConversationList({
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
          <Conversation
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

export default ConversationList;
