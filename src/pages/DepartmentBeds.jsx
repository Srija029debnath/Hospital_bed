import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import {
  ArrowLeft,
  Save,
  ShieldCheck,
  Bed,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export default function DepartmentBeds() {
  const { departmentId } = useParams();

  const [department, setDepartment] = useState(null);
  const [bedTypes, setBedTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showBedModal, setShowBedModal] = useState(false);
  const [editingBed, setEditingBed] = useState(null);

  const [bedForm, setBedForm] = useState({
    type_name: "",
    total_beds: 0,
    occupied_beds: 0,
  });

  useEffect(() => {
    fetchDepartment();
  }, [departmentId]);

  async function fetchDepartment() {
    try {
      setLoading(true);
      const res = await API.get(`/authority/departments/${departmentId}`);
      setDepartment(res.data);
      setBedTypes(res.data.bed_types || []);
    } catch (error) {
      alert("Unable to load department");
    } finally {
      setLoading(false);
    }
  }

  function openAddBed() {
    setEditingBed(null);
    setBedForm({
      type_name: "",
      total_beds: 0,
      occupied_beds: 0,
    });
    setShowBedModal(true);
  }

  function openEditBed(bed) {
    setEditingBed(bed);
    setBedForm({
      type_name: bed.type_name,
      total_beds: bed.total_beds,
      occupied_beds: bed.occupied_beds,
    });
    setShowBedModal(true);
  }

  async function saveBed(e) {
    e.preventDefault();

    if (Number(bedForm.occupied_beds) > Number(bedForm.total_beds)) {
      alert("Occupied beds cannot be greater than total beds");
      return;
    }

    try {
      if (editingBed) {
        await API.put(`/authority/bed-types/${editingBed.id}`, {
          type_name: bedForm.type_name,
          total_beds: Number(bedForm.total_beds),
          occupied_beds: Number(bedForm.occupied_beds),
        });
      } else {
        await API.post(`/authority/departments/${department.id}/bed-types`, {
          type_name: bedForm.type_name,
          total_beds: Number(bedForm.total_beds),
          occupied_beds: Number(bedForm.occupied_beds),
        });
      }

      setShowBedModal(false);
      fetchDepartment();
    } catch (error) {
      alert(error?.response?.data?.detail || "Unable to save bed type");
    }
  }

  async function deleteBed(bed) {
    const confirmDelete = confirm(`Delete ${bed.type_name}?`);

    if (!confirmDelete) return;

    try {
      await API.delete(`/authority/bed-types/${bed.id}`);
      fetchDepartment();
    } catch (error) {
      alert(error?.response?.data?.detail || "Unable to delete bed type");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading department...</p>
      </div>
    );
  }

  if (!department) {
    return <div className="p-8">Department not found</div>;
  }

  const totalBeds = bedTypes.reduce((sum, bed) => sum + bed.total_beds, 0);
  const occupiedBeds = bedTypes.reduce((sum, bed) => sum + bed.occupied_beds, 0);
  const availableBeds = totalBeds - occupiedBeds;
  const occupancy = totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b px-8 py-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">Protected Department URL</p>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {department.name} Bed Management
          </h1>
        </div>

        <Link to="/hospital-authority/dashboard" className="btn-dark flex items-center gap-2">
          <ArrowLeft size={18} />
          Dashboard
        </Link>
      </header>

      <main className="p-8">
        <div className="bg-gradient-to-r from-blue-800 to-cyan-600 rounded-3xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck />
            <p className="font-semibold">Secured hospital authority access</p>
          </div>

          <h2 className="text-3xl font-extrabold">
            Manage live beds for {department.name}
          </h2>

          <p className="text-blue-100 mt-2">
            Add, edit, update or delete bed categories under this department.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatBox title="Total Beds" value={totalBeds} />
          <StatBox title="Occupied Beds" value={occupiedBeds} danger />
          <StatBox title="Available Beds" value={availableBeds} green />
          <StatBox title="Occupancy" value={`${occupancy}%`} />
        </div>

        <div className="card p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-blue-700 p-3 rounded-xl">
                <Bed />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Bed Type Inventory
                </h2>
                <p className="text-slate-500">
                  Manage all bed categories of this department.
                </p>
              </div>
            </div>

            <button onClick={openAddBed} className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              Add Bed Type
            </button>
          </div>

          {bedTypes.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border">
              <h3 className="text-xl font-bold text-slate-800">
                No bed types added
              </h3>
              <p className="text-slate-500 mt-2">
                Add bed types like ICU Bed, General Ward, CCU, NICU etc.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {bedTypes.map((bed) => {
                const available = bed.available_beds;
                const usage = bed.total_beds
                  ? Math.round((bed.occupied_beds / bed.total_beds) * 100)
                  : 0;

                return (
                  <div key={bed.id} className="border rounded-2xl p-6 bg-slate-50">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {bed.type_name}
                        </h3>
                        <p className="text-slate-500 text-sm">
                          Bed Type ID: {bed.id}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => openEditBed(bed)}
                          className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <button
                          onClick={() => deleteBed(bed)}
                          className="bg-red-50 text-red-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-5">
                      <InfoBox title="Total Beds" value={bed.total_beds} />
                      <InfoBox title="Occupied Beds" value={bed.occupied_beds} danger />
                      <InfoBox title="Available Beds" value={available} green />
                      <InfoBox title="Usage" value={`${usage}%`} />
                    </div>

                    <div className="mt-5 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-700" style={{ width: `${usage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showBedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {editingBed ? "Edit Bed Type" : "Add Bed Type"}
              </h2>

              <button
                onClick={() => setShowBedModal(false)}
                className="bg-slate-100 p-2 rounded-xl"
              >
                <X />
              </button>
            </div>

            <form onSubmit={saveBed}>
              <label className="text-sm font-semibold text-slate-600">
                Bed Type Name
              </label>
              <input
                className="input mt-2 mb-5"
                placeholder="Example: ICU Bed"
                value={bedForm.type_name}
                onChange={(e) =>
                  setBedForm({
                    ...bedForm,
                    type_name: e.target.value,
                  })
                }
                required
              />

              <label className="text-sm font-semibold text-slate-600">
                Total Beds
              </label>
              <input
                type="number"
                className="input mt-2 mb-5"
                value={bedForm.total_beds}
                onChange={(e) =>
                  setBedForm({
                    ...bedForm,
                    total_beds: e.target.value,
                  })
                }
                required
              />

              <label className="text-sm font-semibold text-slate-600">
                Occupied Beds
              </label>
              <input
                type="number"
                className="input mt-2 mb-6"
                value={bedForm.occupied_beds}
                onChange={(e) =>
                  setBedForm({
                    ...bedForm,
                    occupied_beds: e.target.value,
                  })
                }
                required
              />

              <button className="btn-primary w-full flex justify-center items-center gap-2">
                <Save size={18} />
                {editingBed ? "Update Bed Type" : "Create Bed Type"}
              </button>
            </form>
          </div>
        </div>
      )}
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
        className={`text-2xl font-extrabold mt-1 ${
          green ? "text-emerald-600" : danger ? "text-red-600" : "text-slate-900"
        }`}
      >
        {value}
      </h3>
    </div>
  );
}