import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ObsOverlay } from "./components/ObsOverlay.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {window.location.pathname === "/overlay" ? <ObsOverlay /> : <App />}
  </StrictMode>,
);
