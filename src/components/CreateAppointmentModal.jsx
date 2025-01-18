import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { KeycloakContext } from "../keycloak/keycloak-provider"; // Make sure the path is correct

const CreateAppointmentModal = ({
  show,
  handleClose,
  editMode,
  currentAppointment,
  patientId,
  appointmentDate,
  setPatientId,
  setAppointmentDate,
}) => {
  const { keycloak } = useContext(KeycloakContext); // Access Keycloak context
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all patients when the modal is shown
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

  // Filter patients based on search query
  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.ucn.toLowerCase().includes(searchLower) ||
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower)
    );
  });

  const handleSave = async () => {
    try {
      // Ensure required fields are filled
      if (!patientId || !appointmentDate) {
        alert("Please fill in all fields.");
        return;
      }

      // Get doctorId from Keycloak token
      const doctorId = keycloak.tokenParsed?.sub; // Assuming the doctor ID is in the token

      // Prepare the data for the request
      const appointmentData = {
        patientId: patientId,
        doctorId: doctorId,
        appointmentDate: appointmentDate,
      };

      // Send the POST request to the backend
      const response = await axios.post(
        "http://localhost:8080/api.medical-record/v1/appointments/create",
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`, // Include the Authorization header with the token
          },
        }
      );

      // Handle the response (e.g., show success or update UI)
      console.log("Appointment created:", response.data);
      handleClose(); // Close the modal after success
    } catch (error) {
      console.error("Error creating appointment:", error);
      setError("Failed to save the appointment. Please try again.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {editMode ? "Edit Appointment" : "Create Appointment"}
        </Modal.Title>
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
        <Button variant="primary" onClick={handleSave}>
          {editMode ? "Save Changes" : "Create Appointment"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateAppointmentModal;
