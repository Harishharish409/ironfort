import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials, setError, clearError } from '../../app/slices/authSlice';
import api from '../../utils/api';

const ROLES = [
  {
    key: 'admin',
    label: 'Admin',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: 'from-orange-500 to-red-600',
    accent: 'orange',
    hint: 'Enter admin credentials',
    placeholder_user: 'admin username',

    placeholder_pass: '',
  },
  {
    key: 'trainer',
    label: 'Trainer',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: 'from-blue-500 to-cyan-600',
    accent: 'blue',
    hint: 'Use credentials provided by admin',
    placeholder_user: 'trainer username',

    placeholder_pass: '',
  },
  {
    key: 'member',
    label: 'Member',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'from-emerald-500 to-teal-600',
    accent: 'emerald',
    hint: 'Use credentials provided by admin',
    placeholder_user: 'member username',

    placeholder_pass: '',
  },
];

const accentClasses = {
  orange: {
    ring: 'focus:ring-orange-400 focus:border-orange-400',
    btn: 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 focus:ring-orange-400',
    tab_active: 'bg-white text-orange-600 shadow-md',
    tab_inactive: 'text-white/70 hover:text-white hover:bg-white/10',
    badge: 'bg-orange-100 text-orange-700 border border-orange-200',
  },
  blue: {
    ring: 'focus:ring-blue-400 focus:border-blue-400',
    btn: 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 focus:ring-blue-400',
    tab_active: 'bg-white text-blue-600 shadow-md',
    tab_inactive: 'text-white/70 hover:text-white hover:bg-white/10',
    badge: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  emerald: {
    ring: 'focus:ring-emerald-400 focus:border-emerald-400',
    btn: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-400',
    tab_active: 'bg-white text-emerald-600 shadow-md',
    tab_inactive: 'text-white/70 hover:text-white hover:bg-white/10',
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
};

const Login = () => {
  const [activeRole, setActiveRole] = useState('admin');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setErrorLocal] = useState('');
  const [showPass, setShowPass] = useState(false);

  const INACTIVE_MESSAGE = 'kindly contact the admin to access permission';


  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const from = location.state?.from?.pathname || '/';

  const role = ROLES.find((r) => r.key === activeRole);
  const ac = accentClasses[role.accent];

  const handleTabSwitch = (key) => {
    setActiveRole(key);
    setFormData({ username: '', password: '' });
    setErrorLocal('');
    setShowPass(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setErrorLocal('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorLocal('');
    dispatch(clearError());

    try {
      const response = await api.post('/auth/login', formData);
      const { _id, username, role, mustChangePassword, accessToken } = response.data;

      // Validate the role matches the selected tab
      if (role !== activeRole) {
        setErrorLocal(`These credentials belong to a ${role}, not a ${activeRole}.`);
        setLoading(false);
        return;
      }

      const user = { _id, username, role };
      localStorage.setItem('accessToken', accessToken);
      dispatch(setCredentials({ user, accessToken }));

      if (mustChangePassword) {
        navigate('/change-password');
      } else {
        const roleRedirects = {
          admin: '/admin/dashboard',
          trainer: '/trainer/dashboard',
          member: '/member/dashboard',
        };
        navigate(roleRedirects[role] || from, { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';

      const normalizedBackendMessage = typeof message === 'string' ? message.trim() : '';
      const normalizedInactiveMessage = INACTIVE_MESSAGE.trim();

      const isInactive = normalizedBackendMessage
        .toLowerCase()
        .includes(normalizedInactiveMessage.toLowerCase());

      const finalMessage = isInactive ? normalizedInactiveMessage : normalizedBackendMessage || message;

      setErrorLocal(finalMessage);
      dispatch(setError(finalMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-orange-600/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30 mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            IronFort
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium tracking-widest uppercase">Gym Management System</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Tab Bar */}
          <div className={`bg-gradient-to-r ${role.color} p-1.5`}>
            <div className="flex gap-1 bg-white/10 rounded-xl p-1">
              {ROLES.map((r) => {
                const isActive = r.key === activeRole;
                const tabAc = accentClasses[r.accent];
                return (
                  <button
                    key={r.key}
                    id={`tab-${r.key}`}
                    type="button"
                    onClick={() => handleTabSwitch(r.key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive ? tabAc.tab_active : tabAc.tab_inactive
                    }`}
                  >
                    {r.icon}
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Area */}
          <div className="p-7">
            {/* Role hint badge */}
            <div className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-6 ${ac.badge}`}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {role.hint}
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                    placeholder={role.placeholder_user}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${ac.ring}`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    placeholder={role.placeholder_pass}
                    className={`w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${ac.ring}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id={`btn-login-${activeRole}`}
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r ${ac.btn} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In as {role.label}
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Trainers &amp; Members must be registered by the Admin first
        </p>
      </div>
    </div>
  );
};

export default Login;
