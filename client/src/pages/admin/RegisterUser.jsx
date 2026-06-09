import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const RegisterUser = () => {
  const [userType, setUserType] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trainers, setTrainers] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    memberId: '',
    trainerId: '',
    fullName: '',
    email: '',
    phone: '',
    // Member specific
    dateOfBirth: '',
    gender: '',
    address: '',
    assignedTrainer: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    // Trainer specific
    specialization: '',
    experience: '',
    certifications: '',
  });

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await api.get('/admin/trainers');
        setTrainers((response.data || []).filter((trainer) => trainer.user?.isActive));
      } catch (err) {
        console.error('Failed to fetch trainers:', err);
      }
    };

    fetchTrainers();
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
      const endpoint = userType === 'trainer' ? '/admin/register-trainer' : '/admin/register-member';
      const payload = {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };

      if (userType === 'member') {
        payload.memberId = formData.memberId;
        payload.dateOfBirth = formData.dateOfBirth || undefined;
        payload.gender = formData.gender || undefined;
        payload.address = formData.address || undefined;
        payload.assignedTrainer = formData.assignedTrainer || undefined;
        payload.emergencyContact = formData.emergencyContactName || formData.emergencyContactPhone
          ? {
              name: formData.emergencyContactName,
              phone: formData.emergencyContactPhone,
            }
          : undefined;
      } else {
        payload.trainerId = formData.trainerId;
        payload.specialization = formData.specialization
          ? formData.specialization.split(',').map((s) => s.trim())
          : [];
        payload.experience = formData.experience ? parseInt(formData.experience) : 0;
        payload.certifications = formData.certifications
          ? formData.certifications.split(',').map((c) => c.trim())
          : [];
      }

      await api.post(endpoint, payload);
      alert(`${userType.charAt(0).toUpperCase() + userType.slice(1)} registered successfully!`);
      navigate(userType === 'trainer' ? '/admin/trainers' : '/admin/members');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Register New User</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setUserType('member')}
              className={`px-4 py-2 rounded ${
                userType === 'member' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Member
            </button>
            <button
              type="button"
              onClick={() => setUserType('trainer')}
              className={`px-4 py-2 rounded ${
                userType === 'trainer' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Trainer
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {userType === 'member' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member ID</label>
              <input
                type="text"
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                required
                placeholder="e.g. MEM-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {userType === 'trainer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trainer ID</label>
              <input
                type="text"
                name="trainerId"
                value={formData.trainerId}
                onChange={handleChange}
                required
                placeholder="e.g. TRN-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {userType === 'member' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Trainer</label>
                <select
                  name="assignedTrainer"
                  value={formData.assignedTrainer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {userType === 'trainer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specializations (comma-separated)
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Strength Training, Cardio, Yoga"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min={0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certifications (comma-separated)
                </label>
                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  placeholder="e.g. NASM-CPT, ACE, ISSA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterUser;
