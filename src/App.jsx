import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import RequestsPage from './pages/RequestsPage';
import ConnectionsPage from './pages/ConnectionsPage';

import { apiFetch } from './api/apiFetch';

export default function App() {
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
      case 'feed': return <FeedPage />;
      case 'profile': return <ProfilePage user={user} setPage={setCurrentPage} />;
      case 'profile/edit': return <EditProfilePage user={user} setUser={setUser} setPage={setCurrentPage} />;
      case 'requests': return <RequestsPage />;
      case 'connections': return <ConnectionsPage />;
      default: return <LoginPage setPage={setCurrentPage} setUser={setUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {user && !['login', 'signup'].includes(currentPage) && (
        <Navbar user={user} setPage={setCurrentPage} setUser={setUser} />
      )}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {renderPage()}
      </div>
    </div>
  );
}
