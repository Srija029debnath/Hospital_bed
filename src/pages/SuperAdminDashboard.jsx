import { useEffect, useState } from "react";
import API from "../api";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  ShieldCheck,
  LogOut,
  MapPin,
  Map,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

const libraries = ["places"];

const defaultCenter = {
  lat: 22.5726,
  lng: 88.3639,
};

const mapContainerStyle = {
  width: "100%",
  height: "420px",
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);

  const [autocomplete, setAutocomplete] = useState(null);
  const [mapSearchAutocomplete, setMapSearchAutocomplete] = useState(null);

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [selectedLocation, setSelectedLocation] = useState(defaultCenter);

  const [form, setForm] = useState({
    hospital_name: "",
    email: "",
    password: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
  });

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  async function fetchHospitals() {
    try {
      const res = await API.get("/super-admin/hospitals");
      setHospitals(res.data || []);
    } catch (error) {
      alert("Unable to load hospitals");
    }
  }

  function openAddModal() {
    setEditingHospital(null);
    setForm({
      hospital_name: "",
      email: "",
      password: "",
      address: "",
      city: "",
      latitude: "",
      longitude: "",
    });

    setMapCenter(defaultCenter);
    setSelectedLocation(defaultCenter);
    setShowModal(true);
  }

  function openEditModal(hospital) {
    setEditingHospital(hospital);

    const lat = Number(hospital.latitude) || defaultCenter.lat;
    const lng = Number(hospital.longitude) || defaultCenter.lng;

    setForm({
      hospital_name: hospital.hospital_name || "",
      email: hospital.email || "",
      password: hospital.password || "",
      address: hospital.address || "",
      city: hospital.city || "",
      latitude: hospital.latitude || "",
      longitude: hospital.longitude || "",
    });

    setMapCenter({ lat, lng });
    setSelectedLocation({ lat, lng });
    setShowModal(true);
  }

  function extractCity(place) {
    if (!place?.address_components) return "";

    const cityComponent = place.address_components.find((component) =>
      component.types.includes("locality")
    );

    const districtComponent = place.address_components.find((component) =>
      component.types.includes("administrative_area_level_3")
    );

    const stateComponent = place.address_components.find((component) =>
      component.types.includes("administrative_area_level_1")
    );

    return (
      cityComponent?.long_name ||
      districtComponent?.long_name ||
      stateComponent?.long_name ||
      ""
    );
  }

  function fillLocationFromPlace(place) {
    if (!place?.geometry?.location) {
      alert("Please select a valid Google Maps location");
      return;
    }

    const latitude = place.geometry.location.lat();
    const longitude = place.geometry.location.lng();

    const location = {
      lat: latitude,
      lng: longitude,
    };

    setMapCenter(location);
    setSelectedLocation(location);

    setForm((prev) => ({
      ...prev,
      address: place.formatted_address || place.name || "",
      city: extractCity(place),
      latitude: String(latitude),
      longitude: String(longitude),
    }));
  }

  function handlePlaceChanged() {
    if (!autocomplete) return;
    fillLocationFromPlace(autocomplete.getPlace());
  }

  function handleMapSearchChanged() {
    if (!mapSearchAutocomplete) return;
    fillLocationFromPlace(mapSearchAutocomplete.getPlace());
  }

  async function reverseGeocode(lat, lng) {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      {
        location: { lat, lng },
      },
      (results, status) => {
        if (status === "OK" && results?.[0]) {
          const place = results[0];

          setForm((prev) => ({
            ...prev,
            address: place.formatted_address || "",
            city: extractCity(place),
            latitude: String(lat),
            longitude: String(lng),
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            latitude: String(lat),
            longitude: String(lng),
          }));
        }
      }
    );
  }

  function handleMapClick(event) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    const location = { lat, lng };

    setSelectedLocation(location);
    setMapCenter(location);
    reverseGeocode(lat, lng);
  }

  function confirmMapLocation() {
    setForm((prev) => ({
      ...prev,
      latitude: String(selectedLocation.lat),
      longitude: String(selectedLocation.lng),
    }));

    setShowMapPicker(false);
  }

  async function saveHospital(e) {
    e.preventDefault();

    if (!form.latitude || !form.longitude) {
      alert("Please select hospital location from Google Map");
      return;
    }

    try {
      if (editingHospital) {
        await API.put(`/super-admin/hospitals/${editingHospital.id}`, form);
      } else {
        await API.post("/super-admin/hospitals", form);
      }

      setShowModal(false);
      fetchHospitals();
    } catch (error) {
      alert(error?.response?.data?.detail || "Unable to save hospital");
    }
  }

  async function deleteHospital(hospital) {
    const ok = confirm(
      `Delete ${hospital.hospital_name}? This will also remove its departments and beds.`
    );

    if (!ok) return;

    try {
      await API.delete(`/super-admin/hospitals/${hospital.id}`);
      fetchHospitals();
    } catch (error) {
      alert(error?.response?.data?.detail || "Unable to delete hospital");
    }
  }

  function logout() {
    localStorage.removeItem("superAdminToken");
    localStorage.removeItem("superAdminInfo");
    navigate("/super-admin/login");
  }

  const filteredHospitals = hospitals.filter((hospital) => {
    const text = `
      ${hospital.hospital_name || ""}
      ${hospital.email || ""}
      ${hospital.city || ""}
      ${hospital.address || ""}
    `;

    return text.toLowerCase().includes(search.toLowerCase());
  });

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-8">
        <div className="bg-white rounded-3xl shadow-xl border p-8 max-w-xl">
          <h1 className="text-2xl font-extrabold text-red-600">
            Google Maps failed to load
          </h1>
          <p className="text-slate-600 mt-3">
            Check your Google Maps API key, billing, Maps JavaScript API, Places
            API, Geocoding API, and localhost restriction.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <aside className="fixed hidden lg:flex left-0 top-0 h-full w-72 bg-slate-950 text-white p-6 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-blue-600 p-2 rounded-xl">
              <ShieldCheck size={26} />
            </div>

            <div>
              <h1 className="font-bold text-lg">State Super Admin</h1>
              <p className="text-xs text-slate-400">
                Government Control Panel
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-blue-600 px-4 py-3 rounded-xl font-semibold">
              Hospitals
            </div>
            <div className="text-slate-400 px-4 py-3 rounded-xl">
              Credentials
            </div>
            <div className="text-slate-400 px-4 py-3 rounded-xl">Reports</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="lg:ml-72">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-5 sticky top-0 z-40">
          <div>
            <p className="text-sm text-slate-500 font-medium">
              State Level Administration
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Hospital Management Panel
            </h1>
          </div>

          <button
            onClick={openAddModal}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add New Hospital
          </button>
        </header>

        <div className="p-8 lg:p-10">
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <StatCard title="Total Hospitals" value={hospitals.length} />
            <StatCard
              title="Total Departments"
              value={hospitals.reduce(
                (sum, h) => sum + Number(h.departments_count || 0),
                0
              )}
            />
            <StatCard title="Active Credentials" value={hospitals.length} />
          </div>

          <div className="card p-8">
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Registered Hospitals
                </h2>
                <p className="text-slate-500 mt-1">
                  Add hospitals, create authority login credentials and manage
                  Google Maps location data.
                </p>
              </div>

              <div className="relative w-full xl:w-[460px]">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                  size={21}
                />

                <input
                  className="search-input"
                  placeholder="Search hospital, city, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredHospitals.map((hospital) => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  onEdit={() => openEditModal(hospital)}
                  onDelete={() => deleteHospital(hospital)}
                />
              ))}
            </div>

            {filteredHospitals.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border">
                <h3 className="text-xl font-extrabold text-slate-900">
                  No hospitals found
                </h3>
                <p className="text-slate-500 mt-2">
                  Add a new hospital to create authority credentials.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl p-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-7">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {editingHospital ? "Edit Hospital" : "Add New Hospital"}
                </h2>
                <p className="text-slate-500 mt-1">
                  Create hospital profile, login credentials and map location.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="bg-slate-100 hover:bg-slate-200 p-2 rounded-xl"
              >
                <X />
              </button>
            </div>

            <form onSubmit={saveHospital}>
              <div className="grid md:grid-cols-2 gap-5">
                <Field
                  label="Hospital Name"
                  value={form.hospital_name}
                  onChange={(value) =>
                    setForm({ ...form, hospital_name: value })
                  }
                  placeholder="Example: District Government Hospital"
                />

                <Field
                  label="Authority Email"
                  value={form.email}
                  onChange={(value) => setForm({ ...form, email: value })}
                  placeholder="hospital@gov.in"
                />

                <Field
                  label="Authority Password"
                  value={form.password}
                  onChange={(value) => setForm({ ...form, password: value })}
                  placeholder="Create password"
                />

                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Google Location Search
                  </label>

                  {isLoaded ? (
                    <Autocomplete
                      onLoad={(auto) => setAutocomplete(auto)}
                      onPlaceChanged={handlePlaceChanged}
                    >
                      <input
                        className="input mt-2"
                        placeholder="Search hospital/place on Google Maps"
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      className="input mt-2"
                      placeholder="Loading Google location search..."
                      disabled
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-5 py-4 rounded-2xl font-extrabold flex justify-center items-center gap-2 border border-blue-100"
                  >
                    <Map size={20} />
                    Select Location from Google Map
                  </button>
                </div>

                <div className="md:col-span-2">
                  <Field
                    label="Hospital Address"
                    value={form.address}
                    onChange={(value) => setForm({ ...form, address: value })}
                    placeholder="Auto-filled from Google Maps"
                  />
                </div>

                <Field
                  label="City"
                  value={form.city}
                  onChange={(value) => setForm({ ...form, city: value })}
                  placeholder="Auto-filled city"
                />

                <Field
                  label="Latitude"
                  value={form.latitude}
                  onChange={(value) => setForm({ ...form, latitude: value })}
                  placeholder="Auto-filled latitude"
                />

                <Field
                  label="Longitude"
                  value={form.longitude}
                  onChange={(value) => setForm({ ...form, longitude: value })}
                  placeholder="Auto-filled longitude"
                />
              </div>

              <button className="btn-primary w-full mt-8 flex justify-center items-center gap-2">
                <Save size={18} />
                {editingHospital ? "Update Hospital" : "Create Hospital"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showMapPicker && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl p-7 border border-slate-200">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Select Hospital Location
                </h2>
                <p className="text-slate-500">
                  Search a place or click directly on the map. Address,
                  latitude and longitude will be auto-filled.
                </p>
              </div>

              <button
                onClick={() => setShowMapPicker(false)}
                className="bg-slate-100 hover:bg-slate-200 p-2 rounded-xl"
              >
                <X />
              </button>
            </div>

            <div className="mb-5">
              {isLoaded ? (
                <Autocomplete
                  onLoad={(auto) => setMapSearchAutocomplete(auto)}
                  onPlaceChanged={handleMapSearchChanged}
                >
                  <div className="relative">
                    <Search
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                      size={22}
                    />
                    <input
                      className="search-input"
                      placeholder="Search hospital or location on Google Maps..."
                    />
                  </div>
                </Autocomplete>
              ) : (
                <input
                  className="search-input"
                  placeholder="Loading Google Maps..."
                  disabled
                />
              )}
            </div>

            {isLoaded && (
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={14}
                  onClick={handleMapClick}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                  }}
                >
                  <Marker
                    position={selectedLocation}
                    draggable
                    onDragEnd={handleMapClick}
                  />
                </GoogleMap>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4 mt-5">
              <div className="bg-slate-50 border rounded-2xl p-4 md:col-span-2">
                <p className="text-xs text-slate-500 font-semibold">
                  Selected Address
                </p>
                <p className="font-bold text-slate-800 mt-1">
                  {form.address || "Select a location from map"}
                </p>
              </div>

              <div className="bg-slate-50 border rounded-2xl p-4">
                <p className="text-xs text-slate-500 font-semibold">
                  Latitude / Longitude
                </p>
                <p className="font-bold text-slate-800 mt-1">
                  {form.latitude || selectedLocation.lat},{" "}
                  {form.longitude || selectedLocation.lng}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={confirmMapLocation}
              className="btn-primary w-full mt-6 flex justify-center items-center gap-2"
            >
              <CheckCircle size={20} />
              Use This Location
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="card p-7">
      <div className="bg-blue-50 text-blue-700 w-14 h-14 rounded-2xl flex items-center justify-center mb-5">
        <Building2 />
      </div>
      <p className="text-slate-500 font-medium">{title}</p>
      <h2 className="text-4xl font-extrabold text-slate-900 mt-2">{value}</h2>
    </div>
  );
}

function HospitalCard({ hospital, onEdit, onDelete }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-100 transition-all">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-700 to-cyan-500" />

      <div className="flex gap-4">
        <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl h-fit">
          <Building2 size={28} />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {hospital.hospital_name}
          </h3>
          <p className="text-slate-500 text-sm mt-1">{hospital.email}</p>
        </div>
      </div>

      <div className="mt-5 bg-slate-50 rounded-2xl p-4 border">
        <p className="text-sm text-slate-500 flex gap-2">
          <MapPin size={16} />
          {hospital.address || "No address added"}
        </p>

        <p className="text-sm text-slate-500 mt-2">
          City: <b>{hospital.city || "N/A"}</b>
        </p>

        <p className="text-sm text-slate-500 mt-2">
          Lat/Lng:{" "}
          <b>
            {hospital.latitude || "N/A"}, {hospital.longitude || "N/A"}
          </b>
        </p>

        <p className="text-sm text-slate-500 mt-2">
          Departments: <b>{hospital.departments_count || 0}</b>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
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
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-600">{label}</label>
      <input
        className="input mt-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
      />
    </div>
  );
}