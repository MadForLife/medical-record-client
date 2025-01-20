import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Button } from "react-bootstrap";
import { KeycloakContext } from "../keycloak/keycloak-provider";
import CreateAppointmentModal from "./CreateAppointmentModal"; // Import the Create Appointment Modal
import EditAppointmentModal from "./EditAppointmentModal"; // Import the Edit Appointment Modal
import CreateDiagnoseModal from "./CreateDiagnoseModal"; // Import the Create Diagnose Modal

const AllAppointmentsByDoctorId = () => {
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false); // Manage Create Appointment Modal visibility
  const [showEditModal, setShowEditModal] = useState(false); // Manage Edit Appointment Modal visibility
  const [showCreateDiagnoseModal, setShowCreateDiagnoseModal] = useState(false); // Manage Create Diagnose Modal visibility
  const [appointmentIdToEdit, setAppointmentIdToEdit] = useState(null); // Store appointment ID for editing
  const [appointmentIdToDiagnose, setAppointmentIdToDiagnose] = useState(null); // Store appointment ID for diagnose

  useEffect(() => {
    if (isAuthenticated) {
      const doctorId = keycloak.tokenParsed.sub; // Extract the doctor ID from the token
      const endpoint = `http://localhost:8080/api.medical-record/v1/appointments/simple/${doctorId}/doctor`;

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

  const handleCreateAppointment = () => {
    setShowCreateModal(true); // Show modal when Create Appointment is clicked
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false); // Close the Create Appointment modal
  };

  const handleEditAppointment = (appointmentId) => {
    setAppointmentIdToEdit(appointmentId); // Store the ID of the appointment to be edited
    setShowEditModal(true); // Show the Edit Appointment modal
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false); // Close the Edit Appointment modal
  };

  const handleCreateDiagnose = (appointmentId) => {
    setAppointmentIdToDiagnose(appointmentId); // Store the ID of the appointment to be diagnosed
    setShowCreateDiagnoseModal(true); // Show the Create Diagnose modal
  };

  const handleCloseCreateDiagnoseModal = () => {
    setShowCreateDiagnoseModal(false); // Close the Create Diagnose modal
  };

  const refreshAppointments = () => {
    const doctorId = keycloak.tokenParsed.sub;
    const endpoint = `http://localhost:8080/api.medical-record/v1/appointments/simple/${doctorId}/doctor`;

    axios
      .get(endpoint, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      })
      .then((response) => {
        setAppointments(response.data);
      })
      .catch((err) => {
        console.error("Error fetching appointments:", err);
        setError("Failed to fetch appointments. Please try again later.");
      });
  };

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
      <h2 className="mb-4">Appointments</h2>
      <Button variant="primary" onClick={handleCreateAppointment}>
        Create Appointment
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>UCN</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Health Insured</th>
            <th>Doctor</th>
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
              <td>{appointment.patient.isHealthInsured ? "Yes" : "No"}</td>
              <td>{`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}</td>
              <td>{new Date(appointment.appointmentDate).toLocaleString()}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleEditAppointment(appointment.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="ms-2"
                  onClick={() => handleCreateDiagnose(appointment.id)}
                >
                  Create Diagnose
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="ms-2"
                  onClick={() => handleAssignPrescription(appointment.id)}
                >
                  Assign Prescription
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="ms-2"
                  onClick={() => handleDeleteAppointment(appointment.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        show={showCreateModal}
        handleClose={handleCloseCreateModal}
        doctorId={keycloak.tokenParsed.sub}
        refreshAppointments={refreshAppointments}
      />

      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        show={showEditModal}
        handleClose={handleCloseEditModal}
        appointmentId={appointmentIdToEdit}
        doctorId={keycloak.tokenParsed.sub}
        refreshAppointments={refreshAppointments}
      />

      {/* Create Diagnose Modal */}
      <CreateDiagnoseModal
        show={showCreateDiagnoseModal}
        handleClose={handleCloseCreateDiagnoseModal}
        appointmentId={appointmentIdToDiagnose}
        refreshAppointments={refreshAppointments}
      />
    </div>
  );
};

export default AllAppointmentsByDoctorId;
