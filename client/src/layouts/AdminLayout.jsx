import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../app/slices/authSlice';
import api from '../utils/api';
import Notifications from '../components/shared/Notifications';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-500">IronFort</span>
              <span className="ml-4 text-gray-300">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <Notifications />
              <span className="text-sm text-gray-300">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-black text-white min-h-screen shadow-lg">
          <nav className="mt-4">
            <Link
              to="/admin/dashboard"
              className="block px-4 py-3 hover:bg-green-600 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <div className="px-4 py-2 text-xs font-semibold text-green-500 uppercase tracking-wider mt-4 mb-2">
              Users
            </div>
            <Link
              to="/admin/members"
              className="block px-4 py-2 hover:bg-green-600 transition-colors"
            >
              View Members
            </Link>
            <Link
              to="/admin/add-member"
              className="block px-4 py-2 hover:bg-green-600 transition-colors"
            >
              Add Member
            </Link>
            <Link
              to="/admin/trainers"
              className="block px-4 py-2 hover:bg-green-600 transition-colors"
            >
              View Trainers
            </Link>
            <Link
              to="/admin/add-trainer"
              className="block px-4 py-2 hover:bg-green-600 transition-colors"
            >
              Add Trainer
            </Link>
            <div className="px-4 py-2 text-xs font-semibold text-green-500 uppercase tracking-wider mt-4 mb-2">
              Management
            </div>
            <Link
              to="/admin/plans"
              className="block px-4 py-2 hover:bg-green-600 transition-colors"
            >
              Plans
            </Link>
            <Link
              to="/admin/subscriptions"
              className="block px-4 py-2 hover:bg-green-600 transition-colors"
            >
              Subscriptions
            </Link>
            <Link
              to="/admin/attendance"
              className="block px-4 py-2 hover:bg-green-600 transition-colors"
            >
              Attendance
            </Link>
            <Link
              to="/admin/equipment"
              className="block px-4 py-2 hover:bg-green-600 transition-colors"
            >
              Equipment
            </Link>
            <Link
              to="/admin/supplements"
              className="block px-4 py-2 hover:bg-green-600 transition-colors"
            >
              Supplements
            </Link>
            <Link
              to="/admin/bookings"
              className="block px-4 py-2 hover:bg-green-600 transition-colors"
            >
              Bookings
            </Link>
            <Link
              to="/admin/questions"
              className="block px-4 py-2 hover:bg-green-600 transition-colors"
            >
              Questions
            </Link>
            <Link
              to="/admin/chat"
              className="block px-4 py-2 hover:bg-green-600 transition-colors"
            >
              Chat
            </Link>
            <Link
              to="/admin/reports"
              className="block px-4 py-2 hover:bg-green-600 transition-colors"
            >
              Reports
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

export default AdminLayout;
