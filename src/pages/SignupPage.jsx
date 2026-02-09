import { ChevronLeft, Eye, EyeOff, Loader, AlertCircle } from "lucide-react";
import { useState } from "react";
import { apiFetch } from "../api/apiFetch";
import { useNavigate } from "react-router-dom";


export default function SignupPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', age: '', gender: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({});
  const navigate=useNavigate();

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
        navigate('/login');
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
            <button onClick={() => navigate('login')} className="p-2 hover:bg-indigo-500/20 rounded-lg transition">
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
            <div className="text-center mt-4 text-slate-300">
              <span className="text-sm">Already have an account? </span>
              <button
                onClick={() => navigate('/login')}
                className="text-indigo-400 font-semibold hover:text-indigo-300 transition underline underline-offset-2"
              >
              Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
