// PostCreator.jsx
import React, { useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { draftCreated, draftUpdated, draftDeleted } from '../store/postsSlice';
import { selectAllPlatforms, selectAllDrafts } from '../store/selectors';

const HASHTAG_REGEX = /#[\w]+/g;

const PLATFORM_ICONS = {
  twitter: '𝕏',
  instagram: '📷',
  linkedin: 'in',
  facebook: 'f',
};

function validateForPlatform(text, media, platform) {
  const errors = [];
  const charCount = text.length;

  if (charCount > platform.charLimit) {
    errors.push(
      `${charCount - platform.charLimit} characters over the ${platform.charLimit} limit`
    );
  }

  if (media.length > platform.maxMedia) {
    errors.push(`${media.length} media items exceeds max of ${platform.maxMedia}`);
  }

  if (platform.id === 'twitter') {
    const hashtags = text.match(HASHTAG_REGEX) || [];
    if (hashtags.length > 3) {
      errors.push(`too many hashtags (${hashtags.length}/3 recommended)`);
    }
  }

  return errors;
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function PostCreator({ readOnly = false }) {
  const dispatch = useDispatch();
  const platforms = useSelector(selectAllPlatforms);
  const drafts = useSelector(selectAllDrafts);

  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const [selectedPlatformIds, setSelectedPlatformIds] = useState([]);
  const [draftId, setDraftId] = useState(null);
  const [saved, setSaved] = useState(false);

  const selectedPlatforms = useMemo(
    () => platforms.filter((p) => selectedPlatformIds.includes(p.id)),
    [platforms, selectedPlatformIds]
  );

  const validationByPlatform = useMemo(() => {
    const result = {};
    for (const platform of selectedPlatforms) {
      result[platform.id] = validateForPlatform(text, media, platform);
    }
    return result;
  }, [selectedPlatforms, text, media]);

  const hasErrors = useMemo(
    () => Object.values(validationByPlatform).some((errs) => errs.length > 0),
    [validationByPlatform]
  );

  const togglePlatform = useCallback((platformId) => {
    if (readOnly) return;
    setSaved(false);
    setSelectedPlatformIds((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  }, [readOnly]);

  const handleTextChange = useCallback(
    (e) => {
      if (readOnly) return;
      const value = e.target.value;
      setText(value);
      setSaved(false);
      if (draftId) {
        dispatch(draftUpdated({ id: draftId, changes: { text: value } }));
      }
    },
    [draftId, dispatch, readOnly]
  );

  const handleAddMedia = useCallback((e) => {
    if (readOnly) return;
    const files = Array.from(e.target.files || []).map((f) => ({
      name: f.name,
      type: f.type,
    }));
    setMedia((prev) => [...prev, ...files]);
    setSaved(false);
  }, [readOnly]);

  const handleSaveDraft = useCallback(() => {
    if (readOnly) return;
    if (!draftId) {
      const action = draftCreated({ text, platformIds: selectedPlatformIds, media });
      dispatch(action);
      setDraftId(action.payload.id);
    } else {
      dispatch(
        draftUpdated({
          id: draftId,
          changes: { text, platformIds: selectedPlatformIds, media },
        })
      );
    }
    setSaved(true);
  }, [draftId, text, selectedPlatformIds, media, dispatch, readOnly]);

  const handleNewPost = useCallback(() => {
    setText('');
    setMedia([]);
    setSelectedPlatformIds([]);
    setDraftId(null);
    setSaved(false);
  }, []);

  const handleLoadDraft = useCallback((draft) => {
    setText(draft.text);
    setMedia(draft.media);
    setSelectedPlatformIds(draft.platformIds);
    setDraftId(draft.id);
    setSaved(true);
  }, []);

  const handleDeleteDraft = useCallback(
    (id, e) => {
      e.stopPropagation();
      if (readOnly) return;
      dispatch(draftDeleted(id));
      if (id === draftId) handleNewPost();
    },
    [dispatch, draftId, handleNewPost, readOnly]
  );

  const tightestLimit = useMemo(() => {
    if (selectedPlatforms.length === 0) return null;
    return Math.min(...selectedPlatforms.map((p) => p.charLimit));
  }, [selectedPlatforms]);

  const percentUsed = tightestLimit ? Math.min((text.length / tightestLimit) * 100, 100) : 0;
  const isOver = tightestLimit !== null && text.length > tightestLimit;

  return (
    <div className="post-creator">
      <div className="header">
        <h2>{readOnly ? 'View Posts' : 'Create Post'}</h2>
        <p className="subtitle">
          {readOnly ? 'Read-only — viewers cannot create or edit posts' : 'Compose once, publish everywhere'}
        </p>
      </div>

      <div className="section-label">Platforms</div>
      <div className="platform-select">
        {platforms.map((platform) => {
          const active = selectedPlatformIds.includes(platform.id);
          return (
            <label
              key={platform.id}
              className={`platform-chip ${active ? 'active' : ''} ${readOnly ? 'disabled' : ''}`}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => togglePlatform(platform.id)}
                disabled={readOnly}
              />
              <span className="chip-icon">{PLATFORM_ICONS[platform.id]}</span>
              {platform.name}
            </label>
          );
        })}
      </div>

      <div className="section-label">Content</div>
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="What do you want to share?"
        rows={6}
        disabled={readOnly}
      />

      {tightestLimit !== null && (
        <div className="counter-block">
          <div className="progress-track">
            <div
              className={`progress-fill ${isOver ? 'over' : ''}`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <div className={`char-counter ${isOver ? 'over-limit' : ''}`}>
            {text.length} / {tightestLimit}
          </div>
        </div>
      )}

      <div className="media-row">
        <label className={`file-btn ${readOnly ? 'disabled' : ''}`}>
          Attach media
          <input
            type="file"
            multiple
            onChange={handleAddMedia}
            accept="image/*,video/*"
            disabled={readOnly}
          />
        </label>
        <span className="media-count">{media.length} attached</span>
      </div>

      {selectedPlatforms.length > 0 && <div className="section-label">Validation</div>}
      <div className="feedback-grid">
        {selectedPlatforms.map((platform) => {
          const errors = validationByPlatform[platform.id] || [];
          return (
            <div
              key={platform.id}
              className={`platform-feedback ${errors.length ? 'has-error' : 'is-ok'}`}
            >
              <div className="feedback-head">
                <span className="chip-icon small">{PLATFORM_ICONS[platform.id]}</span>
                <strong>{platform.name}</strong>
              </div>
              {errors.length === 0 ? (
                <span className="ok">✓ Ready to publish</span>
              ) : (
                <ul className="errors">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {!readOnly && (
        <div className="button-row">
          <button
            onClick={handleSaveDraft}
            disabled={selectedPlatformIds.length === 0 || hasErrors}
          >
            {saved ? '✓ Draft Saved' : draftId ? 'Update Draft' : 'Save Draft'}
          </button>
          {draftId && (
            <button className="secondary" onClick={handleNewPost} type="button">
              New Post
            </button>
          )}
        </div>
      )}

      {drafts.length > 0 && (
        <>
          <div className="section-label drafts-label">Saved Drafts ({drafts.length})</div>
          <div className="drafts-list">
            {drafts
              .slice()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((draft) => (
                <div
                  key={draft.id}
                  className={`draft-item ${draft.id === draftId ? 'active' : ''}`}
                  onClick={() => !readOnly && handleLoadDraft(draft)}
                >
                  <div className="draft-icons">
                    {draft.platformIds.map((pid) => (
                      <span key={pid} className="chip-icon small">
                        {PLATFORM_ICONS[pid]}
                      </span>
                    ))}
                  </div>
                  <div className="draft-text">
                    {draft.text.trim() ? draft.text.slice(0, 60) : '(empty draft)'}
                    {draft.text.length > 60 ? '…' : ''}
                  </div>
                  <div className="draft-meta">
                    <span>{timeAgo(draft.updatedAt)}</span>
                    {!readOnly && (
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDeleteDraft(draft.id, e)}
                        type="button"
                        aria-label="Delete draft"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}