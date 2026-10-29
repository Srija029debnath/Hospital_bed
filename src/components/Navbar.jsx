import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="bg-blue-700 text-white px-8 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">State Healthcare System</h1>

      <div className="space-x-6">
        <Link to="/">Home</Link>
        <Link to="/citizen">Citizen Portal</Link>
        <Link to="/admin">Admin Dashboard</Link>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
}