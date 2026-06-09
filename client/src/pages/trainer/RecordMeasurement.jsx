import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const RecordMeasurement = () => {
  const navigate = useNavigate();
  const [trainees, setTrainees] = useState([]);
  const [traineesLoading, setTraineesLoading] = useState(true);
  const [formData, setFormData] = useState({
    memberId: '',
    date: '',
    weight: '',
    height: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
    bodyFat: '',
    notes: '',
  });

  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        setTraineesLoading(true);
        const response = await api.get('/trainer/trainees');
        setTrainees(response.data || []);
      } catch (err) {
        console.error('Failed to fetch trainees:', err);
      } finally {
        setTraineesLoading(false);
      }
    };

    fetchTrainees();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/measurements', formData);
      alert('Measurement recorded successfully');
      navigate('/trainer/dashboard');
    } catch (err) {
      alert('Failed to record measurement');
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Record Body Measurement</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trainee</label>
              <select
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select trainee by name / member ID</option>
                {traineesLoading && <option value="">Loading trainees...</option>}
                {!traineesLoading && trainees.map((trainee) => (
                  <option key={trainee._id} value={trainee.memberId}>
                    {trainee.fullName} ({trainee.memberId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step={0.1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chest (cm)</label>
              <input
                type="number"
                name="chest"
                value={formData.chest}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waist (cm)</label>
              <input
                type="number"
                name="waist"
                value={formData.waist}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hips (cm)</label>
              <input
                type="number"
                name="hips"
                value={formData.hips}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arms (cm)</label>
              <input
                type="number"
                name="arms"
                value={formData.arms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thighs (cm)</label>
              <input
                type="number"
                name="thighs"
                value={formData.thighs}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Fat (%)</label>
              <input
                type="number"
                name="bodyFat"
                value={formData.bodyFat}
                onChange={handleChange}
                step={0.1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Record Measurement
            </button>
            <button
              type="button"
              onClick={() => navigate('/trainer/dashboard')}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordMeasurement;
