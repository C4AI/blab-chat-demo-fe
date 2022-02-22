import { IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Trans } from "react-i18next";
import PropTypes from "prop-types";

/**
 * Display the top-right corner menu in a conversation.
 *
 * Currently, it only has one option ("leave").
 */
export default function ChatRightMenu({ onTrigger }) {
  const [menuAnchor, setMenuAnchor] = useState(null);

  return (
    <div>
      <IconButton
        id="right-menu-button"
        onClick={(e) => setMenuAnchor(e.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={(e) => setMenuAnchor(null)}
      >
        <MenuItem
          key="leave"
          onClick={(e) => {
            onTrigger("leave");
            setMenuAnchor(null);
          }}
        >
          <Trans i18nKey="leaveConversation">Leave</Trans>
        </MenuItem>
      </Menu>
    </div>
  );
}

ChatRightMenu.propTypes = {
  /** function called when an action is triggered
   * (currently, only "leave" is available)
   */
  onTrigger: PropTypes.func,
};
