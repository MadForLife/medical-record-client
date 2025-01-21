import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { KeycloakContext } from "../keycloak/keycloak-provider";
import { Container, Row, Col, Form, Table, Alert } from "react-bootstrap";

const PatientsByDoctorComponent = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [patients, setPatients] = useState([]);

  const { keycloak } = useContext(KeycloakContext);

  // Fetch doctors on component mount
  useEffect(() => {
    axios
      .get("http://localhost:8080/api.medical-record/v1/doctors/simple", {
        headers: {
          Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
        },
      })
      .then((response) => {
        // Filter doctors who are personal doctors
        const personalDoctors = response.data.filter(
          (doctor) => doctor.isPersonalDoctor
        );
        setDoctors(personalDoctors);
      })
      .catch((error) => console.error("Error fetching doctors:", error));
  }, [keycloak.token]);

  // Fetch patients when a doctor is selected
  useEffect(() => {
    if (selectedDoctorId) {
      axios
        .get(
          `http://localhost:8080/api.medical-record/v1/patients/simple/${selectedDoctorId}/doctor`,
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
            },
          }
        )
        .then((response) => {
          setPatients(response.data);
        })
        .catch((error) => console.error("Error fetching patients:", error));
    }
  }, [selectedDoctorId, keycloak.token]);

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Patients by Personal Doctor</h1>
        </Col>
      </Row>

      {/* Doctor Selector */}
      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <Form.Group controlId="doctor-select">
            <Form.Label>Select Doctor</Form.Label>
            <Form.Control
              as="select"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.firstName} {doctor.lastName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      {/* Patients Table */}
      <Row>
        <Col>
          {patients.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>UCN</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Health Insured</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.ucn}</td>
                    <td>{patient.firstName}</td>
                    <td>{patient.lastName}</td>
                    <td>{patient.isHealthInsured ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info" className="text-center">
              {selectedDoctorId
                ? "No patients found for the selected doctor."
                : "Please select a doctor to view patients."}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PatientsByDoctorComponent;
