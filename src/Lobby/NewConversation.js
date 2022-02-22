import { ListItemButton, ListItemText, Radio, TextField } from "@mui/material";
import PropTypes from "prop-types";
import { Trans } from "react-i18next";

/** Display a row containing a selectable option to create a new conversation. */
export default function NewConversation({
  isSelected,
  handleSelect,
  handleNameChange,
}) {
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

NewConversation.propTypes = {
  /** whether the conversation is selected */
  isSelected: PropTypes.bool,

  /** function called when the user (de-)selects the conversation
   * (it is called with a boolean argument indicating if it was
   * selected)
   */
  handleSelect: PropTypes.func,

  /** function called when the name of the new conversation changes
   * (it is called with the new name in the first argument)
   */
  handleNameChange: PropTypes.func,
};
