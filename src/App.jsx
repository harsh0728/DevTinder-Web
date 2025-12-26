// import { useEffect, useState } from 'react';
// import Navbar from './components/Navbar';
// import LoginPage from './pages/LoginPage';
// import SignupPage from './pages/SignupPage';
// import FeedPage from './pages/FeedPage';
// import ProfilePage from './pages/ProfilePage';
// import EditProfilePage from './pages/EditProfilePage';
// import RequestsPage from './pages/RequestsPage';
// import ConnectionsPage from './pages/ConnectionsPage';

// import { apiFetch } from './api/apiFetch';
// import { useDispatch, useSelector } from 'react-redux';
// import { addUser, removeUser } from './utils/userSlice';
// import Premium from './pages/Premium';
// import Chat from './pages/Chat';

// export default function App() {
//   const [currentPage, setCurrentPage] = useState('login');

//   const dispatch = useDispatch();
//   const user = useSelector((store) => store.user);

  // useEffect(() => {
  //   checkAuth();
  // }, []);

  // const checkAuth = async () => {
  //   if (user) return;

  //   try {
  //     const res = await apiFetch('/profile/view');
  //     if (res.success) {
  //       dispatch(addUser(res.data));
  //       setCurrentPage('feed');
  //     }
  //   } catch (err) {
  //     dispatch(removeUser());
  //     setCurrentPage('login');
  //     console.error(err);
  //   }
  // };

//   const renderPage = () => {
//     switch (currentPage) {
//       case 'login':
//         return <LoginPage setPage={setCurrentPage} />;
//       case 'signup':
//         return <SignupPage setPage={setCurrentPage} />;
//       case 'feed':
//         return <FeedPage />;
//       case 'profile':
//         return <ProfilePage setPage={setCurrentPage} />;
//       case 'profile/edit':
//         return <EditProfilePage setPage={setCurrentPage} />;
//       case 'requests':
//         return <RequestsPage />;
//       case 'connections':
//         return <ConnectionsPage />;
//       case 'premium':
//         return <Premium/>
//       case 'chat/:userId':
//         return <Chat/>;
//       default:
//         return <LoginPage setPage={setCurrentPage} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
//       {user && !['login', 'signup'].includes(currentPage) && (
//         <Navbar setPage={setCurrentPage} />
//       )}

//       <div className="max-w-6xl mx-auto px-4 py-6">
//         {renderPage()}
//       </div>
//     </div>
//   );
// }


import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import { useDispatch, useSelector } from 'react-redux';
import { addUser, removeUser } from './utils/userSlice';
import Premium from './pages/Premium';
import Chat from './pages/Chat';


export default function App() {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate=useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (user) return;

    try {
      const res = await apiFetch('/profile/view');
      if (res.success) {
        dispatch(addUser(res.data));
        navigate('feed');
      }
    } catch (err) {
      dispatch(removeUser());
      navigate('login');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {user && <Navbar />}

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/chat/:userId" element={<Chat />} />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
}
