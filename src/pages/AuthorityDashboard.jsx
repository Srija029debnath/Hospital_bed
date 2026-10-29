import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import {
  Bed,
  Building2,
  LogOut,
  Activity,
  Users,
  HeartPulse,
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowRight,
  X,
  Save,
} from "lucide-react";

export default function AuthorityDashboard() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    slug: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  async function fetchDepartments() {
    try {
      setLoading(true);
      const res = await API.get("/authority/departments");
      setDepartments(res.data);
    } catch (error) {
      alert("Unable to load departments");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("hospitalAuth");
    localStorage.removeItem("hospitalToken");
    localStorage.removeItem("hospitalInfo");
    navigate("/hospital-authority/login");
  }

  function openAddDepartment() {
    setEditingDepartment(null);
    setDepartmentForm({
      name: "",
      slug: "",
    });
    setShowDepartmentModal(true);
  }

  function openEditDepartment(department) {
    setEditingDepartment(department);
    setDepartmentForm({
      name: department.name,
      slug: department.slug,
    });
    setShowDepartmentModal(true);
  }

  function generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replaceAll(" ", "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  async function saveDepartment(e) {
    e.preventDefault();

    try {
      if (editingDepartment) {
        await API.put(`/authority/departments/${editingDepartment.id}`, {
          name: departmentForm.name,
          slug: departmentForm.slug,
        });
      } else {
        await API.post("/authority/departments", {
          name: departmentForm.name,
          slug: departmentForm.slug,
          bed_types: [],
        });
      }

      setShowDepartmentModal(false);
      fetchDepartments();
    } catch (error) {
      alert(error?.response?.data?.detail || "Unable to save department");
    }
  }

  async function deleteDepartment(department) {
    const confirmDelete = confirm(
      `Are you sure you want to delete ${department.name}? This will also delete all bed types under this department.`
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/authority/departments/${department.id}`);
      fetchDepartments();
    } catch (error) {
      alert(error?.response?.data?.detail || "Unable to delete department");
    }
  }

  const filteredDepartments = useMemo(() => {
    return departments.filter(
      (department) =>
        department.name.toLowerCase().includes(search.toLowerCase()) ||
        department.slug.toLowerCase().includes(search.toLowerCase())
    );
  }, [departments, search]);

  const totalBeds = departments.reduce((sum, d) => sum + d.total_beds, 0);
  const occupiedBeds = departments.reduce((sum, d) => sum + d.occupied_beds, 0);
  const availableBeds = departments.reduce((sum, d) => sum + d.available_beds, 0);
  const occupancy = totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <aside className="fixed hidden lg:flex left-0 top-0 h-full w-72 bg-slate-950 text-white p-6 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-xl">
              <HeartPulse size={26} />
            </div>

            <div>
              <h1 className="font-bold text-lg">HealthGrid</h1>
              <p className="text-xs text-slate-400">Authority Console</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-blue-600 px-4 py-3 rounded-xl font-semibold">
              Dashboard
            </div>

            <div className="text-slate-400 px-4 py-3 rounded-xl">
              Departments
            </div>

            <div className="text-slate-400 px-4 py-3 rounded-xl">
              Reports
            </div>

            <div className="text-slate-400 px-4 py-3 rounded-xl">
              Audit Logs
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="lg:ml-72">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-5 sticky top-0 z-40">
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Internal Management Portal
            </p>

            <h1 className="text-3xl font-extrabold text-slate-900">
              Department-wise Bed Management
            </h1>
          </div>

          <button
            onClick={openAddDepartment}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Department
          </button>
        </header>

        <div className="p-8 lg:p-10">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 mb-10">
            <DashboardCard
              title="Departments"
              value={departments.length}
              icon={<Building2 />}
            />

            <DashboardCard title="Total Beds" value={totalBeds} icon={<Bed />} />

            <DashboardCard
              title="Occupied Beds"
              value={occupiedBeds}
              icon={<Users />}
              danger
            />

            <DashboardCard
              title="Available Beds"
              value={availableBeds}
              icon={<Activity />}
              success
            />
          </div>

          <div className="grid xl:grid-cols-3 gap-8 mb-10">
            <div className="xl:col-span-2 card p-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Overall Hospital Occupancy
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Live bed usage across all hospital departments.
                  </p>
                </div>

                <span className="bg-blue-50 text-blue-700 px-5 py-2 rounded-full font-extrabold">
                  {occupancy}%
                </span>
              </div>

              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-700 to-cyan-500 rounded-full"
                  style={{ width: `${occupancy}%` }}
                />
              </div>
            </div>

            <div className="rounded-3xl p-8 bg-gradient-to-br from-blue-800 to-cyan-600 text-white shadow-xl shadow-blue-100">
              <HeartPulse size={38} />

              <h2 className="text-xl font-extrabold mt-5">
                Live Department Control
              </h2>

              <p className="text-blue-100 mt-2">
                Add, update, delete and monitor department-wise bed resources in
                real time.
              </p>
            </div>
          </div>

          <div className="card p-8">
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Departments
                </h2>

                <p className="text-slate-500 mt-1">
                  Search, add, edit, delete and manage all department bed
                  records.
                </p>
              </div>

              <div className="relative w-full xl:w-[460px]">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={21}
                />

                <input
                  className="search-input"
                  placeholder="Search department by name or URL..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-500">
                Loading departments...
              </div>
            ) : filteredDepartments.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200">
                <h3 className="text-xl font-extrabold text-slate-800">
                  No departments found
                </h3>

                <p className="text-slate-500 mt-2">
                  Add a new department to start managing beds.
                </p>

                <button
                  onClick={openAddDepartment}
                  className="btn-primary mt-6 inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Department
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredDepartments.map((department) => (
                  <DepartmentCard
                    key={department.id}
                    department={department}
                    onEdit={() => openEditDepartment(department)}
                    onDelete={() => deleteDepartment(department)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showDepartmentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8 border border-slate-200">
            <div className="flex justify-between items-center mb-7">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {editingDepartment ? "Edit Department" : "Add Department"}
                </h2>

                <p className="text-slate-500 mt-1">
                  {editingDepartment
                    ? "Update department name and secured URL."
                    : "Create a new hospital department."}
                </p>
              </div>

              <button
                onClick={() => setShowDepartmentModal(false)}
                className="bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition"
              >
                <X />
              </button>
            </div>

            <form onSubmit={saveDepartment}>
              <label className="text-sm font-semibold text-slate-600">
                Department Name
              </label>

              <input
                className="input mt-2 mb-5"
                placeholder="Example: Neurology"
                value={departmentForm.name}
                onChange={(e) => {
                  const name = e.target.value;

                  setDepartmentForm({
                    ...departmentForm,
                    name,
                    slug: editingDepartment
                      ? departmentForm.slug
                      : generateSlug(name),
                  });
                }}
                required
              />

              <label className="text-sm font-semibold text-slate-600">
                Department URL Slug
              </label>

              <input
                className="input mt-2 mb-7"
                placeholder="example: neurology"
                value={departmentForm.slug}
                onChange={(e) =>
                  setDepartmentForm({
                    ...departmentForm,
                    slug: generateSlug(e.target.value),
                  })
                }
                required
              />

              <button className="btn-primary w-full flex justify-center items-center gap-2">
                <Save size={18} />
                {editingDepartment ? "Update Department" : "Create Department"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardCard({ title, value, icon, success, danger }) {
  return (
    <div className="group card p-7 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
          success
            ? "bg-emerald-50 text-emerald-600"
            : danger
            ? "bg-red-50 text-red-600"
            : "bg-blue-50 text-blue-700"
        }`}
      >
        {icon}
      </div>

      <p className="text-slate-500 font-medium">{title}</p>

      <h2 className="text-4xl font-extrabold mt-2 text-slate-900">{value}</h2>
    </div>
  );
}

function DepartmentCard({ department, onEdit, onDelete }) {
  const percent = department.total_beds
    ? Math.round((department.occupied_beds / department.total_beds) * 100)
    : 0;

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-700 to-cyan-500" />

      <div className="flex justify-between items-start gap-5">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900">
            {department.name}
          </h3>

          <p className="text-slate-500 text-sm mt-2 break-all">
            /hospital-authority/departments/{department.slug}
          </p>
        </div>

        <span className="shrink-0 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold">
          Active
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-7">
        <MiniStat label="Total" value={department.total_beds} />
        <MiniStat label="Used" value={department.occupied_beds} />
        <MiniStat label="Free" value={department.available_beds} green />
      </div>

      <div className="mt-7">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500 font-medium">Occupancy</span>
          <span className="font-extrabold text-slate-900">{percent}%</span>
        </div>

        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-700 to-cyan-500 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-7">
        <button
          onClick={onEdit}
          className="btn-warning flex justify-center items-center gap-2"
        >
          <Pencil size={16} />
          Edit
        </button>

        <button
          onClick={onDelete}
          className="btn-danger flex justify-center items-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </button>

        <Link
          to={`/hospital-authority/departments/${department.slug}`}
          className="bg-slate-950 hover:bg-blue-700 text-white rounded-2xl py-3 font-bold flex justify-center items-center gap-2 transition"
        >
          Open
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function MiniStat({ label, value, green }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <p className="text-xs text-slate-500 font-semibold">{label}</p>

      <h4
        className={`text-xl font-extrabold mt-1 ${
          green ? "text-emerald-600" : "text-slate-900"
        }`}
      >
        {value}
      </h4>
    </div>
  );
}