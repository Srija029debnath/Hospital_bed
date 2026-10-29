import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import CitizenPortal from "./pages/CitizenPortal";
import HospitalDetails from "./pages/HospitalDetails";
import AuthorityLogin from "./pages/AuthorityLogin";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import DepartmentBeds from "./pages/DepartmentBeds";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("hospitalToken");

  if (!token) {
    return <Navigate to="/hospital-authority/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/citizen" element={<CitizenPortal />} />
      <Route path="/hospital/:id" element={<HospitalDetails />} />
      <Route path="/hospital-authority/login" element={<AuthorityLogin />} />

      <Route
        path="/hospital-authority/dashboard"
        element={
          <ProtectedRoute>
            <AuthorityDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/super-admin/login" element={<SuperAdminLogin />} />

        <Route
        path="/super-admin/dashboard"
        element={<SuperAdminDashboard />}
        />

      <Route
        path="/hospital-authority/departments/:departmentId"
        element={
          <ProtectedRoute>
            <DepartmentBeds />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;