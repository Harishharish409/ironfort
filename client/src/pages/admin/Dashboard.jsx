const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-black">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <h2 className="text-xl font-semibold text-gray-700">Total Members</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <h2 className="text-xl font-semibold text-gray-700">Total Trainers</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <h2 className="text-xl font-semibold text-gray-700">Active Subscriptions</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-600">
        <h2 className="text-xl font-semibold mb-4 text-black">Quick Actions</h2>
        <div className="space-y-2 space-x-2">
          <a
            href="/admin/add-member"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold transition"
          >
            Add Member
          </a>
          <a
            href="/admin/add-trainer"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold transition"
          >
            Add Trainer
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
