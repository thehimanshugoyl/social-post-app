// AdminPanel.jsx
// Admin role — fetches real data from the backend's admin-only endpoint,
// proving the JWT + requireRole('admin') middleware works end-to-end.

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const API_BASE = 'http://localhost:4000/api';

export default function AdminPanel() {
  const token = useSelector((state) => state.auth.token);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Request failed');
        if (!cancelled) setUsers(data.users);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="post-creator">
      <div className="header">
        <h2>Admin Panel</h2>
        <p className="subtitle">User management — visible to admins only</p>
      </div>

      <div className="section-label">Registered Users</div>

      {loading && <p className="subtitle">Loading users…</p>}
      {error && <div className="login-error">{error}</div>}

      {users && (
        <div className="analytics-list">
          {users.map((user) => (
            <div key={user.id} className="analytics-row">
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
              <span className="analytics-name">{user.username}</span>
              <span className="analytics-count">ID: {user.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}