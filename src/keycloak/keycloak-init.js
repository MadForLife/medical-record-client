import Keycloak from "keycloak-js";
import keycloakConfiguration from "./keycloak-options";

const keycloak = new Keycloak(keycloakConfiguration);

export default keycloak;
