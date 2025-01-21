import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Spinner, Alert, Card, Table, Row, Col } from "react-bootstrap";
import { KeycloakContext } from "../keycloak/keycloak-provider";

const DetailedAppointment = () => {
  const { appointmentId } = useParams();
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { keycloak } = useContext(KeycloakContext);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api.medical-record/v1/appointments/detailed/${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
            },
          }
        );
        setAppointmentDetails(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching appointment details:", err);
        setError(
          "Failed to fetch appointment details. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId, keycloak]);

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

  const { patient, doctor, prescription, diagnose, appointmentDate } =
    appointmentDetails;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Detailed Appointment Information</h2>
      <Card className="shadow-lg">
        <Card.Body>
          <Row>
            <Col md={6}>
              <h5 className="text-primary">Patient Information</h5>
              <p>
                <strong>First Name:</strong> {patient.firstName}
              </p>
              <p>
                <strong>Last Name:</strong> {patient.lastName}
              </p>
            </Col>
            <Col md={6}>
              <h5 className="text-primary">Doctor Information</h5>
              <p>
                <strong>First Name:</strong> {doctor.firstName}
              </p>
              <p>
                <strong>Last Name:</strong> {doctor.lastName}
              </p>
            </Col>
          </Row>
          <hr />
          <h5 className="text-primary">Appointment Information</h5>
          <p>
            <strong>Date:</strong> {new Date(appointmentDate).toLocaleString()}
          </p>
          {prescription && (
            <>
              <hr />
              <h5 className="text-primary">Prescription</h5>
              <p>
                <strong>Description:</strong> {prescription.description}
              </p>
              <h6 className="text-secondary">Medicines</h6>
              <Table striped bordered hover className="mt-3">
                <thead className="table-primary">
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.medicines.map((medicine) => (
                    <tr key={medicine.id}>
                      <td>{medicine.name}</td>
                      <td>{medicine.description}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
          {diagnose && (
            <>
              <hr />
              <h5 className="text-primary">Diagnose</h5>
              <p>
                <strong>Description:</strong> {diagnose.description}
              </p>
              <p>
                <strong>Code:</strong> {diagnose.diagnoseCode.code}
              </p>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DetailedAppointment;
