import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { ShieldCheck, HeartPulse, Lock } from "lucide-react";

export default function SuperAdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@gov.in");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/super-admin/login", {
        email,
        password,
      });

      localStorage.clear();
      localStorage.setItem("superAdminToken", res.data.access_token);
      localStorage.setItem("superAdminInfo", JSON.stringify(res.data.admin));

      navigate("/super-admin/dashboard");
    } catch (error) {
      alert(error?.response?.data?.detail || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      <div className="hidden lg:flex bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-800 p-14 text-white flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-white/15 p-3 rounded-2xl">
              <HeartPulse size={34} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">State HealthGrid</h1>
              <p className="text-blue-100">Super Admin Console</p>
            </div>
          </div>

          <h2 className="text-5xl font-extrabold leading-tight mt-24">
            Manage hospitals and authority credentials centrally.
          </h2>

          <p className="text-blue-100 text-lg mt-6 max-w-xl">
            Add hospitals, assign locations, create authority logins and monitor
            statewide healthcare resources.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6">
          <ShieldCheck size={40} />
          <h3 className="font-bold text-xl mt-4">Restricted Admin Access</h3>
          <p className="text-blue-100 mt-1">
            Only state-level authorized users should access this panel.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border p-8">
          <div className="bg-blue-50 text-blue-700 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
            <Lock size={34} />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900">
            Super Admin Login
          </h1>

          <p className="text-slate-500 mt-2 mb-8">
            Login to create hospitals and authority users.
          </p>

          <form onSubmit={handleLogin}>
            <input
              className="input mb-5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
            />

            <input
              className="input mb-6"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />

            <button className="btn-primary w-full">
              {loading ? "Logging in..." : "Login as Super Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}