import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Table, Alert, Spinner } from "react-bootstrap";
import { KeycloakContext } from "../keycloak/keycloak-provider";

const DoctorsWithPatientCount = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { keycloak } = useContext(KeycloakContext);

  useEffect(() => {
    const fetchDoctorsWithPatientCount = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          "http://localhost:8080/api.medical-record/v1/doctors/simple/patient-count",
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
            },
          }
        );
        setDoctors(response.data);
      } catch (err) {
        setError("Failed to fetch doctors with patient counts.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorsWithPatientCount();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Doctors with Patient Count</h2>

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* Error Alert */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Doctors Table */}
      {!loading && !error && doctors.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Doctor Name</th>
              <th>Patient Count</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{doctor.doctorName}</td>
                <td>{doctor.patientCount}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* No Data Message */}
      {!loading && !error && doctors.length === 0 && (
        <Alert variant="info">No doctors found.</Alert>
      )}
    </div>
  );
};

export default DoctorsWithPatientCount;
