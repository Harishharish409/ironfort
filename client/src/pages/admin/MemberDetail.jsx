import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    fetchMember();
    fetchTrainers();
    fetchPlans();
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/members/${id}`);
      setMember(response.data);
      setSelectedTrainer(response.data.assignedTrainer?._id || '');
    } catch (err) {
      setError('Failed to fetch member details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await api.get('/admin/trainers');
      setTrainers(response.data.filter((t) => t.user?.isActive));
    } catch (err) {
      console.error('Failed to fetch trainers:', err);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      setPlans(response.data);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  };

  const handleAssignTrainer = async () => {
    try {
      await api.patch(`/admin/members/${id}/assign-trainer`, { trainerId: selectedTrainer });
      alert('Trainer assigned successfully');
      fetchMember();
    } catch (err) {
      alert('Failed to assign trainer');
      console.error(err);
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

      await api.patch(`/admin/users/${member.user._id}/reset-credentials`, payload);
      alert('Credentials updated successfully');
    } catch (err) {
      alert('Failed to update credentials');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error || !member) {
    return <div className="text-red-600 text-center py-8">{error || 'Member not found'}</div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate('/admin/members')}
        className="mb-4 text-blue-600 hover:text-blue-900"
      >
        ← Back to Members
      </button>

      <h1 className="text-3xl font-bold mb-6">{member.fullName}</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600">Username:</span>
            <span className="ml-2 font-medium">{member.user?.username}</span>
          </div>
          <div>
            <span className="text-gray-600">Member ID:</span>
            <span className="ml-2 font-medium">{member.memberId || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>
            <span className="ml-2 font-medium">{member.email}</span>
          </div>
          <div>
            <span className="text-gray-600">Phone:</span>
            <span className="ml-2 font-medium">{member.phone || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Gender:</span>
            <span className="ml-2 font-medium">{member.gender || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Date of Birth:</span>
            <span className="ml-2 font-medium">
              {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Join Date:</span>
            <span className="ml-2 font-medium">
              {new Date(member.joinDate).toLocaleDateString()}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Address:</span>
            <span className="ml-2 font-medium">{member.address || 'N/A'}</span>
          </div>
          {member.emergencyContact && (
            <>
              <div>
                <span className="text-gray-600">Emergency Contact:</span>
                <span className="ml-2 font-medium">{member.emergencyContact.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Emergency Phone:</span>
                <span className="ml-2 font-medium">{member.emergencyContact.phone}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Assign Trainer</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTrainer}
            onChange={(e) => setSelectedTrainer(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No Trainer</option>
            {trainers.map((trainer) => (
              <option key={trainer._id} value={trainer.user._id}>
                {trainer.fullName} ({trainer.trainerId})
              </option>
            ))}
          </select>
          <button
            onClick={handleAssignTrainer}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Assign
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Assign Subscription Plan</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a plan</option>
            {plans.map((plan) => (
              <option key={plan._id} value={plan._id}>
                {plan.name} - ${plan.price} ({plan.duration} days)
              </option>
            ))}
          </select>
          <button
            onClick={async () => {
              if (!selectedPlan) return;
              try {
                await api.post('/subscriptions/assign', {
                  memberId: id,
                  planId: selectedPlan,
                });
                alert('Plan assigned successfully');
              } catch (err) {
                alert('Failed to assign plan');
                console.error(err);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Assign Plan
          </button>
        </div>
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

export default MemberDetail;
