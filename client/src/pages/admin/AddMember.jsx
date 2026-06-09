import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AddMember = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    memberId: '',
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    assignedTrainer: '',
    planId: '',
  });

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setPlansLoading(true);
        const res = await api.get('/subscriptions/plans');
        setPlans(res.data || []);
      } catch (e) {
        console.error('Failed to load plans', e);
      } finally {
        setPlansLoading(false);
      }
    };

    loadPlans();
  }, []);

  useEffect(() => {
    const loadTrainers = async () => {
      try {
        const res = await api.get('/admin/trainers');
        setTrainers((res.data || []).filter((trainer) => trainer.user?.isActive));
      } catch (e) {
        console.error('Failed to load trainers', e);
      }
    };

    loadTrainers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        memberId: formData.memberId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        assignedTrainer: formData.assignedTrainer || undefined,
      };

      // 1) Create member
      const registerRes = await api.post('/admin/register-member', payload);
      const createdMemberProfileId = registerRes?.data?.member?._id;

      // 2) Assign subscription immediately if plan selected
      if (createdMemberProfileId && formData.planId) {
        await api.post('/subscriptions/assign', {
          memberId: createdMemberProfileId,
          planId: formData.planId,
        });
      }

      alert('Member registered successfully!');
      navigate('/admin/members');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-black">Add New Member</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl border-t-4 border-green-600">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member ID <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              required
              placeholder="e.g. MEM-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Trainer</label>
            <select
              name="assignedTrainer"
              value={formData.assignedTrainer}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Do not assign now</option>
              {trainers.map((trainer) => (
                <option key={trainer._id} value={trainer.user?._id}>
                  {trainer.fullName} ({trainer.trainerId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Subscription Plan</label>
            <select
              name="planId"
              value={formData.planId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Do not assign now</option>
              {plansLoading && <option value="">Loading plans...</option>}
              {!plansLoading &&
                plans.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-400 font-semibold"
            >
              {loading ? 'Adding Member...' : 'Add Member'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/members')}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMember;
