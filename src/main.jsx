import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./views/css/App.css";
import App from "./views/App.jsx";
import { AppDataProvider } from "./context/AppDataContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppDataProvider>
      <App />
    </AppDataProvider>
  </StrictMode>,
);