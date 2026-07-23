// authSelectors.js
import { createSelector } from '@reduxjs/toolkit';

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export const selectAuthStatus = (state) => state.auth.status;

// Memoized: only recomputes when user actually changes
export const selectHasRole = createSelector(
  [selectCurrentUser, (_state, allowedRoles) => allowedRoles],
  (user, allowedRoles) => Boolean(user && allowedRoles.includes(user.role))
);