import { Card, CardHeader } from "@mui/material";
import PropTypes from "prop-types";

import ChatRightMenu from "./ChatRightMenu";

/**
 * Display the conversation header, with title and participants.
 */
export default function ChatHeader({
  conversationName,
  participants,
  onTrigger,
}) {
  return (
    <Card className="chat-header">
      <CardHeader
        className="chat-header"
        title={conversationName}
        subheader={participants.map((p) => p.name).join(", ")}
        action={<ChatRightMenu onTrigger={onTrigger} />}
      />
    </Card>
  );
}

ChatHeader.propTypes = {
  /** title of the conversation */
  conversationName: PropTypes.string,

  /** list of participants (usually not including the same person) */
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string.isRequired,
    })
  ),

  /** function called when an action is triggered
   * (currently, only "leave" is available)
   */
  onTrigger: PropTypes.func,
};