// CreateSickLeaveModal.jsx
import React, { useContext, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { KeycloakContext } from "../keycloak/keycloak-provider";

const CreateSickLeaveModal = ({
  show,
  handleClose,
  appointmentId,
  refreshAppointments,
}) => {
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { keycloak } = useContext(KeycloakContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8080/api.medical-record/v1/sick-leaves/create",
        {
          reason,
          startDate,
          endDate,
          appointmentId,
        },
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
          },
        }
      );
      // Refresh appointments after creating sick leave
      refreshAppointments();
      handleClose();
    } catch (err) {
      setError("Failed to create sick leave. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create Sick Leave</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="reason">
            <Form.Label>Reason</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="startDate">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="endDate">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Sick Leave"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateSickLeaveModal;
