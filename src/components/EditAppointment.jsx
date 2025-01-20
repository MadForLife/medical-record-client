import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { KeycloakContext } from "../keycloak/keycloak-provider";

const EditAppointment = ({
  show,
  handleClose,
  currentAppointment,
  patientId,
  appointmentDate,
  setPatientId,
  setAppointmentDate,
  handleSaveAppointment,
}) => {
  const { keycloak } = useContext(KeycloakContext);
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api.medical-record/v1/patients/simple"
        );
        setPatients(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load patients.");
      } finally {
        setLoadingPatients(false);
      }
    };

    if (show) {
      fetchPatients();
    }
  }, [show]);

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.ucn.toLowerCase().includes(searchLower) ||
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingPatients ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p>Loading patients...</p>
          </div>
        ) : error ? (
          <div className="text-center text-danger">{error}</div>
        ) : (
          <>
            {/* Search bar */}
            <Form.Group controlId="searchPatient">
              <Form.Label>Search Patients</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by UCN, First or Last Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "0.75rem",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#f9f9f9",
                }}
              />
            </Form.Group>

            {/* Patient Dropdown */}
            <Form.Group controlId="patientId">
              <Form.Label>Patient</Form.Label>
              <Form.Control
                as="select"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                <option value="">Select Patient</option>
                {filteredPatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.ucn} - {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Appointment Date */}
            <Form.Group controlId="appointmentDate">
              <Form.Label>Appointment Date</Form.Label>
              <Form.Control
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </Form.Group>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveAppointment}
          disabled={!patientId || !appointmentDate}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditAppointment;
