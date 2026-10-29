import Navbar from "../components/Navbar";

export default function Login() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
          <h1 className="text-2xl font-bold text-blue-800 mb-6">
            Hospital Login
          </h1>

          <input
            type="email"
            placeholder="Email Address"
            className="w-full border p-3 rounded-lg mb-4"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded-lg mb-6"
          />

          <button className="w-full bg-blue-700 text-white py-3 rounded-lg">
            Login
          </button>
        </div>
      </div>
    </>
  );
}