import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import keycloak from "./keycloak-init";

export const KeycloakContext = createContext();

const KeycloakProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    keycloak
      .init({
        onLoad: "login-required",
        checkLoginIframe: false,
        pkceMethod: "S256",
      })
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
        if (authenticated) {
          console.log("Keycloak Authenticated: ", keycloak.token);
        }
      })
      .catch((error) => {
        console.error("Keycloak Initialization Error: ", error);
      });
  }, []);

  return (
    <KeycloakContext.Provider value={{ keycloak, isAuthenticated }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export default KeycloakProvider;
