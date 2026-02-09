import { AlertCircle, Eye, EyeOff, Loader } from "lucide-react";
import { useState } from "react";
import { apiFetch } from "../api/apiFetch";
import { addUser } from "../utils/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validation, setValidation] = useState({});

  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!email.trim() || !email.includes("@"))
      errors.email = "Valid email required";
    if (!password || password.length < 8)
      errors.password = "Password must be 8+ characters";

    if (Object.keys(errors).length > 0) {
      setValidation(errors);
      return;
    }

    setValidation({});
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.success) {
        dispatch(addUser(res.data));
        navigate("/feed");
      } else {
        setError(res.message || "Login failed");
      }
    } catch {
      setError("Login failed. Please try again.");
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                DevTinder
              </span>
            </h1>
            <p className="text-slate-400">
              Connect with developers. Collaborate. Grow together.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* FORM START */}
          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${
                  validation.email
                    ? "border-red-500/60"
                    : "border-indigo-500/20 focus:border-indigo-500/60"
                } focus:outline-none text-white placeholder-slate-500`}
              />
              {validation.email && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${
                    validation.password
                      ? "border-red-500/60"
                      : "border-indigo-500/20 focus:border-indigo-500/60"
                  } focus:outline-none text-white placeholder-slate-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validation.password && (
                <p className="text-red-400 text-xs mt-1">
                  {validation.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-slate-400 text-sm hover:text-indigo-400 transition"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 
              hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold 
              transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 
              transform hover:scale-[1.02]"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : "Login"}
            </button>
          </form>
          {/* FORM END */}

          <GoogleLoginButton/>


          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/50 text-slate-400">or</span>
            </div>
          </div>

          {/* Create Account */}
          <button
            onClick={() => navigate("/signup")}
            className="w-full py-3 rounded-lg border border-cyan-500/30 
            hover:border-cyan-500/60 text-cyan-400 font-semibold transition duration-200"
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
}
