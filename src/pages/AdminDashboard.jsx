import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import { hospitals } from "../data/hospitals";

export default function AdminDashboard() {
  const hospital = hospitals[0];

  return (
    <>
      <Navbar />

      <div className="p-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">
          Hospital Administration Dashboard
        </h1>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Beds" value={hospital.beds.total} color="text-blue-700" />
          <StatCard title="Occupied Beds" value={hospital.beds.occupied} color="text-red-600" />
          <StatCard title="Available Beds" value={hospital.beds.available} color="text-green-600" />
          <StatCard title="Doctors Available" value={hospital.doctorsAvailable} color="text-purple-600" />
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Update Bed Inventory</h2>

          <form className="grid md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Total Beds"
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="Occupied Beds"
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="Available Beds"
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="ICU Beds"
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="General Beds"
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="Pediatric Beds"
              className="border p-3 rounded-lg"
            />

            <button
              type="button"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Update Inventory
            </button>
          </form>
        </div>
      </div>
    </>
  );
}