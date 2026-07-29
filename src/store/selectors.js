import { createSelector } from '@reduxjs/toolkit';

// ---- Base (input) selectors — cheap, no computation ----
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

// ---- Derived / filtered state ----

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

// ---- Experiment 1.4.1 — Calendar scheduling ----

// Only drafts that have been assigned a scheduled date
export const selectScheduledDrafts = createSelector(
  [selectAllDrafts],
  (drafts) => drafts.filter((d) => Boolean(d.scheduledAt))
);

// Group scheduled drafts by date ('YYYY-MM-DD') for the calendar grid —
// memoized so the calendar doesn't recompute this on every unrelated render
export const selectDraftsByScheduledDate = createSelector(
  [selectScheduledDrafts],
  (drafts) => {
    const grouped = {};
    for (const draft of drafts) {
      (grouped[draft.scheduledAt] ??= []).push(draft);
    }
    return grouped;
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