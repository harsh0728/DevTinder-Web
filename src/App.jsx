import React, { useState, useEffect } from 'react';
import { Heart, X, LogOut, Edit2, Users, MessageCircle, Home, User, ChevronLeft, Loader, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
  });
  return response.json();
};

export default function DevTinder() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await apiFetch('/profile/view');
      if (res.success) {
        setUser(res.data);
        setCurrentPage('feed');
      }
    } catch {
      setCurrentPage('login');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login': return <LoginPage setPage={setCurrentPage} setUser={setUser} />;
      case 'signup': return <SignupPage setPage={setCurrentPage} />;
      case 'feed': return <FeedPage setPage={setCurrentPage} />;
      case 'profile': return <ProfilePage user={user} setUser={setUser} setPage={setCurrentPage} />;
      case 'profile/edit': return <EditProfilePage user={user} setUser={setUser} setPage={setCurrentPage} />;
      case 'requests': return <RequestsPage setPage={setCurrentPage} />;
      case 'connections': return <ConnectionsPage setPage={setCurrentPage} />;
      default: return <LoginPage setPage={setCurrentPage} setUser={setUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {user && currentPage !== 'login' && currentPage !== 'signup' && (
        <Navbar user={user} setPage={setCurrentPage} setUser={setUser} />
      )}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {renderPage()}
      </div>
    </div>
  );
}

function Navbar({ user, setPage, setUser }) {
  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
      setUser(null);
      setPage('login');
    } catch {
      alert('Logout failed');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-indigo-500/20">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setPage('feed')} className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">💜</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">DevTinder</span>
          </button>

          <div className="hidden md:flex items-center gap-2">
            <NavButton icon={Home} label="Feed" onClick={() => setPage('feed')} />
            <NavButton icon={MessageCircle} label="Requests" onClick={() => setPage('requests')} />
            <NavButton icon={Users} label="Connections" onClick={() => setPage('connections')} />
            <NavButton icon={User} label="Profile" onClick={() => setPage('profile')} />
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition duration-200">
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavButton({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-500/20 transition duration-200 text-slate-300 hover:text-indigo-300">
      <Icon size={20} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function LoginPage({ setPage, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.success) {
        setUser(res.data);
        setPage('feed');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">DevTinder</span>
            </h1>
            <p className="text-slate-400">Connect with developers. Collaborate. Grow together.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-indigo-500/20 focus:border-indigo-500/60 focus:outline-none text-white placeholder-slate-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-indigo-500/20 focus:border-indigo-500/60 focus:outline-none text-white placeholder-slate-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : 'Login'}
            </button>
          </div>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/50 text-slate-400">or</span>
            </div>
          </div>

          <button
            onClick={() => setPage('signup')}
            className="w-full py-3 rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400 font-semibold transition duration-200"
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
}

function SignupPage({ setPage }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', age: '', gender: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = 'First name required';
    if (!form.lastName.trim()) errors.lastName = 'Last name required';
    if (!form.email.includes('@')) errors.email = 'Valid email required';
    if (form.password.length < 8) errors.password = 'Password must be 8+ characters';
    if (!form.age || form.age < 18) errors.age = 'Must be 18+';
    if (!form.gender) errors.gender = 'Gender required';
    return errors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidation(errors);
      return;
    }
    setValidation({});
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (res.success) {
        alert('Account created! Please login.');
        setPage('login');
      } else {
        setError(res.message || 'Signup failed');
      }
    } catch {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setPage('login')} className="p-2 hover:bg-indigo-500/20 rounded-lg transition">
              <ChevronLeft size={24} className="text-slate-300" />
            </button>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Create Account</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">First Name</label>
                <input type="text" name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${validation.firstName ? 'border-red-500/60' : 'border-indigo-500/20 focus:border-indigo-500/60'} focus:outline-none text-white placeholder-slate-500`} />
                {validation.firstName && <p className="text-red-400 text-xs mt-1">{validation.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Last Name</label>
                <input type="text" name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${validation.lastName ? 'border-red-500/60' : 'border-indigo-500/20 focus:border-indigo-500/60'} focus:outline-none text-white placeholder-slate-500`} />
                {validation.lastName && <p className="text-red-400 text-xs mt-1">{validation.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
              <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${validation.email ? 'border-red-500/60' : 'border-indigo-500/20 focus:border-indigo-500/60'} focus:outline-none text-white placeholder-slate-500`} />
              {validation.email && <p className="text-red-400 text-xs mt-1">{validation.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" value={form.password} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${validation.password ? 'border-red-500/60' : 'border-indigo-500/20 focus:border-indigo-500/60'} focus:outline-none text-white placeholder-slate-500`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-300">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validation.password && <p className="text-red-400 text-xs mt-1">{validation.password}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Age</label>
                <input type="number" name="age" placeholder="25" value={form.age} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${validation.age ? 'border-red-500/60' : 'border-indigo-500/20 focus:border-indigo-500/60'} focus:outline-none text-white placeholder-slate-500`} />
                {validation.age && <p className="text-red-400 text-xs mt-1">{validation.age}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${validation.gender ? 'border-red-500/60' : 'border-indigo-500/20 focus:border-indigo-500/60'} focus:outline-none text-white`}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {validation.gender && <p className="text-red-400 text-xs mt-1">{validation.gender}</p>}
              </div>
            </div>

            <button onClick={handleSignup} disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader className="animate-spin" size={20} /> : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedPage({ setPage }) {
  const [feed, setFeed] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await apiFetch('/feed');
      if (res.success) {
        setFeed(res.data);
        setCurrent(0);
      }
    } catch {
      alert('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status) => {
    if (current >= feed.length) return;
    try {
      await apiFetch(`/request/send/${feed[current]._id}`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      setCurrent(current + 1);
    } catch {
      alert('Action failed');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader className="animate-spin text-indigo-400" size={48} /></div>;
  }

  if (feed.length === 0 || current >= feed.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-3xl font-bold text-slate-300">No more developers!</h2>
        <p className="text-slate-400">Come back later for more connections</p>
      </div>
    );
  }

  const dev = feed[current];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center text-slate-400 text-sm font-medium">
          Profile {current + 1} of {feed.length}
        </div>

        <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-indigo-500/20 rounded-3xl overflow-hidden shadow-2xl">
          <div className="h-96 bg-gradient-to-br from-indigo-600 to-cyan-600 relative overflow-hidden">
            {dev.photoUrl ? (
              <img src={dev.photoUrl} alt={dev.firstName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">👤</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-4xl font-bold text-white">{dev.firstName}</h2>
              <p className="text-cyan-200 font-medium">{dev.about || 'Developer'}</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {dev.skills && dev.skills.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-400 mb-3">SKILLS</p>
                <div className="flex flex-wrap gap-2">
                  {dev.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/40 text-indigo-300 text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => handleAction('ignored')}
            className="p-4 rounded-full bg-slate-800/50 border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition duration-200"
          >
            <X size={32} />
          </button>
          <button
            onClick={() => handleAction('interested')}
            className="p-4 rounded-full bg-gradient-to-r from-indigo-600/50 to-cyan-600/50 border border-indigo-500/40 hover:from-indigo-500/70 hover:to-cyan-500/70 text-cyan-300 hover:text-cyan-200 transition duration-200"
          >
            <Heart size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ user, setPage }) {
  if (!user) return <div className="text-center text-slate-300">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">My Profile</h1>
          <button onClick={() => setPage('profile/edit')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-indigo-300 transition duration-200 font-medium">
            <Edit2 size={18} />
            Edit
          </button>
        </div>

        <div className="space-y-6">
          <div className="w-full h-48 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-xl flex items-center justify-center text-7xl overflow-hidden">
            {user.photoUrl ? <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" /> : '👤'}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ProfileField label="First Name" value={user.firstName} />
            <ProfileField label="Last Name" value={user.lastName} />
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="Age" value={user.age} />
          </div>

          <ProfileField label="Gender" value={user.gender} />
          <ProfileField label="About" value={user.about || 'Not set'} />

          {user.skills && user.skills.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-400 mb-3 uppercase">Skills</p>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/40 text-indigo-300 text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="border-b border-slate-700/50 pb-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg text-slate-200">{value}</p>
    </div>
  );
}

function EditProfilePage({ user, setUser, setPage }) {
  const [form, setForm] = useState({
    about: user.about || '',
    skills: user.skills?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/profile/edit', {
        method: 'PATCH',
        body: JSON.stringify({
          about: form.about,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (res.success) {
        setUser(res.data);
        setPage('profile');
      }
    } catch {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setPage('profile')} className="p-2 hover:bg-indigo-500/20 rounded-lg transition">
            <ChevronLeft size={24} className="text-slate-300" />
          </button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Edit Profile</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">About</label>
            <textarea
              name="about"
              placeholder="Tell us about yourself..."
              value={form.about}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-indigo-500/20 focus:border-indigo-500/60 focus:outline-none text-white placeholder-slate-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              placeholder="React, Node.js, MongoDB, Python"
              value={form.skills}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-indigo-500/20 focus:border-indigo-500/60 focus:outline-none text-white placeholder-slate-500 transition"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setPage('profile')}
              className="flex-1 px-6 py-3 rounded-lg border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestsPage({ setPage }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await apiFetch('/user/request/received');
      if (res.success) {
        setRequests(res.data);
      }
    } catch {
      alert('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId, status) => {
    try {
      await apiFetch(`/request/review/${requestId}`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      setRequests(requests.filter((r) => r._id !== requestId));
    } catch {
      alert('Failed to review request');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader className="animate-spin text-indigo-400" size={48} /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-8">Connection Requests</h1>

      {requests.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No connection requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-xl p-6 hover:border-indigo-500/40 transition duration-200">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex gap-4 flex-1">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                    {req.fromUserId.photoUrl ? <img src={req.fromUserId.photoUrl} alt="" className="w-full h-full object-cover" /> : '👤'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{req.fromUserId.firstName}</h3>
                    {req.fromUserId.skills && req.fromUserId.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {req.fromUserId.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="px-2 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReview(req._id, 'rejected')}
                  className="flex-1 px-4 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-medium transition duration-200 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Reject
                </button>
                <button
                  onClick={() => handleReview(req._id, 'accepted')}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600/50 to-cyan-600/50 border border-indigo-500/40 hover:from-indigo-500/70 hover:to-cyan-500/70 text-cyan-300 hover:text-cyan-200 font-medium transition duration-200 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConnectionsPage({ setPage }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await apiFetch('/user/connections');
      if (res.success) {
        setConnections(res.data);
      }
    } catch {
      alert('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader className="animate-spin text-indigo-400" size={48} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">Your Connections</h1>
        <p className="text-slate-400">{connections.length} developer{connections.length !== 1 ? 's' : ''} connected</p>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No connections yet. Start swiping to connect!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((conn) => (
            <div key={conn._id} className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-xl overflow-hidden hover:border-indigo-500/40 transition duration-200 group cursor-pointer">
              <div className="h-40 bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-6xl overflow-hidden">
                {conn.photoUrl ? <img src={conn.photoUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" /> : '👤'}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-3">{conn.firstName}</h3>
                {conn.skills && conn.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {conn.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {conn.skills.length > 3 && <span className="px-2 py-1 rounded-full bg-slate-700/50 text-slate-400 text-xs font-medium">+{conn.skills.length - 3}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}