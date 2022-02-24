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
    // The message below cannot be translated because it is shown
    // before the translations are loaded;
    // perhaps we can replace it with an icon
    <Suspense fallback={<div>Loading... / Carregando...</div>}>
      <ThemeProvider theme={theme}>
        <BlabMain />
      </ThemeProvider>
    </Suspense>
  );
}

export default App;
