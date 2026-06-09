import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';

const MemberMeasurements = () => {
  const { user } = useSelector((state) => state.auth);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/measurements/member/${user._id}`);
      setMeasurements(response.data);
    } catch (err) {
      console.error('Failed to fetch measurements:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Body Measurements</h1>

      {measurements.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No measurements recorded yet
        </div>
      ) : (
        <div className="space-y-6">
          {measurements.map((measurement) => (
            <div key={measurement._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {new Date(measurement.date).toLocaleDateString()}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Recorded by {measurement.recordedBy?.username}
                  </p>
                </div>
                {measurement.bmi && (
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">{measurement.bmi.toFixed(1)}</span>
                    <span className="text-gray-600 text-sm"> BMI</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4">
                {measurement.weight && (
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-gray-600 text-sm">Weight</span>
                    <p className="text-xl font-semibold">{measurement.weight} kg</p>
                  </div>
                )}
                {measurement.height && (
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-gray-600 text-sm">Height</span>
                    <p className="text-xl font-semibold">{measurement.height} cm</p>
                  </div>
                )}
                {measurement.chest && (
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-gray-600 text-sm">Chest</span>
                    <p className="text-xl font-semibold">{measurement.chest} cm</p>
                  </div>
                )}
                {measurement.waist && (
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-gray-600 text-sm">Waist</span>
                    <p className="text-xl font-semibold">{measurement.waist} cm</p>
                  </div>
                )}
                {measurement.hips && (
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-gray-600 text-sm">Hips</span>
                    <p className="text-xl font-semibold">{measurement.hips} cm</p>
                  </div>
                )}
                {measurement.arms && (
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-gray-600 text-sm">Arms</span>
                    <p className="text-xl font-semibold">{measurement.arms} cm</p>
                  </div>
                )}
                {measurement.thighs && (
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-gray-600 text-sm">Thighs</span>
                    <p className="text-xl font-semibold">{measurement.thighs} cm</p>
                  </div>
                )}
                {measurement.bodyFat && (
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-gray-600 text-sm">Body Fat</span>
                    <p className="text-xl font-semibold">{measurement.bodyFat}%</p>
                  </div>
                )}
              </div>

              {measurement.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <span className="text-gray-600 text-sm">Notes:</span>
                  <p className="text-gray-800">{measurement.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberMeasurements;
