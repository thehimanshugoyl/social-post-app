import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import postsReducer, { draftCreated } from '../store/postsSlice';
import authReducer from '../store/authSlice';
import ScheduleCalendar from './ScheduleCalendar';

// Minimal DataTransfer polyfill — jsdom's native drag events don't carry
// dataTransfer payloads the way a real browser does, so we back it with a
// plain object the same way the component's own handlers expect
// (setData('text/draft-id', id) / getData('text/draft-id')).
function makeDataTransfer() {
  const store = {};
  return {
    setData: (type, val) => { store[type] = val; },
    getData: (type) => store[type] ?? '',
  };
}

function renderCalendarWithDraft(draftText = 'my unscheduled draft') {
  const store = configureStore({
    reducer: { posts: postsReducer, auth: authReducer },
  });
  store.dispatch(draftCreated({ text: draftText, platformIds: ['twitter'] }));

  render(
    <Provider store={store}>
      <ScheduleCalendar />
    </Provider>
  );
  return store;
}

describe('ScheduleCalendar drag-and-drop (Experiment 1.4.1)', () => {
  it('shows the unscheduled draft in the pool before any drop', () => {
    renderCalendarWithDraft('draft to schedule');
    expect(screen.getByText('Unscheduled Drafts')).toBeInTheDocument();
    expect(screen.getByText(/draft to schedule/)).toBeInTheDocument();
  });

  it('moves a draft from the pool onto a calendar date on drop', () => {
    const store = renderCalendarWithDraft('drag me');
    const draftEl = screen.getByText(/drag me/).closest('.cal-event');
    const dateCells = document.querySelectorAll('.cal-cell:not(.cal-cell-empty)');
    const targetCell = dateCells[10]; // some day in the currently-viewed month

    const dataTransfer = makeDataTransfer();

    fireEvent.dragStart(draftEl, { dataTransfer });
    fireEvent.dragOver(targetCell, { dataTransfer });
    fireEvent.drop(targetCell, { dataTransfer });

    const state = store.getState();
    const draft = Object.values(state.posts.drafts.byId)[0];
    expect(draft.scheduledAt).toBeTruthy();

    // The draft should now render inside the calendar cell, not the pool
    expect(targetCell.textContent).toContain('drag me');
  });

  it('does nothing on drop if dataTransfer carries no draft id', () => {
    const store = renderCalendarWithDraft('untouched draft');
    const dateCells = document.querySelectorAll('.cal-cell:not(.cal-cell-empty)');
    const targetCell = dateCells[5];

    fireEvent.drop(targetCell, { dataTransfer: makeDataTransfer() });

    const state = store.getState();
    const draft = Object.values(state.posts.drafts.byId)[0];
    expect(draft.scheduledAt).toBeUndefined();
  });
});