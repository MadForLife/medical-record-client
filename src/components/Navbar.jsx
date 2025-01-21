import React, { useContext } from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { KeycloakContext } from "../keycloak/keycloak-provider";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const AppNavbar = () => {
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);

  const username = isAuthenticated
    ? keycloak.tokenParsed?.preferred_username
    : "Guest";

  const handleUserManagement = () => {
    if (isAuthenticated) {
      window.location.href = keycloak.createAccountUrl();
    }
  };

  const hasDoctorRole = isAuthenticated && keycloak.hasRealmRole("mr_doctor");
  const hasPatientRole = isAuthenticated && keycloak.hasRealmRole("mr_patient");

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        {/* Brand */}
        <Navbar.Brand href="#">MedicalRecord</Navbar.Brand>

        {/* Toggle Button for Collapsible Navbar */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Collapsible Content */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Home Link */}
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>

            {/* Patients Dropdown (Visible only if user has "mr_doctor" role) */}
            {hasDoctorRole && (
              <NavDropdown title="Patients" id="patients-dropdown">
                <NavDropdown.Item as={Link} to="/patients/my">
                  My Patients
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/patients/all">
                  All Patients
                </NavDropdown.Item>
                {/* Patients by Diagnose Component */}
                <NavDropdown.Item as={Link} to="/patients/diagnoses">
                  Patients by Diagnose
                </NavDropdown.Item>
                {/* New Entry: Patients by Doctor Component */}
                <NavDropdown.Item as={Link} to="/patients/by-doctor">
                  Patients by Doctor
                </NavDropdown.Item>
              </NavDropdown>
            )}

            {/* Doctors Dropdown (Visible only if user has "mr_doctor" role) */}
            {hasDoctorRole && (
              <NavDropdown title="Doctors" id="doctors-dropdown">
                <NavDropdown.Item as={Link} to="/doctors/all">
                  Doctors
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/doctors/with-specialities">
                  Doctors with Specialities
                </NavDropdown.Item>
              </NavDropdown>
            )}

            {/* Appointments Link as a separate button */}
            {hasDoctorRole && (
              <Nav.Link as={Link} to="/appointments/by-doctor">
                My Appointments
              </Nav.Link>
            )}

            {/* Patient Appointments (Visible only if user has "mr_patient" role) */}
            {hasPatientRole && (
              <Nav.Link as={Link} to="/appointments/patient">
                My Appointments
              </Nav.Link>
            )}
          </Nav>

          {/* User Menu */}
          <Nav>
            {isAuthenticated ? (
              <NavDropdown title={username} id="user-dropdown" align="end">
                <NavDropdown.Item onClick={handleUserManagement}>
                  Manage Account
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => keycloak.logout()}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link onClick={() => keycloak.login()}>Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
