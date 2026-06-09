import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white/80 p-6 rounded-3xl shadow-sm border border-gray-100/50 backdrop-blur-xl">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 tracking-tight">Member Dashboard</h1>
          <p className="text-gray-500 mt-2 font-medium">Welcome back to IronFort, {user?.username || 'Member'}!</p>
        </div>
        <div className="hidden sm:block">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-200">
            {user?.username?.charAt(0).toUpperCase() || 'M'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-3xl shadow-xl border border-gray-700 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 className="text-gray-400 font-semibold tracking-wide text-sm uppercase mb-1">Current Plan</h3>
              <p className="text-3xl font-bold text-white mb-2">Pro Membership <span className="text-emerald-400 text-lg font-medium tracking-normal bg-emerald-400/10 px-3 py-1 rounded-full ml-2">Active</span></p>
              <p className="text-gray-400">Expires in <span className="text-white font-semibold">45 days</span> (July 8, 2026)</p>
            </div>
            <div className="mt-6 md:mt-0">
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all backdrop-blur-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-gray-100 backdrop-blur-lg hover:shadow-xl hover:shadow-teal-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-100 to-white opacity-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <h3 className="text-gray-500 font-semibold tracking-wide text-sm uppercase">Today's Workout</h3>
          <p className="text-2xl font-bold mt-3 text-gray-800">Upper Body Power</p>
          <Link to="/member/workouts" className="inline-block mt-4 text-teal-600 font-medium hover:text-teal-700">Start Workout →</Link>
        </div>
        
        <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-gray-100 backdrop-blur-lg hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-white opacity-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <h3 className="text-gray-500 font-semibold tracking-wide text-sm uppercase">Attendance Streak</h3>
          <p className="text-4xl font-black mt-3 text-gray-800">5 <span className="text-xl text-gray-500 font-medium">days</span></p>
          <p className="text-sm text-gray-500 mt-2">Keep it up!</p>
        </div>
        
        <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-gray-100 backdrop-blur-lg hover:shadow-xl hover:shadow-cyan-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-100 to-white opacity-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <h3 className="text-gray-500 font-semibold tracking-wide text-sm uppercase">Today's Diet</h3>
          <p className="text-2xl font-bold mt-3 text-gray-800">High Protein</p>
          <Link to="/member/diet" className="inline-block mt-4 text-cyan-600 font-medium hover:text-cyan-700">View Meals →</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
