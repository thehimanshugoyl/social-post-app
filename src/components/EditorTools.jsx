// EditorTools.jsx
// Editor role — analytics view built on memoized selectors (1.1.2 / 1.2.2)

import React from 'react';
import { useSelector } from 'react-redux';
import { selectDraftCountByPlatform, selectAllDrafts } from '../store/selectors';

const PLATFORM_ICONS = {
  twitter: '𝕏',
  instagram: '📷',
  linkedin: 'in',
  facebook: 'f',
};

const PLATFORM_NAMES = {
  twitter: 'Twitter/X',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
};

export default function EditorTools() {
  const counts = useSelector(selectDraftCountByPlatform);
  const drafts = useSelector(selectAllDrafts);

  const total = drafts.length;
  const maxCount = Math.max(1, ...Object.values(counts));

  return (
    <div className="post-creator">
      <div className="header">
        <h2>Editor Tools</h2>
        <p className="subtitle">Draft analytics — visible to editors and admins</p>
      </div>

      <div className="section-label">Overview</div>
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total Drafts</div>
        </div>
      </div>

      <div className="section-label">Drafts by Platform</div>
      <div className="analytics-list">
        {Object.entries(counts).map(([platformId, count]) => (
          <div key={platformId} className="analytics-row">
            <span className="chip-icon small">{PLATFORM_ICONS[platformId]}</span>
            <span className="analytics-name">{PLATFORM_NAMES[platformId]}</span>
            <div className="analytics-bar-track">
              <div
                className="analytics-bar-fill"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="analytics-count">{count}</span>
          </div>
        ))}
      </div>

      {total === 0 && (
        <p className="subtitle" style={{ marginTop: 20 }}>
          No drafts yet — create some from the Dashboard to see analytics here.
        </p>
      )}
    </div>
  );
}