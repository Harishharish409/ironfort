import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Trainees = () => {
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        setLoading(true);
        const response = await api.get('/trainer/trainees');
        setTrainees(response.data || []);
      } catch (err) {
        console.error('Failed to fetch trainees:', err);
        setError(err.response?.data?.message || 'Failed to fetch trainees');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainees();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Trainees</h1>
        <span className="text-sm font-semibold text-gray-500">{trainees.length} assigned</span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Member ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {trainees.map((trainee) => (
              <tr key={trainee._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{trainee.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{trainee.memberId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{trainee.user?.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{trainee.phone || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/trainer/trainees/${trainee.memberId}`}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trainees.length === 0 && (
          <div className="text-center py-8 text-gray-500">No trainees assigned yet</div>
        )}
      </div>
    </div>
  );
};

export default Trainees;
