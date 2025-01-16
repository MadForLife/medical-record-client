import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Table, Container, Spinner } from "react-bootstrap";
import { KeycloakContext } from "../keycloak/keycloak-provider";

const AllPatients = () => {
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllPatients = async () => {
      if (isAuthenticated) {
        try {
          const apiUrl =
            "http://localhost:8080/api.medical-record/v1/patients/simple"; // Update to the appropriate endpoint for all patients

          const response = await axios.get(apiUrl, {
            headers: {
              Authorization: `Bearer ${keycloak.token}`, // Include Keycloak token
            },
          });

          setPatients(response.data); // Set the fetched patients
        } catch (err) {
          console.error(err);
          setError("Failed to fetch patients. Please try again.");
        } finally {
          setLoading(false); // Stop loading indicator
        }
      }
    };

    fetchAllPatients();
  }, [keycloak, isAuthenticated]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading patients...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <p className="text-danger">{error}</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>All Patients List</h2>
      {patients.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>UCN</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Health Insured</th>
              <th>Doctor</th>
              <th>Doctor ID (Partial)</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
              <tr key={patient.id}>
                <td>{index + 1}</td>
                <td>{patient.ucn}</td>
                <td>{patient.firstName}</td>
                <td>{patient.lastName}</td>
                <td>{patient.isHealthInsured ? "Yes" : "No"}</td>
                <td>
                  {patient.doctor.firstName} {patient.doctor.lastName}
                </td>
                <td>{patient.doctor.id.slice(0, 8)}...</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No patients found.</p>
      )}
    </Container>
  );
};

export default AllPatients;
