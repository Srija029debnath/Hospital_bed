import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import {
  ShieldCheck,
  MapPin,
  Bed,
  Building2,
  Activity,
  ArrowRight,
  HeartPulse,
} from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({
    hospitalsOnline: 0,
    bedsAvailable: 0,
    icuAvailable: 0,
    emergencyReady: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    occupancy: 0,
  });

  useEffect(() => {
    fetchLiveStats();
  }, []);

  async function fetchLiveStats() {
    try {
      const res = await API.get("/public/hospitals");
      const hospitals = res.data || [];

      const totalBeds = hospitals.reduce(
        (sum, h) => sum + Number(h.total_beds || 0),
        0
      );

      const occupiedBeds = hospitals.reduce(
        (sum, h) => sum + Number(h.occupied_beds || 0),
        0
      );

      const bedsAvailable = hospitals.reduce(
        (sum, h) => sum + Number(h.available_beds || 0),
        0
      );

      const icuAvailable = hospitals.reduce((sum, hospital) => {
        const departments = hospital.departments || [];

        const icuBeds = departments.reduce((deptSum, dept) => {
          const bedTypes = dept.bed_types || [];

          const icuCount = bedTypes.reduce((bedSum, bed) => {
            const name = (bed.type_name || "").toLowerCase();

            if (
              name.includes("icu") ||
              name.includes("critical") ||
              name.includes("ventilator")
            ) {
              return bedSum + Number(bed.available_beds || 0);
            }

            return bedSum;
          }, 0);

          return deptSum + icuCount;
        }, 0);

        return sum + icuBeds;
      }, 0);

      const occupancy =
        totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      const emergencyReady =
        hospitals.length > 0
          ? Math.round(
              (hospitals.filter((h) => Number(h.available_beds || 0) > 0)
                .length /
                hospitals.length) *
                100
            )
          : 0;

      setStats({
        hospitalsOnline: hospitals.length,
        bedsAvailable,
        icuAvailable,
        emergencyReady,
        totalBeds,
        occupiedBeds,
        occupancy,
      });
    } catch (error) {
      console.error("Unable to fetch live stats", error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white/90 backdrop-blur border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-700 text-white p-2 rounded-xl">
            <HeartPulse size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              State HealthGrid
            </h1>
            <p className="text-xs text-slate-500">
              Healthcare & Bed Management
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <Link to="/citizen" className="text-slate-600 hover:text-blue-700">
            Citizen Portal
          </Link>

          <Link to="/hospital-authority/login" className="btn-primary">
            Authority Login
          </Link>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700" />

        <div className="relative px-8 py-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 text-white px-4 py-2 rounded-full mb-6">
              <ShieldCheck size={18} />
              Live Government Healthcare Platform
            </div>

            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Centralized Hospital Bed & Emergency Resource Management
            </h1>

            <p className="text-blue-100 text-lg mt-6 max-w-2xl">
              Citizens can search nearby hospitals, check live beds, ICU
              availability, and department-wise resources in real time.
            </p>

            <div className="flex gap-5 mt-10">
              <Link
                to="/citizen"
                className="bg-white text-blue-800 px-7 py-4 rounded-xl font-bold flex items-center gap-2"
              >
                Search Hospital <ArrowRight size={18} />
              </Link>

              <Link
                to="/hospital-authority/login"
                className="bg-slate-950 text-white px-7 py-4 rounded-xl font-bold"
              >
                Hospital Login
              </Link>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Live State Resource Snapshot
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <HeroStat
                  title="Hospitals Online"
                  value={stats.hospitalsOnline}
                />
                <HeroStat
                  title="Beds Available"
                  value={stats.bedsAvailable}
                  green
                />
                <HeroStat title="ICU Available" value={stats.icuAvailable} />
                <HeroStat
                  title="Emergency Ready"
                  value={`${stats.emergencyReady}%`}
                  green
                />
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5 border">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-slate-700">
                    State Capacity Usage
                  </span>
                  <span className="text-blue-700 font-bold">
                    {stats.occupancy}%
                  </span>
                </div>

                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-700 rounded-full"
                    style={{ width: `${stats.occupancy}%` }}
                  />
                </div>

                <p className="text-sm text-slate-500 mt-3">
                  {stats.occupiedBeds} occupied out of {stats.totalBeds} total
                  beds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-20 max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
        <FeatureCard
          icon={<MapPin />}
          title="Hospital Locator"
          text="Find nearest hospitals using location-based search."
        />

        <FeatureCard
          icon={<Bed />}
          title="Live Bed Status"
          text="Department-wise real-time bed availability."
        />

        <FeatureCard
          icon={<Building2 />}
          title="Hospital Authority URLs"
          text="Separate secured URLs for each hospital department."
        />

        <FeatureCard
          icon={<Activity />}
          title="Emergency Support"
          text="Quick access to ICU, trauma and emergency services."
        />
      </section>
    </div>
  );
}

function HeroStat({ title, value, green }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <h2
        className={`text-3xl font-extrabold mt-2 ${
          green ? "text-emerald-600" : "text-blue-700"
        }`}
      >
        {value}
      </h2>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="card p-6 hover:-translate-y-1 hover:shadow-xl transition">
      <div className="bg-blue-50 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 mt-2">{text}</p>
    </div>
  );
}