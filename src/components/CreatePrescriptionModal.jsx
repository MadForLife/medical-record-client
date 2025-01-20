import React, { useState, useEffect, useContext } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { KeycloakContext } from "../keycloak/keycloak-provider";

const CreatePrescriptionModal = ({
  show,
  handleClose,
  appointmentId,
  refreshAppointments,
}) => {
  const [description, setDescription] = useState(""); // Prescription description
  const [medicines, setMedicines] = useState([]); // List of available medicines
  const [selectedMedicines, setSelectedMedicines] = useState([]); // Selected medicines
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [medicinesLoading, setMedicinesLoading] = useState(true); // Loading state for medicines

  const { keycloak } = useContext(KeycloakContext);

  // Fetch medicines when the modal is shown
  useEffect(() => {
    if (show) {
      setMedicinesLoading(true);
      axios
        .get("http://localhost:8080/api.medical-record/v1/medicines/simple", {
          headers: {
            Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
          },
        })
        .then((response) => {
          setMedicines(response.data); // Populate medicines list
          setMedicinesLoading(false);
        })
        .catch((err) => {
          setMedicinesLoading(false);
          setError("Failed to load medicines. Please try again later.");
        });
    }
  }, [show]);

  // Handle description change
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  // Handle medicine selection
  const handleMedicineSelect = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedMedicines([...selectedMedicines, value]);
    } else {
      setSelectedMedicines(selectedMedicines.filter((id) => id !== value));
    }
  };

  // Create Prescription and Add Medicines
  const handleCreatePrescription = () => {
    if (!description || selectedMedicines.length === 0) {
      setError(
        "Please provide a description and select at least one medicine."
      );
      return;
    }

    setLoading(true); // Show loading state

    // Step 1: Create prescription
    axios
      .post(
        "http://localhost:8080/api.medical-record/v1/prescriptions/create",
        {
          description,
          appointmentId,
        },
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
          },
        }
      )
      .then((response) => {
        const prescriptionId = response.data.id;

        // Step 2: Add selected medicines to prescription
        axios
          .post(
            `http://localhost:8080/api.medical-record/v1/prescriptions/${prescriptionId}/add-medicines`,
            {
              medicineIds: selectedMedicines,
            },
            {
              headers: {
                Authorization: `Bearer ${keycloak.token}`, // Use Keycloak token
              },
            }
          )
          .then(() => {
            setLoading(false);
            refreshAppointments(); // Refresh the appointments list
            handleClose(); // Close the modal
          })
          .catch((err) => {
            setLoading(false);
            setError("Failed to add medicines. Please try again later.");
          });
      })
      .catch((err) => {
        setLoading(false);
        setError("Failed to create prescription. Please try again later.");
      });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create Prescription</Modal.Title>
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
          <>
            <Form.Group controlId="prescriptionDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Provide prescription description"
              />
            </Form.Group>

            <Form.Group controlId="medicines">
              <Form.Label>Select Medicines</Form.Label>
              {medicinesLoading ? (
                <div className="d-flex justify-content-center align-items-center">
                  <Spinner animation="border" role="status" />
                  <span className="visually-hidden">Loading medicines...</span>
                </div>
              ) : (
                <div>
                  {medicines.map((medicine) => (
                    <Form.Check
                      key={medicine.id}
                      type="checkbox"
                      label={medicine.name}
                      value={medicine.id}
                      onChange={handleMedicineSelect}
                    />
                  ))}
                </div>
              )}
            </Form.Group>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleCreatePrescription}
          disabled={!description || selectedMedicines.length === 0}
        >
          Create Prescription
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreatePrescriptionModal;
