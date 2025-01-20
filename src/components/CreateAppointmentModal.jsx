import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Button,
  Form,
  Spinner,
  Alert,
  InputGroup,
} from "react-bootstrap";
import axios from "axios";
import { KeycloakContext } from "../keycloak/keycloak-provider";

const CreateAppointmentModal = ({
  show,
  handleClose,
  doctorId,
  refreshAppointments,
}) => {
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState(null);

  const { keycloak } = useContext(KeycloakContext);

  useEffect(() => {
    if (show) {
      // Fetch the list of patients when the modal is shown
      axios
        .get("http://localhost:8080/api.medical-record/v1/patients/simple", {
          headers: {
            Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
          },
        })
        .then((response) => {
          setPatients(response.data);
          setLoadingPatients(false);
        })
        .catch((err) => {
          setError("Failed to fetch patients. Please try again later.");
          setLoadingPatients(false);
        });
    }
  }, [show, keycloak.token]);

  const handleSearchChange = (e) => {
    setPatientSearch(e.target.value);
  };

  const filteredPatients = patients.filter((patient) =>
    `${patient.ucn} ${patient.firstName} ${patient.lastName}`
      .toLowerCase()
      .includes(patientSearch.toLowerCase())
  );

  const handleSubmit = () => {
    if (selectedPatient && appointmentDate) {
      const payload = {
        patientId: selectedPatient.id,
        doctorId,
        appointmentDate,
      };

      axios
        .post(
          "http://localhost:8080/api.medical-record/v1/appointments/create",
          payload,
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
            },
          }
        )
        .then(() => {
          refreshAppointments(); // Refresh appointments after creating a new one
          handleClose(); // Close the modal
        })
        .catch((err) => {
          setError("Failed to create appointment. Please try again later.");
        });
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {loadingPatients ? (
          <div className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Search Patient</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by UCN, First Name, Last Name"
                  value={patientSearch}
                  onChange={handleSearchChange}
                />
              </InputGroup>
              {filteredPatients.length > 0 && (
                <ul className="list-group mt-2">
                  {filteredPatients.map((patient) => (
                    <li
                      key={patient.id}
                      className={`list-group-item ${
                        selectedPatient && selectedPatient.id === patient.id
                          ? "bg-primary text-white"
                          : ""
                      }`}
                      style={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedPatient && selectedPatient.id === patient.id
                            ? "#007bff"
                            : "",
                      }}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      {`${patient.ucn} - ${patient.firstName} ${patient.lastName}`}
                    </li>
                  ))}
                </ul>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
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
          onClick={handleSubmit}
          disabled={!selectedPatient || !appointmentDate}
        >
          Create Appointment
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateAppointmentModal;
