import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import { ArrowLeft, Building2, Bed } from "lucide-react";

export default function HospitalDetails() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospital();
  }, [id]);

  async function fetchHospital() {
    try {
      setLoading(true);
      const res = await API.get(`/public/hospitals/${id}`);
      setHospital(res.data);
    } catch (error) {
      alert("Unable to load hospital details");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-10">Loading hospital details...</div>;
  }

  if (!hospital) {
    return <div className="p-10">Hospital not found</div>;
  }

  const totalBeds = hospital.departments.reduce(
    (sum, dept) => sum + dept.total_beds,
    0
  );

  const occupiedBeds = hospital.departments.reduce(
    (sum, dept) => sum + dept.occupied_beds,
    0
  );

  const availableBeds = totalBeds - occupiedBeds;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b px-8 py-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">Live Hospital Information</p>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {hospital.hospital_name}
          </h1>
        </div>

        <Link to="/citizen" className="btn-dark flex items-center gap-2">
          <ArrowLeft size={18} />
          Back
        </Link>
      </header>

      <main className="p-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatBox title="Total Beds" value={totalBeds} />
          <StatBox title="Occupied Beds" value={occupiedBeds} danger />
          <StatBox title="Available Beds" value={availableBeds} green />
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 text-blue-700 p-3 rounded-xl">
              <Building2 />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Department-wise Availability
              </h2>
              <p className="text-slate-500">
                Live bed status updated by hospital authorities.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {hospital.departments.map((dept) => (
              <div key={dept.id} className="border rounded-2xl p-6 bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {dept.name}
                </h3>

                <div className="grid md:grid-cols-3 gap-4 mb-5">
                  <InfoBox title="Total" value={dept.total_beds} />
                  <InfoBox title="Occupied" value={dept.occupied_beds} danger />
                  <InfoBox title="Available" value={dept.available_beds} green />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {dept.bed_types.map((bed) => (
                    <div key={bed.id} className="bg-white border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bed size={18} className="text-blue-700" />
                        <h4 className="font-bold text-slate-800">
                          {bed.type_name}
                        </h4>
                      </div>

                      <p className="text-sm text-slate-500">
                        Total: {bed.total_beds}
                      </p>
                      <p className="text-sm text-slate-500">
                        Occupied: {bed.occupied_beds}
                      </p>
                      <p className="text-emerald-600 font-bold">
                        Available: {bed.available_beds}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatBox({ title, value, green, danger }) {
  return (
    <div className="card p-6">
      <p className="text-slate-500">{title}</p>
      <h2
        className={`text-4xl font-extrabold mt-2 ${
          green ? "text-emerald-600" : danger ? "text-red-600" : "text-slate-900"
        }`}
      >
        {value}
      </h2>
    </div>
  );
}

function InfoBox({ title, value, green, danger }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <h3
        className={`text-2xl font-extrabold ${
          green ? "text-emerald-600" : danger ? "text-red-600" : "text-slate-900"
        }`}
      >
        {value}
      </h3>
    </div>
  );
}