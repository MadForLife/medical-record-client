import AppNavbar from "./components/Navbar";
import ListPatients from "./components/ListPatients";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AllPatients from "./components/AllPatients";
import AllDoctors from "./components/AllDoctors";
import Home from "./components/Home";
import AllDoctorsWithSpecialities from "./components/AllDoctorsWithSpecialities";
import AllAppointmentsByDoctorId from "./components/AllAppointmentsByDoctorId";
import PatientAppointments from "./components/PatientAppointments";
import DetailedAppointment from "./components/DetailedAppointment";
import PatientDiagnoseComponent from "./components/PatientDiagnoseComponent";
import PatientsByDoctorComponent from "./components/PatientsByDoctorComponent";
import MostFrequentDiagnoses from "./components/MostFrequentDiagnose";
import DoctorsWithPatientCount from "./components/DoctorsWithPatientCount";

function App() {
  return (
    <Router>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patients/my" element={<ListPatients />} />
        <Route path="/patients/all" element={<AllPatients />} />
        <Route path="/doctors/all" element={<AllDoctors />} />
        <Route
          path="/doctors/with-specialities"
          element={<AllDoctorsWithSpecialities />}
        />
        <Route
          path="/appointments/by-doctor"
          element={<AllAppointmentsByDoctorId />}
        />
        <Route path="/appointments/patient" element={<PatientAppointments />} />
        <Route
          path="/appointments/detailed/:appointmentId"
          element={<DetailedAppointment />}
        />
        <Route
          path="/patients/diagnoses"
          element={<PatientDiagnoseComponent />}
        />
        <Route
          path="/patients/by-doctor"
          element={<PatientsByDoctorComponent />}
        />
        <Route
          path="/diagnoses/most-frequent"
          element={<MostFrequentDiagnoses />}
        />
        <Route
          path="/doctors/patient-count"
          element={<DoctorsWithPatientCount />}
        />
      </Routes>
    </Router>
  );
}

export default App;
