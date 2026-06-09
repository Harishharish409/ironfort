import { useState, useEffect } from 'react';
import api from '../../utils/api';

const TrainerSupplements = () => {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/supplements');
      setSupplements(response.data);
    } catch (err) {
      console.error('Failed to fetch supplements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (supplementId) => {
    const quantity = prompt('Enter quantity:');
    if (!quantity || quantity <= 0) return;

    try {
      await api.post('/supplements/book', {
        supplementId,
        quantity: parseInt(quantity),
      });
      alert('Booking request sent to admin');
    } catch (err) {
      alert('Failed to book supplement');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Supplements</h1>

      {supplements.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No supplements available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supplements.map((supplement) => (
            <div key={supplement._id} className="bg-white rounded-lg shadow overflow-hidden">
              {supplement.photoUrl && (
                <img
                  src={supplement.photoUrl}
                  alt={supplement.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{supplement.name}</h3>
                {supplement.category && (
                  <p className="text-gray-600 text-sm mb-2">{supplement.category}</p>
                )}
                {supplement.description && (
                  <p className="text-gray-600 text-sm mb-4">{supplement.description}</p>
                )}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">${supplement.price}</span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      supplement.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {supplement.isAvailable ? `${supplement.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <button
                  onClick={() => handleBook(supplement._id)}
                  disabled={!supplement.isAvailable}
                  className={`w-full py-2 rounded-md ${
                    supplement.isAvailable
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Book Supplement
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainerSupplements;
