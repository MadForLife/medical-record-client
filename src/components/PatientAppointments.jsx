import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Button } from "react-bootstrap";
import { KeycloakContext } from "../keycloak/keycloak-provider"; // Assuming you're using Keycloak for authentication
import { useNavigate } from "react-router-dom"; // Import useNavigate

const PatientAppointments = () => {
  const { keycloak, isAuthenticated } = useContext(KeycloakContext); // Access Keycloak for patient info
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    if (isAuthenticated) {
      const patientId = keycloak.tokenParsed.sub; // Extract patient ID from the Keycloak token
      const endpoint = `http://localhost:8080/api.medical-record/v1/appointments/simple/${patientId}/patient`;

      axios
        .get(endpoint, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((response) => {
          setAppointments(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching appointments:", err);
          setError("Failed to fetch appointments. Please try again later.");
          setLoading(false);
        });
    }
  }, [isAuthenticated, keycloak]);

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
      <h2 className="mb-4">Your Appointments</h2>
      {appointments.length === 0 ? (
        <Alert variant="info">No appointments found.</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>UCN</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Doctor's Last Name</th>
              <th>Appointment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.patient.ucn}</td>
                <td>{appointment.patient.firstName}</td>
                <td>{appointment.patient.lastName}</td>
                <td>{appointment.doctor.lastName}</td>
                <td>
                  {new Date(appointment.appointmentDate).toLocaleString()}
                </td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() =>
                      navigate(`/appointments/detailed/${appointment.id}`)
                    }
                  >
                    Info
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default PatientAppointments;
