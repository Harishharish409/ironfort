import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const TrainerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrainer();
  }, [id]);

  const fetchTrainer = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/trainers/${id}`);
      setTrainer(response.data);
    } catch (err) {
      setError('Failed to fetch trainer details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetCredentials = async () => {
    const newUsername = prompt('Enter new username (leave blank to keep current):');
    const newPassword = prompt('Enter new password (leave blank to keep current):');

    if (!newUsername && !newPassword) {
      return;
    }

    try {
      const payload = {};
      if (newUsername) payload.newUsername = newUsername;
      if (newPassword) payload.newPassword = newPassword;

      await api.patch(`/admin/users/${trainer.user._id}/reset-credentials`, payload);
      alert('Credentials updated successfully');
    } catch (err) {
      alert('Failed to update credentials');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error || !trainer) {
    return <div className="text-red-600 text-center py-8">{error || 'Trainer not found'}</div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate('/admin/trainers')}
        className="mb-4 text-blue-600 hover:text-blue-900"
      >
        ← Back to Trainers
      </button>

      <h1 className="text-3xl font-bold mb-6">{trainer.fullName}</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600">Username:</span>
            <span className="ml-2 font-medium">{trainer.user?.username}</span>
          </div>
          <div>
            <span className="text-gray-600">Trainer ID:</span>
            <span className="ml-2 font-medium">{trainer.trainerId || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>
            <span className="ml-2 font-medium">{trainer.email}</span>
          </div>
          <div>
            <span className="text-gray-600">Phone:</span>
            <span className="ml-2 font-medium">{trainer.phone || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Experience:</span>
            <span className="ml-2 font-medium">{trainer.experience} years</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Specializations:</span>
            <div className="ml-2 mt-1 flex flex-wrap gap-2">
              {trainer.specialization?.map((spec, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Certifications:</span>
            <div className="ml-2 mt-1 flex flex-wrap gap-2">
              {trainer.certifications?.map((cert, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Assigned Members ({trainer.assignedMembers?.length || 0})</h2>
        {trainer.assignedMembers?.length > 0 ? (
          <div className="space-y-2">
            {trainer.assignedMembers.map((member) => (
              <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">{member.fullName} ({member.memberId || 'N/A'})</span>
                <span className="text-gray-600">{member.email}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No members assigned</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
        <button
          onClick={handleResetCredentials}
          className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
        >
          Reset Credentials
        </button>
      </div>
    </div>
  );
};

export default TrainerDetail;
