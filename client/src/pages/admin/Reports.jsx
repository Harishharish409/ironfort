import { useState, useEffect } from 'react';
import api from '../../utils/api';

const Reports = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // In a real app, these would be separate API endpoints
      // For now, we'll fetch subscriptions and attendance to generate reports
      const [subscriptionsRes, attendanceRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/attendance'),
      ]);

      setRevenueData(subscriptionsRes.data);
      setAttendanceData(attendanceRes.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenue = () => {
    // Calculate total revenue from active subscriptions
    let total = 0;
    revenueData.forEach((sub) => {
      if (sub.plan && sub.status === 'active') {
        total += sub.plan.price || 0;
      }
    });
    return total;
  };

  const calculateAttendanceRate = () => {
    if (attendanceData.length === 0) return 0;
    const presentCount = attendanceData.filter((a) => a.status === 'present').length;
    return ((presentCount / attendanceData.length) * 100).toFixed(1);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue Report</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue</span>
              <span className="text-2xl font-bold text-green-600">${calculateRevenue()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Subscriptions</span>
              <span className="text-xl font-semibold">
                {revenueData.filter((s) => s.status === 'active').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Renewals</span>
              <span className="text-xl font-semibold">
                {revenueData.filter((s) => s.status === 'pending_renewal').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Attendance Report</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Attendance Records</span>
              <span className="text-xl font-semibold">{attendanceData.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Present</span>
              <span className="text-xl font-semibold text-green-600">
                {attendanceData.filter((a) => a.status === 'present').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Absent</span>
              <span className="text-xl font-semibold text-red-600">
                {attendanceData.filter((a) => a.status === 'absent').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Attendance Rate</span>
              <span className="text-xl font-semibold">{calculateAttendanceRate()}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700">New subscriptions this month</span>
            <span className="font-semibold">
              {revenueData.filter((s) => {
                const thisMonth = new Date().getMonth();
                return new Date(s.startDate).getMonth() === thisMonth;
              }).length}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Active members</span>
            <span className="font-semibold">
              {revenueData.filter((s) => s.status === 'active').length}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Total trainers</span>
            <span className="font-semibold">
              {attendanceData.filter((a) => a.role === 'trainer').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
