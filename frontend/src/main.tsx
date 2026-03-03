import { StrictMode, useState, useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import "./i18n";
import "./index.css";
import { createAppTheme } from "./theme/theme";
import App from "./App.tsx";

function Root() {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("mmd-theme") as "light" | "dark" | null;
    return stored ?? "dark";
  });

  useEffect(() => {
    const handler = (e: CustomEvent<"light" | "dark">) => setMode(e.detail);
    window.addEventListener("theme-change", handler as EventListener);
    return () => window.removeEventListener("theme-change", handler as EventListener);
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
