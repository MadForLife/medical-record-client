import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Modal, Form, Button, Spinner, Alert } from "react-bootstrap";
import { KeycloakContext } from "../keycloak/keycloak-provider";

const CreateDiagnoseModal = ({
  show,
  handleClose,
  appointmentId,
  refreshAppointments,
}) => {
  const [diagnoseCodes, setDiagnoseCodes] = useState([]); // Store the list of diagnose codes
  const [selectedCodeId, setSelectedCodeId] = useState(""); // Store the selected diagnose code ID
  const [description, setDescription] = useState(""); // Store description for the new diagnose
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  const { keycloak } = useContext(KeycloakContext);

  // Fetch diagnose codes when the modal is shown
  useEffect(() => {
    if (show) {
      setLoading(true);
      axios
        .get(
          "http://localhost:8080/api.medical-record/v1/diagnose-codes/simple",
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
            },
          }
        )
        .then((response) => {
          setDiagnoseCodes(response.data); // Populate diagnose codes
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          setError("Failed to load diagnose codes.");
        });
    }
  }, [show]);

  const handleCreateDiagnose = () => {
    if (!selectedCodeId || !description) {
      setError("Please provide both a code and description for the diagnose.");
      return;
    }

    const payload = {
      appointmentId,
      diagnoseCodeId: selectedCodeId, // Use diagnoseCodeId instead of code
      description,
    };

    setLoading(true); // Show loading state

    axios
      .post(
        "http://localhost:8080/api.medical-record/v1/diagnoses/create",
        payload,
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
          },
        }
      )
      .then(() => {
        setLoading(false);
        refreshAppointments(); // Refresh the appointments list after successful diagnose creation
        handleClose(); // Close the modal
      })
      .catch((err) => {
        setLoading(false);
        setError("Failed to create diagnose. Please try again later.");
      });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create Diagnose</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading && (
          <div className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" role="status" />
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
        {!loading && (
          <Form>
            <Form.Group controlId="diagnoseCode">
              <Form.Label>Diagnose Code</Form.Label>
              <Form.Control
                as="select"
                value={selectedCodeId}
                onChange={(e) => setSelectedCodeId(e.target.value)}
              >
                <option value="">Select a diagnose code</option>
                {diagnoseCodes.map((code) => (
                  <option key={code.id} value={code.id}>
                    {code.code}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="diagnoseDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide diagnose description"
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleCreateDiagnose}>
          Create Diagnose
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateDiagnoseModal;
