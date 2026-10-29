import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, HeartPulse, Lock } from "lucide-react";
import API from "../api";

export default function AuthorityLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("hospitalAuth", "true");

      localStorage.setItem(
        "hospitalToken",
        response.data.access_token
      );

      localStorage.setItem(
        "hospitalInfo",
        JSON.stringify(response.data.hospital)
      );

      navigate("/hospital-authority/dashboard");
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.detail ||
          "Invalid hospital authority credentials"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-blue-900 to-cyan-700 p-14 text-white flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-white/15 p-3 rounded-2xl">
              <HeartPulse size={34} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                State HealthGrid
              </h1>

              <p className="text-blue-100">
                Internal Authority Portal
              </p>
            </div>
          </div>

          <h2 className="text-5xl font-extrabold leading-tight mt-24">
            Secure hospital data management for
            real-time public healthcare.
          </h2>

          <p className="text-blue-100 text-lg mt-6 max-w-xl">
            Manage department-wise beds,
            ICU status, emergency capacity,
            and hospital resources from a
            protected government access panel.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6">
          <div className="flex gap-4 items-center">
            <ShieldCheck size={40} />

            <div>
              <h3 className="font-bold text-xl">
                Authorized Access Only
              </h3>

              <p className="text-blue-100">
                Login activity will be monitored
                and audited.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="bg-blue-50 text-blue-700 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
            <Lock size={34} />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900">
            Hospital Authority Login
          </h1>

          <p className="text-slate-500 mt-2 mb-8">
            Please sign in using official
            hospital credentials.
          </p>

          <form onSubmit={handleLogin}>
            <label className="text-sm font-semibold text-slate-600">
              Official Email
            </label>

            <input
              type="email"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 mt-2 mb-5"
              placeholder="hospital@gov.in"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <label className="text-sm font-semibold text-slate-600">
              Password
            </label>

            <input
              type="password"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 mt-2 mb-6"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold"
            >
              {loading
                ? "Signing In..."
                : "Login Securely"}
            </button>
          </form>

          <div className="mt-6 bg-slate-50 border rounded-2xl p-4 text-sm text-slate-600">
            <strong>Demo Credentials</strong>
            <br />
            Email: hospital@gov.in
            <br />
            Password: 123456
          </div>
        </div>
      </div>
    </div>
  );
}