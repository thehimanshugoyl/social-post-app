// App.jsx
import './App.css';
import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { store } from './store/store';
import { checkSession, loggedOut } from './store/authSlice';
import PostCreator from './components/PostCreator';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import EditorTools from './components/EditorTools';
import AdminPanel from './components/AdminPanel';
import ScheduleCalendar from './components/ScheduleCalendar';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '◱', roles: null },
  { to: '/calendar', label: 'Calendar', icon: '▦', roles: null },
  { to: '/editor', label: 'Editor Tools', icon: '◈', roles: ['admin', 'editor'] },
  { to: '/admin', label: 'Admin Panel', icon: '⚙', roles: ['admin'] },
];

function Sidebar() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">S</span>
        SocialFlow
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role)).map(
          (item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user.username.slice(0, 2)}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-username">{user.username}</span>
            <span className="sidebar-role">{user.role}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={() => dispatch(loggedOut())}>
          Log out
        </button>
      </div>
    </aside>
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

function LoginScreen() {
  return (
    <div className="login-screen">
      <LoginForm />
    </div>
  );
}

function AppRoutes() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => Boolean(state.auth.token));

  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="app-shell">
        {isAuthenticated && <Sidebar />}
        <main className={isAuthenticated ? 'main-content' : ''} style={isAuthenticated ? {} : { width: '100%' }}>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<ScheduleCalendar />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin', 'editor']} />}>
              <Route path="/editor" element={<EditorTools />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
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