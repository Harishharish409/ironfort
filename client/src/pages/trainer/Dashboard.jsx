import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [trainees, setTrainees] = useState([]);

  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        const response = await api.get('/trainer/trainees');
        setTrainees(response.data || []);
      } catch (err) {
        console.error('Failed to fetch trainees:', err);
      }
    };

    fetchTrainees();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white/80 p-6 rounded-3xl shadow-sm border border-gray-100/50 backdrop-blur-xl">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">Trainer Dashboard</h1>
          <p className="text-gray-500 mt-2 font-medium">Welcome back, {user?.username || 'Trainer'}!</p>
        </div>
        <div className="hidden sm:block">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
            {user?.username?.charAt(0).toUpperCase() || 'T'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-gray-100 backdrop-blur-lg hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-white opacity-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <h3 className="text-gray-500 font-semibold tracking-wide text-sm uppercase">Assigned Members</h3>
          <p className="text-4xl font-black mt-3 text-gray-800">{trainees.length}</p>
        </div>
        
        <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-gray-100 backdrop-blur-lg hover:shadow-xl hover:shadow-purple-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-white opacity-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <h3 className="text-gray-500 font-semibold tracking-wide text-sm uppercase">Pending Questions</h3>
          <p className="text-4xl font-black mt-3 text-gray-800">3</p>
        </div>
        
        <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-gray-100 backdrop-blur-lg hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-white opacity-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <h3 className="text-gray-500 font-semibold tracking-wide text-sm uppercase">Today's Attendance</h3>
          <p className="text-4xl font-black mt-3 text-gray-800">8<span className="text-2xl text-gray-400">/12</span></p>
        </div>
      </div>
      
      <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-gray-100 backdrop-blur-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/trainer/assign-workout" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0">
            Assign Workout
          </Link>
          <Link to="/trainer/assign-diet" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5 active:translate-y-0">
            Assign Diet
          </Link>
          <Link to="/trainer/record-measurement" className="px-6 py-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all">
            Record Measurement
          </Link>
          <Link to="/trainer/trainees" className="px-6 py-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all">
            View Trainees
          </Link>
        </div>
      </div>

      <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-gray-100 backdrop-blur-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Trainees</h2>
        {trainees.length === 0 ? (
          <p className="text-gray-500">No trainees assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trainees.slice(0, 6).map((trainee) => (
              <Link
                key={trainee._id}
                to={`/trainer/trainees/${trainee.memberId}`}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 hover:border-indigo-200 hover:bg-indigo-50/40 transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">{trainee.fullName}</p>
                  <p className="text-sm text-gray-500">{trainee.memberId}</p>
                </div>
                <span className="text-sm font-semibold text-indigo-600">View</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
