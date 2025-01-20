import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Modal, Form, Button, Spinner, Alert } from "react-bootstrap";
import { KeycloakContext } from "../keycloak/keycloak-provider";

const EditAppointmentModal = ({
  show,
  handleClose,
  appointmentId,
  refreshAppointments,
}) => {
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState(""); // Define state for search input
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { keycloak } = useContext(KeycloakContext);

  useEffect(() => {
    if (show) {
      setLoading(true);
      axios
        .get("http://localhost:8080/api.medical-record/v1/patients/simple", {
          headers: {
            Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
          },
        })
        .then((response) => {
          setPatients(response.data);
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to load patients.");
          setLoading(false);
        });
    }
  }, [show]);

  const handleSearchChange = (e) => {
    setPatientSearch(e.target.value); // Update search state when user types
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient); // Set selected patient when a patient is clicked
  };

  const handleSaveChanges = () => {
    if (!selectedPatient || !appointmentDate) {
      setError("Please select a patient and appointment date.");
      return;
    }

    const payload = {
      patientId: selectedPatient.id, // Using selected patient's ID
      doctorId: keycloak.tokenParsed.sub, // Assuming doctor ID comes from Keycloak token
      appointmentDate: appointmentDate, // The new appointment date
    };

    setLoading(true); // Show loading state

    axios
      .put(
        `http://localhost:8080/api.medical-record/v1/appointments/${appointmentId}/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
          },
        }
      )
      .then((response) => {
        setLoading(false); // Hide loading state
        refreshAppointments(); // Refresh the appointments list after successful update
        handleClose(); // Close the modal
      })
      .catch((err) => {
        setLoading(false); // Hide loading state
        setError("Failed to update appointment. Please try again later.");
      });
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.ucn.includes(patientSearch)
  );

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group controlId="patientSearch">
            <Form.Label>Search Patient</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by name or UCN"
              value={patientSearch}
              onChange={handleSearchChange}
            />
          </Form.Group>

          <ul>
            {filteredPatients.map((patient) => (
              <li
                key={patient.id}
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedPatient?.id === patient.id
                      ? "#d3f8e2"
                      : "transparent",
                }}
                onClick={() => handleSelectPatient(patient)}
              >
                {patient.firstName} {patient.lastName} - {patient.ucn}
              </li>
            ))}
          </ul>

          <Form.Group controlId="appointmentDate">
            <Form.Label>Appointment Date</Form.Label>
            <Form.Control
              type="datetime-local"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditAppointmentModal;
