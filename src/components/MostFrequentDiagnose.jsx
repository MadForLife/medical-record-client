import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Spinner, Alert, Table } from "react-bootstrap";
import { KeycloakContext } from "../keycloak/keycloak-provider"; // Assuming you're using Keycloak for authentication

const MostFrequentDiagnoses = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { keycloak } = useContext(KeycloakContext);

  useEffect(() => {
    const fetchMostFrequentDiagnoses = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api.medical-record/v1/diagnoses/most-frequent",
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
            },
          }
        );
        setDiagnoses(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching most frequent diagnoses:", err);
        setError(
          "Failed to fetch most frequent diagnoses. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchMostFrequentDiagnoses();
  }, [keycloak]);

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

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Most Frequent Diagnoses</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Diagnose Code</th>
            <th>Diagnosis Count</th>
          </tr>
        </thead>
        <tbody>
          {diagnoses.map((diagnosis, index) => (
            <tr key={index}>
              <td>{diagnosis.diagnoseCode}</td>
              <td>{diagnosis.diagnosisCount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default MostFrequentDiagnoses;
