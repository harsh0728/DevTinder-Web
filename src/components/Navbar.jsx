

import { Home, Users, MessageCircle, User, LogOut } from 'lucide-react';
import NavButton from './NavButton';
import { apiFetch } from '../api/apiFetch';
import { removeUser } from '../utils/userSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function Navbar({ setPage }) {
  const dispatch = useDispatch();
  const user=useSelector((store) => store.user);

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
      //setUser(null);
      dispatch(removeUser());
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
