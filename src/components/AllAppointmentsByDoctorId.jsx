import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Container,
  Table,
  Spinner,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { KeycloakContext } from "../keycloak/keycloak-provider";
import CreateAppointmentModal from "./CreateAppointmentModal.jsx"; // Import the CreateAppointmentModal component

const AllAppointmentsByDoctorId = () => {
  const { keycloak, isAuthenticated } = useContext(KeycloakContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [patientId, setPatientId] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      if (isAuthenticated) {
        try {
          const doctorId = keycloak.tokenParsed?.sub;
          const apiUrl = `http://localhost:8080/api.medical-record/v1/appointments/simple/${doctorId}/doctor`;

          const response = await axios.get(apiUrl, {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
            },
          });

          setAppointments(response.data);
        } catch (err) {
          console.error(err);
          setError("Failed to fetch appointments. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAppointments();
  }, [keycloak, isAuthenticated]);

  const handleShowModal = (appointment = null) => {
    if (appointment) {
      setEditMode(true);
      setCurrentAppointment(appointment);
      setPatientId(appointment.patient.id);
      setAppointmentDate(appointment.appointmentDate);
    } else {
      setEditMode(false);
      setPatientId("");
      setAppointmentDate("");
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setAppointmentDate("");
    setPatientId("");
    setCurrentAppointment(null);
  };

  const handleSaveAppointment = async () => {
    const apiUrl = editMode
      ? `http://localhost:8080/api.medical-record/v1/appointments/${currentAppointment.id}`
      : "http://localhost:8080/api.medical-record/v1/appointments"; // Update API path if needed

    try {
      const response = editMode
        ? await axios.put(
            apiUrl,
            {
              patientId,
              appointmentDate,
            },
            {
              headers: {
                Authorization: `Bearer ${keycloak.token}`,
              },
            }
          )
        : await axios.post(
            apiUrl,
            {
              patientId,
              appointmentDate,
            },
            {
              headers: {
                Authorization: `Bearer ${keycloak.token}`,
              },
            }
          );

      // Reload appointments after saving
      setAppointments((prevAppointments) =>
        editMode
          ? prevAppointments.map((appt) =>
              appt.id === response.data.id ? response.data : appt
            )
          : [...prevAppointments, response.data]
      );
      handleCloseModal();
    } catch (err) {
      console.error(err);
      setError("Failed to save the appointment.");
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8080/api.medical-record/v1/appointments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        }
      );

      setAppointments(
        appointments.filter((appointment) => appointment.id !== id)
      );
    } catch (err) {
      console.error(err);
      setError("Failed to delete the appointment.");
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading appointments...</p>
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
      <h2>Appointments</h2>
      <Button variant="primary" onClick={() => handleShowModal()}>
        Create Appointment
      </Button>
      {appointments.length > 0 ? (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>#</th>
              <th>Ucn</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Health Insured</th>
              <th>Doctor</th>
              <th>Appointment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment, index) => (
              <tr key={appointment.id}>
                <td>{index + 1}</td>
                <td>{appointment.patient.ucn}</td>
                <td>{appointment.patient.firstName}</td>
                <td>{appointment.patient.lastName}</td>
                <td>{appointment.patient.isHealthInsured ? "Yes" : "No"}</td>
                <td>{`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}</td>
                <td>{appointment.appointmentDate}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleShowModal(appointment)}
                  >
                    Edit
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
      ) : (
        <p>No appointments found.</p>
      )}

      {/* Appointment Modal */}
      <CreateAppointmentModal
        show={showModal}
        handleClose={handleCloseModal}
        editMode={editMode}
        currentAppointment={currentAppointment}
        patientId={patientId}
        appointmentDate={appointmentDate}
        setPatientId={setPatientId}
        setAppointmentDate={setAppointmentDate}
      />
    </Container>
  );
};

export default AllAppointmentsByDoctorId;
