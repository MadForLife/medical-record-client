import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { KeycloakContext } from "../keycloak/keycloak-provider";
import { Container, Row, Col, Form, Table, Alert } from "react-bootstrap";

const PatientDiagnoseComponent = () => {
  const [diagnoseCodes, setDiagnoseCodes] = useState([]);
  const [selectedDiagnoseCode, setSelectedDiagnoseCode] = useState("");
  const [patients, setPatients] = useState([]);

  const { keycloak } = useContext(KeycloakContext);

  // Fetch diagnose codes on component mount
  useEffect(() => {
    axios
      .get("http://localhost:8080/api.medical-record/v1/diagnoses/simple", {
        headers: {
          Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
        },
      })
      .then((response) => {
        // Extract diagnose codes properly
        const codes = response.data.map((item) => ({
          id: item.diagnoseCode.id, // id of the diagnose code
          code: item.diagnoseCode.code, // actual diagnose code
        }));
        setDiagnoseCodes(codes);
      })
      .catch((error) => console.error("Error fetching diagnose codes:", error));
  }, [keycloak.token]);

  // Fetch patients when diagnose code is selected
  useEffect(() => {
    if (selectedDiagnoseCode) {
      axios
        .get(
          `http://localhost:8080/api.medical-record/v1/patients/simple/${selectedDiagnoseCode}/diagnose-code`,
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
  }, [selectedDiagnoseCode, keycloak.token]);

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Patients by Diagnose Code</h1>
        </Col>
      </Row>

      {/* Diagnose Code Selector */}
      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <Form.Group controlId="diagnose-code-select">
            <Form.Label>Select Diagnose Code</Form.Label>
            <Form.Control
              as="select"
              value={selectedDiagnoseCode}
              onChange={(e) => setSelectedDiagnoseCode(e.target.value)}
            >
              <option value="">-- Select Diagnose Code --</option>
              {diagnoseCodes.map((code, index) => (
                <option key={`${code.id}-${index}`} value={code.id}>
                  {code.code} {/* Display the diagnose code */}
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
                  <th>Doctor</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.ucn}</td>
                    <td>{patient.firstName}</td>
                    <td>{patient.lastName}</td>
                    <td>{patient.isHealthInsured ? "Yes" : "No"}</td>
                    <td>
                      {patient.doctor
                        ? `${patient.doctor.firstName} ${patient.doctor.lastName}`
                        : "No Doctor Assigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info" className="text-center">
              {selectedDiagnoseCode
                ? "No patients found for the selected diagnose code."
                : "Please select a diagnose code to view patients."}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PatientDiagnoseComponent;
