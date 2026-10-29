import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import {
  Search,
  MapPin,
  Bed,
  Building2,
  Navigation,
  LocateFixed,
  HeartPulse,
} from "lucide-react";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";

const libraries = ["places"];

const defaultCenter = {
  lat: 22.5726,
  lng: 88.3639,
};

const mapContainerStyle = {
  width: "100%",
  height: "720px",
};

export default function CitizenPortal() {
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [locationText, setLocationText] = useState("Kolkata, West Bengal");
  const [autocomplete, setAutocomplete] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  async function fetchHospitals() {
    try {
      const res = await API.get("/public/hospitals");
      console.log("Hospitals from backend:", res.data);
      setHospitals(res.data || []);
    } catch (error) {
      console.error("Hospital API error:", error);
      alert("Backend hospital API is not working");
    }
  }

  function detectCurrentLocation() {
    setLoadingLocation(true);

    if (!navigator.geolocation) {
      setLocationText("Location not supported");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(loc);
        setLocationText("Using your current location");
        setLoadingLocation(false);
      },
      () => {
        setLocationText("Location permission denied. Showing Kolkata.");
        setUserLocation(defaultCenter);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  function onPlaceChanged() {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      return;
    }

    const loc = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setUserLocation(loc);
    setLocationText(place.formatted_address || place.name || "Selected location");
  }

  function getDistanceKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    return (R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))).toFixed(1);
  }

  const filteredHospitals = useMemo(() => {
    return hospitals
      .filter((hospital) => {
        const text = `
          ${hospital.hospital_name || ""}
          ${hospital.address || ""}
          ${hospital.city || ""}
          ${(hospital.departments || []).map((d) => d.name).join(" ")}
        `;

        return text.toLowerCase().includes(search.toLowerCase());
      })
      .map((hospital) => {
        const lat = Number(hospital.latitude);
        const lng = Number(hospital.longitude);

        return {
          ...hospital,
          lat,
          lng,
          distance: getDistanceKm(userLocation.lat, userLocation.lng, lat, lng),
        };
      })
      .filter((hospital) => Number.isFinite(hospital.lat) && Number.isFinite(hospital.lng))
      .sort((a, b) => Number(a.distance || 9999) - Number(b.distance || 9999));
  }, [hospitals, search, userLocation]);

  if (loadError) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold text-red-600">
          Google Maps failed to load
        </h1>
        <p>Check API key, billing, Maps JavaScript API and Places API.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-700 text-white">
        <div className="relative px-8 py-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/15 p-3 rounded-2xl">
              <HeartPulse size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold">
                Find Nearby Government Hospitals
              </h1>
              <p className="text-blue-100">
                Live beds, ICU availability and department-wise resources
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-5 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="relative w-full">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                  size={22}
                />
                <input
                  className="search-input"
                  placeholder="Search hospital, department, treatment..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {isLoaded ? (
                <Autocomplete
                  onLoad={(auto) => setAutocomplete(auto)}
                  onPlaceChanged={onPlaceChanged}
                >
                  <div className="relative w-full">
                    <MapPin
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                      size={22}
                    />
                    <input
                      className="search-input"
                      placeholder="Type your location manually..."
                    />
                  </div>
                </Autocomplete>
              ) : (
                <input className="search-input" placeholder="Loading map..." disabled />
              )}
            </div>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-5">
              <div className="flex items-center gap-2 text-slate-600">
                <LocateFixed size={18} className="text-blue-700" />
                <span>{locationText}</span>
              </div>

              <button
                onClick={detectCurrentLocation}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <Navigation size={18} />
                {loadingLocation ? "Detecting..." : "Use Current Location"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="grid xl:grid-cols-5 gap-8">
          <section className="xl:col-span-3 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Nearby Hospitals
            </h2>

            {filteredHospitals.length === 0 ? (
              <div className="bg-white rounded-[32px] border border-slate-200 p-10 text-center shadow-sm">
                <h3 className="text-xl font-extrabold text-slate-900">
                  No hospitals found
                </h3>
                <p className="text-slate-500 mt-2">
                  Check if backend is running and /public/hospitals returns data.
                </p>
              </div>
            ) : (
              filteredHospitals.map((hospital) => (
                <HospitalCard key={hospital.id} hospital={hospital} />
              ))
            )}
          </section>

          <section className="xl:col-span-2">
            <div className="sticky top-8 rounded-[32px] overflow-hidden border border-slate-200 shadow-xl bg-white">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={defaultCenter}
                  zoom={12}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                  }}
                >
                  <Marker position={userLocation} title="Selected Location" />

                  {filteredHospitals.map((hospital) => (
                    <Marker
                      key={hospital.id}
                      position={{
                        lat: hospital.lat,
                        lng: hospital.lng,
                      }}
                      title={hospital.hospital_name}
                    />
                  ))}
                </GoogleMap>
              ) : (
                <div className="h-[720px] flex items-center justify-center">
                  Loading map...
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function HospitalCard({ hospital }) {
  return (
    <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-100 transition-all">
      <div className="flex justify-between gap-5">
        <div className="flex gap-4">
          <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl h-fit">
            <Building2 size={30} />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {hospital.hospital_name}
            </h3>

            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <MapPin size={16} />
              {hospital.address || "Government Hospital"}
            </p>

            {hospital.distance && (
              <p className="text-blue-700 font-bold mt-2">
                {hospital.distance} km away
              </p>
            )}
          </div>
        </div>

        <span className="h-fit bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-bold">
          Live
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-7">
        <MiniStat title="Total Beds" value={hospital.total_beds} />
        <MiniStat title="Occupied" value={hospital.occupied_beds} />
        <MiniStat title="Available" value={hospital.available_beds} green />
      </div>

      <Link
        to={`/hospital/${hospital.id}`}
        className="btn-primary mt-7 w-full flex justify-center items-center gap-2"
      >
        <Bed size={18} />
        View Live Bed Details
      </Link>
    </div>
  );
}

function MiniStat({ title, value, green }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <p className="text-xs text-slate-500 font-semibold">{title}</p>
      <h3
        className={`text-2xl font-extrabold mt-1 ${
          green ? "text-emerald-600" : "text-slate-900"
        }`}
      >
        {value}
      </h3>
    </div>
  );
}