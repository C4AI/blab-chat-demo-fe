import { ListItemButton, ListItemText, Radio, TextField } from "@mui/material";
import { Trans } from "react-i18next";

function NewConversation({ isSelected, handleSelect, handleNameChange }) {
  return (
    <ListItemButton selected={isSelected} onClick={(e) => handleSelect(true)}>
      <Radio
        checked={isSelected}
        onChange={(e) => handleSelect(e.target.checked)}
      />
      <ListItemText primary={<Trans i18nKey="newConversation">New:</Trans>} />
      {isSelected ? (
        <TextField
          variant="standard"
          label={<Trans i18nKey="newConversationName">Conversation name</Trans>}
          required
          onChange={(e) => handleNameChange(e.target.value)}
        />
      ) : null}
    </ListItemButton>
  );
}

export default NewConversation;
