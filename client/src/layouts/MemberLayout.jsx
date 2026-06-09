import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../app/slices/authSlice';
import api from '../utils/api';
import { useState, useEffect } from 'react';
import Notifications from '../components/shared/Notifications';

const MemberLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [todayMarked, setTodayMarked] = useState(false);

  useEffect(() => {
    checkTodayAttendance();
  }, []);

  const checkTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/check-today');
      setTodayMarked(response.data.marked);
    } catch (err) {
      console.error('Failed to check attendance:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(logout());
      navigate('/login');
    }
  };

  const handleMarkAttendance = async () => {
    try {
      await api.post('/attendance/mark');
      setTodayMarked(true);
      alert('Attendance marked successfully');
    } catch (err) {
      alert('Failed to mark attendance');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">IronFort</span>
              <span className="ml-4 text-gray-300">Member Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleMarkAttendance}
                disabled={todayMarked}
                className={`px-4 py-2 rounded ${
                  todayMarked
                    ? 'bg-green-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {todayMarked ? 'Marked ✓' : 'Mark Attendance'}
              </button>
              <Notifications />
              <span className="text-sm">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-gray-800 text-white min-h-screen">
          <nav className="mt-4">
            <Link
              to="/member/dashboard"
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Dashboard
            </Link>
            <Link
              to="/member/attendance"
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Attendance
            </Link>
            <Link
              to="/member/workouts"
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Workouts
            </Link>
            <Link
              to="/member/diet"
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Diet
            </Link>
            <Link
              to="/member/measurements"
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Measurements
            </Link>
            <Link
              to="/member/progress"
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Progress Photos
            </Link>
            <Link
              to="/member/supplements"
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Supplements
            </Link>
            <Link
              to="/member/questions"
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Questions
            </Link>
            <Link
              to="/member/chat"
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Chat
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MemberLayout;
