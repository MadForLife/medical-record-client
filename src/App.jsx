import AppNavbar from "./components/Navbar";
import ListPatients from "./components/ListPatients";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AllPatients from "./components/AllPatients";
import AllDoctors from "./components/AllDoctors";
import Home from "./components/Home";
import AllDoctorsWithSpecialities from "./components/AllDoctorsWithSpecialities";

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
      </Routes>
    </Router>
  );
}

export default App;
