import { ListItemButton, ListItemText, Radio } from "@mui/material";
import PropTypes from "prop-types";

/**
 * Display a row containing a selectable conversation.
 */
export default function ConversationRow({
  conversation,
  isSelected,
  handleSelect,
}) {
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

ConversationRow.propTypes = {
  /** conversation to be displayed */
  conversation: PropTypes.shape({
    /** conversation name */
    name: PropTypes.string.isRequired,
  }).isRequired,

  /** whether the conversation is selected */

  isSelected: PropTypes.bool,
  /** function called when the user (de-)selects the conversation
   * (it is called with a boolean argument indicating if it was
   * selected)
   */
  handleSelect: PropTypes.func,
};
