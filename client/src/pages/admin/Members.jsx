import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/members');
      setMembers(response.data);
    } catch (err) {
      setError('Failed to fetch members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeMembers = members.filter((m) => m.user?.isActive);
  const inactiveMembers = members.filter((m) => !m.user?.isActive);


  const handleRemove = async (memberId) => {
    const reason = prompt('Please enter the reason for removal:');
    if (!reason) return;

    try {
      await api.delete(`/admin/members/${memberId}`, { data: { reason } });
      fetchMembers();
    } catch (err) {
      alert('Failed to remove member');
      console.error(err);
    }
  };

  const handleHardDelete = async (memberId) => {
    const confirmDelete = window.confirm(
      'Hard delete this inactive member? This will permanently remove the record.'
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/members/${memberId}/hard`);
      fetchMembers();
    } catch (err) {
      alert('Failed to hard delete member');
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
        <h1 className="text-3xl font-bold text-black">Members</h1>
        <Link
          to="/admin/add-member"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold transition"
        >
          + Add Member
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
                Member ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Trainer
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
            {[...activeMembers, ...inactiveMembers].map((member) => (
              <tr key={member._id} className="hover:bg-gray-50">

                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/admin/members/${member._id}`}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    {member.fullName}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {member.user?.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                  {member.memberId || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {member.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {member.assignedTrainer?.username || 'Not assigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.user?.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {member.user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    to={`/admin/members/${member._id}`}
                    className="text-green-600 hover:text-green-800 font-semibold"
                  >
                    View
                  </Link>
                  {member.user?.isActive ? (
                    <button
                      onClick={() => handleRemove(member._id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => handleHardDelete(member._id)}
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
        {members.length === 0 && (
          <div className="text-center py-8 text-gray-500">No members found</div>
        )}
      </div>
    </div>
  );
};

export default Members;
