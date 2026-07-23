// selectors.js
// Experiment 1.2.2 / 1.1.2 — Memoized selectors for derived state & performance
import { createSelector } from '@reduxjs/toolkit';

const selectPostsState = (state) => state.posts.posts;
const selectDraftsState = (state) => state.posts.drafts;
const selectPlatformsState = (state) => state.posts.platforms;

export const selectAllPosts = createSelector(
  [selectPostsState],
  (posts) => posts.allIds.map((id) => posts.byId[id])
);

export const selectAllDrafts = createSelector(
  [selectDraftsState],
  (drafts) => drafts.allIds.map((id) => drafts.byId[id])
);

export const selectAllPlatforms = createSelector(
  [selectPlatformsState],
  (platforms) => platforms.allIds.map((id) => platforms.byId[id])
);

export const makeSelectPostsByPlatform = () =>
  createSelector(
    [selectAllPosts, (_state, platformId) => platformId],
    (posts, platformId) =>
      posts.filter((post) => post.platformIds.includes(platformId))
  );

export const selectPostsByDate = createSelector(
  [selectAllPosts],
  (posts) => {
    const grouped = {};
    for (const post of posts) {
      const date = new Date(post.publishedAt).toISOString().slice(0, 10);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(post);
    }
    return grouped;
  }
);

export const selectPostCountByPlatform = createSelector(
  [selectAllPosts, selectAllPlatforms],
  (posts, platforms) => {
    const counts = Object.fromEntries(platforms.map((p) => [p.id, 0]));
    for (const post of posts) {
      for (const pid of post.platformIds) {
        counts[pid] = (counts[pid] || 0) + 1;
      }
    }
    return counts;
  }
);

export const makeSelectDraftWithPlatforms = () =>
  createSelector(
    [
      selectDraftsState,
      selectPlatformsState,
      (_state, draftId) => draftId,
    ],
    (drafts, platforms, draftId) => {
      const draft = drafts.byId[draftId];
      if (!draft) return null;
      return {
        ...draft,
        platforms: draft.platformIds.map((id) => platforms.byId[id]),
      };
    }
  );

  export const selectDraftCountByPlatform = createSelector(
  [selectAllDrafts, selectAllPlatforms],
  (drafts, platforms) => {
    const counts = Object.fromEntries(platforms.map((p) => [p.id, 0]));
    for (const draft of drafts) {
      for (const pid of draft.platformIds) {
        counts[pid] = (counts[pid] || 0) + 1;
      }
    }
    return counts;
  }
);