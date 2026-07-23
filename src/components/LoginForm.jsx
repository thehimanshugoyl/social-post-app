// LoginForm.jsx
// Experiment 1.3.1 — Login UI dispatching the auth thunk

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/authSlice';

export default function LoginForm() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.auth.status);
  const error = useSelector((state) => state.auth.error);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ username, password }));
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Sign In</h2>

      <label>
        Username
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin / editor / viewer"
          autoComplete="username"
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="e.g. admin123"
          autoComplete="current-password"
        />
      </label>

      {error && <div className="login-error">{error}</div>}

      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}