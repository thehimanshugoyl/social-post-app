// postsSlice.js
// Experiment 1.2.1 — Centralized state management with Redux Toolkit
// Normalized state shape for posts, platforms, and drafts.

import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  posts: {
    byId: {},
    allIds: [],
  },
  drafts: {
    byId: {},
    allIds: [],
  },
  platforms: {
    byId: {
      twitter: { id: 'twitter', name: 'Twitter/X', charLimit: 280, maxMedia: 4 },
      instagram: { id: 'instagram', name: 'Instagram', charLimit: 2200, maxMedia: 10 },
      linkedin: { id: 'linkedin', name: 'LinkedIn', charLimit: 3000, maxMedia: 9 },
      facebook: { id: 'facebook', name: 'Facebook', charLimit: 63206, maxMedia: 10 },
    },
    allIds: ['twitter', 'instagram', 'linkedin', 'facebook'],
  },
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    draftCreated: {
      reducer(state, action) {
        const draft = action.payload;
        state.drafts.byId[draft.id] = draft;
        state.drafts.allIds.push(draft.id);
      },
      prepare({ text = '', platformIds = [], media = [] }) {
        return {
          payload: {
            id: nanoid(),
            text,
            platformIds,
            media,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        };
      },
    },
    draftUpdated(state, action) {
      const { id, changes } = action.payload;
      if (state.drafts.byId[id]) {
        state.drafts.byId[id] = {
          ...state.drafts.byId[id],
          ...changes,
          updatedAt: Date.now(),
        };
      }
    },
    draftDeleted(state, action) {
      const id = action.payload;
      delete state.drafts.byId[id];
      state.drafts.allIds = state.drafts.allIds.filter((d) => d !== id);
    },
    draftPublished(state, action) {
      const id = action.payload;
      const draft = state.drafts.byId[id];
      if (!draft) return;

      const post = { ...draft, publishedAt: Date.now(), status: 'published' };
      state.posts.byId[post.id] = post;
      state.posts.allIds.push(post.id);

      delete state.drafts.byId[id];
      state.drafts.allIds = state.drafts.allIds.filter((d) => d !== id);
    },
    postRemoved(state, action) {
      const id = action.payload;
      delete state.posts.byId[id];
      state.posts.allIds = state.posts.allIds.filter((p) => p !== id);
    },
  },
});

export const {
  draftCreated,
  draftUpdated,
  draftDeleted,
  draftPublished,
  postRemoved,
} = postsSlice.actions;

export default postsSlice.reducer;