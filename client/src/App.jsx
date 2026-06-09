import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';
import store from './app/store';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Login from './pages/auth/Login';
import ChangePassword from './pages/auth/ChangePassword';
import AdminLayout from './layouts/AdminLayout';
import TrainerLayout from './layouts/TrainerLayout';
import MemberLayout from './layouts/MemberLayout';
import AdminDashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import Trainers from './pages/admin/Trainers';
import RegisterUser from './pages/admin/RegisterUser';
import AddMember from './pages/admin/AddMember';
import AddTrainer from './pages/admin/AddTrainer';
import MemberDetail from './pages/admin/MemberDetail';
import TrainerDetail from './pages/admin/TrainerDetail';
import Plans from './pages/admin/Plans';
import Subscriptions from './pages/admin/Subscriptions';
import AdminAttendance from './pages/admin/Attendance';
import TrainerAttendance from './pages/trainer/Attendance';
import MemberAttendance from './pages/member/Attendance';
import AssignWorkout from './pages/trainer/AssignWorkout';
import AssignDiet from './pages/trainer/AssignDiet';
import RecordMeasurement from './pages/trainer/RecordMeasurement';
import TrainerSupplements from './pages/trainer/Supplements';
import Trainees from './pages/trainer/Trainees';
import TraineeDetail from './pages/trainer/TraineeDetail';
import MemberWorkouts from './pages/member/Workouts';
import MemberDiet from './pages/member/Diet';
import MemberMeasurements from './pages/member/Measurements';
import Progress from './pages/member/Progress';
import MemberSupplements from './pages/member/Supplements';
import MemberQuestions from './pages/member/Questions';
import Equipment from './pages/admin/Equipment';
import Supplements from './pages/admin/Supplements';
import Bookings from './pages/admin/Bookings';
import AdminQuestions from './pages/admin/Questions';
import Reports from './pages/admin/Reports';
import TrainerDashboard from './pages/trainer/Dashboard';
import MemberDashboard from './pages/member/Dashboard';
import Chat from './pages/shared/Chat';

// Inline Unauthorized page component

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Unauthorized</h1>
      <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
      <button
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  </div>
);

function AppContent() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const getRoleDashboard = (role) => {
    const map = {
      admin: '/admin/dashboard',
      trainer: '/trainer/dashboard',
      member: '/member/dashboard',
    };
    return map[role] || '/login';
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={getRoleDashboard(user?.role)} replace />
            : <Login />
        }
      />
      <Route path="/change-password" element={<ChangePassword />} />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="members/:id" element={<MemberDetail />} />
        <Route path="add-member" element={<AddMember />} />
        <Route path="trainers" element={<Trainers />} />
        <Route path="trainers/:id" element={<TrainerDetail />} />
        <Route path="add-trainer" element={<AddTrainer />} />
        <Route path="register" element={<RegisterUser />} />
        <Route path="plans" element={<Plans />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="supplements" element={<Supplements />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      <Route
        path="/trainer"
        element={
          <ProtectedRoute allowedRoles={['trainer']}>
            <TrainerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<TrainerDashboard />} />
        <Route path="attendance" element={<TrainerAttendance />} />
        <Route path="trainees" element={<Trainees />} />
        <Route path="trainees/:memberId" element={<TraineeDetail />} />
        <Route path="assign-workout" element={<AssignWorkout />} />
        <Route path="assign-diet" element={<AssignDiet />} />
        <Route path="record-measurement" element={<RecordMeasurement />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      <Route
        path="/member"
        element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<MemberDashboard />} />
        <Route path="attendance" element={<MemberAttendance />} />
        <Route path="workouts" element={<MemberWorkouts />} />
        <Route path="diet" element={<MemberDiet />} />
        <Route path="measurements" element={<MemberMeasurements />} />
        <Route path="progress" element={<Progress />} />
        <Route path="supplements" element={<MemberSupplements />} />
        <Route path="questions" element={<MemberQuestions />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to={getRoleDashboard(user?.role)} replace />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
