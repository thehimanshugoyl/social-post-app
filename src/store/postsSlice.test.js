import { describe, it, expect } from 'vitest';
import postsReducer, { draftCreated, draftScheduled } from './postsSlice';

function makeStateWithDraft(text = 'hello world') {
  const state = postsReducer(undefined, { type: '@@INIT' });
  const created = draftCreated({ text, platformIds: ['twitter'], media: [] });
  const nextState = postsReducer(state, created);
  const id = nextState.drafts.allIds[0];
  return { state: nextState, id };
}

describe('postsSlice — draftScheduled (Experiment 1.4.1)', () => {
  it('sets scheduledAt on the target draft', () => {
    const { state, id } = makeStateWithDraft();
    const next = postsReducer(state, draftScheduled({ id, scheduledAt: '2026-07-30' }));
    expect(next.drafts.byId[id].scheduledAt).toBe('2026-07-30');
  });

  it('bumps updatedAt when scheduled', () => {
    const { state, id } = makeStateWithDraft();
    const before = state.drafts.byId[id].updatedAt;
    const next = postsReducer(state, draftScheduled({ id, scheduledAt: '2026-07-30' }));
    expect(next.drafts.byId[id].updatedAt).toBeGreaterThanOrEqual(before);
  });

  it('does nothing if the draft id does not exist', () => {
    const { state } = makeStateWithDraft();
    const next = postsReducer(state, draftScheduled({ id: 'not-real', scheduledAt: '2026-07-30' }));
    expect(next).toEqual(state);
  });

  it('re-scheduling an already-scheduled draft overwrites the date', () => {
    const { state, id } = makeStateWithDraft();
    const once = postsReducer(state, draftScheduled({ id, scheduledAt: '2026-07-30' }));
    const twice = postsReducer(once, draftScheduled({ id, scheduledAt: '2026-08-05' }));
    expect(twice.drafts.byId[id].scheduledAt).toBe('2026-08-05');
  });
});