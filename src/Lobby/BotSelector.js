import PropTypes from "prop-types";

import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Trans } from "react-i18next";

/**
 * Display a selector that allows the user to choose
 * one or more bots.
 */
export default function BotSelector({ bots, onChangeSelection }) {
  const [selectedBots, setSelectedBots] = useState([]);

  useEffect(() => {
    onChangeSelection(selectedBots);
  }, [selectedBots, onChangeSelection]);

  return (
    <FormControl fullWidth>
      <InputLabel id="bot-selector-label">
        <Trans i18nKey="inviteBots">Invite bots</Trans>
      </InputLabel>
      <Select
        labelId="bot-selector-label"
        id="bot-selector"
        multiple
        value={selectedBots}
        onChange={(e) => setSelectedBots(e.target.value)}
        input={
          <OutlinedInput
            label={<Trans i18nKey="inviteBots">Invite bots</Trans>}
          />
        }
        renderValue={(selected) => selected.join(", ")}
      >
        {bots.map((name) => (
          <MenuItem key={name} value={name}>
            <Checkbox checked={selectedBots.includes(name)} />
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
BotSelector.propTypes = {
  /** list of available bots */
  bots: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,

  /** function called whenever the selection changes
   * (the selected bots are passed in the first argument)
   */
  onChangeSelection: PropTypes.func,
};
