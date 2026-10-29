export default function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </h2>
    </div>
  );
}