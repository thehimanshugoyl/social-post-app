// authSlice.js
// Experiment 1.3.1 — JWT authentication & session management (client side)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = 'http://localhost:4000/api';

const storedToken = localStorage.getItem('token');

const initialState = {
  token: storedToken || null,
  user: null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return rejectWithValue(data.message || 'Login failed');
    }
    return data;
  }
);

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    if (!token) return rejectWithValue('No token');

    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      return rejectWithValue(data.message || 'Session invalid');
    }
    return data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedOut(state) {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(checkSession.rejected, (state) => {
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
      });
  },
});

export const { loggedOut } = authSlice.actions;
export default authSlice.reducer;