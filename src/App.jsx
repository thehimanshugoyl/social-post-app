// App.jsx
import './App.css';
import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { store } from './store/store';
import { checkSession, loggedOut } from './store/authSlice';
import PostCreator from './components/PostCreator';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import EditorTools from './components/EditorTools';
import AdminPanel from './components/AdminPanel';

function TopBar() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  if (!user) return null;

  return (
    <div className="topbar">
      <span>
        Signed in as <strong>{user.username}</strong> ({user.role})
      </span>
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        {(user.role === 'admin' || user.role === 'editor') && (
          <Link to="/editor">Editor Tools</Link>
        )}
        {user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
        <button className="logout-btn" onClick={() => dispatch(loggedOut())}>
          Log out
        </button>
      </nav>
    </div>
  );
}

function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const isViewer = user?.role === 'viewer';

  return <PostCreator readOnly={isViewer} />;
}

function Unauthorized() {
  return (
    <div className="post-creator">
      <h2>403 — Access Denied</h2>
      <p className="subtitle">You don't have permission to view this page</p>
    </div>
  );
}

function AppRoutes() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <TopBar />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin', 'editor']} />}>
          <Route path="/editor" element={<EditorTools />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}