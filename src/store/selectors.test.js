import { describe, it, expect } from 'vitest';
import postsReducer, { draftCreated, draftScheduled } from './postsSlice';
import { selectDraftsByScheduledDate, selectAllDrafts } from './selectors';

function buildRootState(actions) {
  let posts = postsReducer(undefined, { type: '@@INIT' });
  for (const action of actions) {
    posts = postsReducer(posts, action);
  }
  return { posts };
}

describe('selectDraftsByScheduledDate (Experiment 1.4.1)', () => {
  it('excludes unscheduled drafts', () => {
    const created = draftCreated({ text: 'no date', platformIds: ['twitter'] });
    const state = buildRootState([created]);
    const grouped = selectDraftsByScheduledDate(state);
    expect(grouped).toEqual({});
  });

  it('groups scheduled drafts under their date key', () => {
    const created = draftCreated({ text: 'draft A', platformIds: ['twitter'] });
    let state = buildRootState([created]);
    const id = selectAllDrafts(state)[0].id;
    state = { posts: postsReducer(state.posts, draftScheduled({ id, scheduledAt: '2026-07-30' })) };

    const grouped = selectDraftsByScheduledDate(state);
    expect(Object.keys(grouped)).toEqual(['2026-07-30']);
    expect(grouped['2026-07-30']).toHaveLength(1);
    expect(grouped['2026-07-30'][0].id).toBe(id);
  });

  it('groups two drafts scheduled on the same date together', () => {
    let state = buildRootState([
      draftCreated({ text: 'draft A', platformIds: ['twitter'] }),
      draftCreated({ text: 'draft B', platformIds: ['linkedin'] }),
    ]);
    const [idA, idB] = selectAllDrafts(state).map((d) => d.id);
    let posts = postsReducer(state.posts, draftScheduled({ id: idA, scheduledAt: '2026-08-01' }));
    posts = postsReducer(posts, draftScheduled({ id: idB, scheduledAt: '2026-08-01' }));
    state = { posts };

    const grouped = selectDraftsByScheduledDate(state);
    expect(grouped['2026-08-01']).toHaveLength(2);
  });
});