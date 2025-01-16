import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Table, Container, Spinner } from "react-bootstrap";
import { KeycloakContext } from "../keycloak/keycloak-provider";

const AllDoctors = () => {
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (isAuthenticated) {
        try {
          const apiUrl = `http://localhost:8080/api.medical-record/v1/doctors/simple`; // Replace with actual API endpoint

          const response = await axios.get(apiUrl, {
            headers: {
              Authorization: `Bearer ${keycloak.token}`, // Include Keycloak token
            },
          });

          setDoctors(response.data); // Set the fetched doctors
        } catch (err) {
          console.error(err);
          setError("Failed to fetch doctors. Please try again.");
        } finally {
          setLoading(false); // Stop loading indicator
        }
      }
    };

    fetchDoctors();
  }, [keycloak, isAuthenticated]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading doctors...</p>
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
      <h2>Doctor List</h2>
      {doctors.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Doctor ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Is Personal Doctor</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor, index) => (
              <tr key={doctor.id}>
                <td>{index + 1}</td>
                <td style={{ wordWrap: "break-word", maxWidth: "200px" }}>
                  {doctor.id}
                </td>
                <td>{doctor.firstName}</td>
                <td>{doctor.lastName}</td>
                <td>{doctor.isPersonalDoctor ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No doctors found.</p>
      )}
    </Container>
  );
};

export default AllDoctors;
