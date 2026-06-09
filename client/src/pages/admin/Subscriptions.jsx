import { useState, useEffect } from 'react';
import api from '../../utils/api';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (subscriptionId) => {
    if (!confirm('Are you sure you want to confirm this subscription?')) return;

    try {
      await api.patch(`/subscriptions/${subscriptionId}/confirm`);
      fetchSubscriptions();
    } catch (err) {
      alert('Failed to confirm subscription');
      console.error(err);
    }
  };

  const getStatusColor = (status, endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const daysUntilExpiry = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

    if (status === 'expired') return 'bg-red-100 text-red-800';
    if (status === 'pending_renewal') return 'bg-yellow-100 text-yellow-800';
    if (daysUntilExpiry <= 7) return 'bg-amber-100 text-amber-800';
    return 'bg-green-100 text-green-800';
  };

  const getPaymentStatusColor = (status) => {
    return status === 'confirmed'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-black">Subscriptions</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden border-t-4 border-green-600">
        <table className="min-w-full">
          <thead className="bg-black text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((sub) => (
              <tr key={sub._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {sub.member?.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {sub.plan?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {new Date(sub.startDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {new Date(sub.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      sub.status,
                      sub.endDate
                    )}`}
                  >
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                      sub.paymentStatus
                    )}`}
                  >
                    {sub.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {(sub.renewalRequested || sub.paymentStatus === 'pending') && (
                    <button
                      onClick={() => handleConfirm(sub._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Confirm
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscriptions.length === 0 && (
          <div className="text-center py-8 text-gray-500">No subscriptions found</div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
