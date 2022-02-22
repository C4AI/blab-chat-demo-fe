import { createTheme, ThemeProvider } from "@mui/material";
import { Suspense } from "react";

import "./App.css";
import BlabMain from "./BlabMain";

const theme = createTheme({
  palette: {
    primary: { main: "#1094ab" },
    secondary: { main: "#fcb421" },
  },
});

function App() {
  return (
    <Suspense fallback={<div>Loading... </div>}>
      <ThemeProvider theme={theme}>
        <BlabMain />
      </ThemeProvider>
    </Suspense>
  );
}

export default App;
