import { ListItemButton, ListItemText, Radio } from "@mui/material";

function Conversation({ conversation, isSelected, handleSelect }) {
  return (
    <ListItemButton selected={isSelected} onClick={(e) => handleSelect(true)}>
      <Radio
        checked={isSelected}
        onChange={(e) => handleSelect(e.target.checked)}
      />
      <ListItemText primary={conversation.name} />
    </ListItemButton>
  );
}

export default Conversation;
