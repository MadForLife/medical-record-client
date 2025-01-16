import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import KeycloakProvider from "./keycloak/keycloak-provider.jsx";

createRoot(document.getElementById("root")).render(
  <KeycloakProvider>
    <App />
  </KeycloakProvider>
);
