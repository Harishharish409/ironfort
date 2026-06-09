import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/trainers');
      setTrainers(response.data);
    } catch (err) {
      setError('Failed to fetch trainers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeTrainers = trainers.filter((t) => t.user?.isActive);
  const inactiveTrainers = trainers.filter((t) => !t.user?.isActive);


  const handleRemove = async (trainerId) => {
    const reason = prompt('Please enter the reason for removal:');
    if (!reason) return;

    try {
      await api.delete(`/admin/trainers/${trainerId}`, { data: { reason } });
      fetchTrainers();
    } catch (err) {
      alert('Failed to remove trainer');
      console.error(err);
    }
  };

  const handleHardDelete = async (trainerId) => {
    const confirmDelete = window.confirm(
      'Hard delete this inactive trainer? This will permanently remove the record.'
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/trainers/${trainerId}/hard`);
      fetchTrainers();
    } catch (err) {
      alert('Failed to hard delete trainer');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Trainers</h1>
        <Link
          to="/admin/add-trainer"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold transition"
        >
          + Add Trainer
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden border-t-4 border-green-600">
        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="text-sm text-gray-700">
            Showing: Active first, then Inactive (inactive can be hard deleted)
          </div>
        </div>
        <table className="min-w-full">

          <thead className="bg-black text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Trainer ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Assigned Members
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...activeTrainers, ...inactiveTrainers].map((trainer) => (
              <tr key={trainer._id} className="hover:bg-gray-50">

                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/admin/trainers/${trainer._id}`}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    {trainer.fullName}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {trainer.user?.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                  {trainer.trainerId || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {trainer.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {trainer.assignedMembers?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      trainer.user?.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {trainer.user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    to={`/admin/trainers/${trainer._id}`}
                    className="text-green-600 hover:text-green-800 font-semibold"
                  >
                    View
                  </Link>
                  {trainer.user?.isActive ? (
                    <button
                      onClick={() => handleRemove(trainer._id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => handleHardDelete(trainer._id)}
                      className="text-red-700 hover:text-red-900 font-semibold"
                    >
                      Hard Delete
                    </button>
                  )}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trainers.length === 0 && (
          <div className="text-center py-8 text-gray-500">No trainers found</div>
        )}

      </div>
    </div>
  );
};

export default Trainers;
