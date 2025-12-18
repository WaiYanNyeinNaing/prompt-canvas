'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  createPrompt,
  deletePrompt,
  getPrompt,
  listPrompts,
  updatePrompt,
} from '../api/client';
import type { GenerationParams, PromptMeta, PromptTemplate } from '../api/types';

type PromptLibraryPanelProps = {
  onApplyPrompt: (body: string) => void;
};

const createEmptyTemplate = (): PromptTemplate => ({
  id: '',
  name: '',
  tags: [],
  model_defaults: {},
  body_md: '',
  updated_at: undefined,
});

function normalizeTemplate(template: PromptTemplate): PromptTemplate {
  return {
    ...template,
    tags: template.tags ?? [],
    model_defaults: template.model_defaults ?? {},
    body_md: template.body_md ?? '',
  };
}

type DefaultItem = {
  label: string;
  value: number;
};

function getDefaultItems(defaults: GenerationParams | undefined): DefaultItem[] {
  if (!defaults) return [];
  const items: DefaultItem[] = [];
  if (defaults.temperature !== undefined) {
    items.push({ label: 'Temperature', value: defaults.temperature });
  }
  if (defaults.top_p !== undefined) {
    items.push({ label: 'Top P', value: defaults.top_p });
  }
  if (defaults.top_k !== undefined) {
    items.push({ label: 'Top K', value: defaults.top_k });
  }
  if (defaults.max_tokens !== undefined) {
    items.push({ label: 'Max Tokens', value: defaults.max_tokens });
  }
  return items;
}

function parseFloatOrUndefined(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseIntOrUndefined(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function PromptLibraryPanel({ onApplyPrompt }: PromptLibraryPanelProps) {
  const [query, setQuery] = useState('');
  const [prompts, setPrompts] = useState<PromptMeta[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [draft, setDraft] = useState<PromptTemplate>(createEmptyTemplate());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [listError, setListError] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [editorError, setEditorError] = useState('');
  const [editorStatus, setEditorStatus] = useState('');

  const isNew = editingId === null;

  const loadPrompts = useCallback(async (currentQuery: string) => {
    try {
      setLoadingList(true);
      const data = await listPrompts(currentQuery || undefined);
      setPrompts(data);
      setListError('');
    } catch (err) {
      setListError(
        err instanceof Error ? err.message || 'Unable to load prompts' : 'Unable to load prompts',
      );
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadPrompts(query);
  }, [loadPrompts, query]);

  const handleSelect = async (promptId: string) => {
    setSelectedId(promptId);
    setSelectedPrompt(null);
    setPreviewError('');
    try {
      setLoadingPrompt(true);
      const prompt = await getPrompt(promptId);
      setSelectedPrompt(normalizeTemplate(prompt));
    } catch (err) {
      setSelectedPrompt(null);
      setPreviewError(
        err instanceof Error ? err.message || 'Unable to load prompt' : 'Unable to load prompt',
      );
    } finally {
      setLoadingPrompt(false);
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setDraft(createEmptyTemplate());
    setEditorError('');
    setEditorStatus('');
    setIsEditorOpen(true);
  };

  const handleEditSelected = () => {
    if (!selectedPrompt) return;
    setEditingId(selectedPrompt.id);
    setDraft(normalizeTemplate(selectedPrompt));
    setEditorError('');
    setEditorStatus('');
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingId(null);
    setDraft(createEmptyTemplate());
    setEditorError('');
    setEditorStatus('');
  };

  const handleSave = async () => {
    if (!draft.id.trim() || !draft.name.trim()) {
      setEditorError('Prompt id and name are required.');
      return;
    }
    setSaving(true);
    setEditorError('');
    setEditorStatus('');
    try {
      const payload: PromptTemplate = normalizeTemplate({
        ...draft,
        tags: draft.tags,
        model_defaults: draft.model_defaults ?? {},
      });
      const saved = isNew ? await createPrompt(payload) : await updatePrompt(payload.id, payload);
      const normalized = normalizeTemplate(saved);
      setDraft(normalized);
      setEditingId(normalized.id);
      setSelectedId(normalized.id);
      setSelectedPrompt(normalized);
      setEditorStatus(isNew ? 'Prompt created.' : 'Prompt updated.');
      await loadPrompts(query);
    } catch (err) {
      setEditorError(
        err instanceof Error ? err.message || 'Unable to save prompt' : 'Unable to save prompt',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    setDeleting(true);
    setEditorError('');
    setEditorStatus('');
    try {
      await deletePrompt(draft.id);
      setEditorStatus('Prompt deleted.');
      setEditingId(null);
      setDraft(createEmptyTemplate());
      if (selectedId === draft.id) {
        setSelectedId(null);
        setSelectedPrompt(null);
      }
      await loadPrompts(query);
    } catch (err) {
      setEditorError(
        err instanceof Error ? err.message || 'Unable to delete prompt' : 'Unable to delete prompt',
      );
    } finally {
      setDeleting(false);
    }
  };

  const updateDefaults = (updates: Partial<GenerationParams>) => {
    setDraft((prev) => ({
      ...prev,
      model_defaults: {
        ...(prev.model_defaults ?? {}),
        ...updates,
      },
    }));
  };

  const defaultItems = selectedPrompt ? getDefaultItems(selectedPrompt.model_defaults) : [];

  return (
    <section className="prompt-library-panel">
      <div className="prompt-library-header">
        <h2>Prompt Library</h2>
        <button type="button" onClick={handleNew}>
          New
        </button>
      </div>

      <label className="prompt-search">
        Search
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, id, or tag"
        />
      </label>

      {listError && <p className="error">{listError}</p>}

      <div className="prompt-list">
        {loadingList && <p>Loading prompts…</p>}
        {!loadingList && prompts.length === 0 && (
          <p className="empty">No prompts yet. Create one to get started.</p>
        )}
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            className={prompt.id === selectedId ? 'active' : ''}
            onClick={() => handleSelect(prompt.id)}
          >
            <span className="prompt-title">{prompt.name}</span>
            <span className="prompt-meta">{prompt.id}</span>
            {prompt.updated_at && <span className="prompt-meta">Updated {prompt.updated_at}</span>}
          </button>
        ))}
      </div>

      {(loadingPrompt || selectedPrompt || previewError) && (
        <div className="prompt-preview">
          {loadingPrompt && <p>Loading prompt…</p>}
          {!loadingPrompt && selectedPrompt && (
            <>
              <div className="prompt-preview-header">
                <div>
                  <h3>{selectedPrompt.name || 'Untitled prompt'}</h3>
                  <p className="prompt-preview-subtitle">{selectedPrompt.id}</p>
                </div>
                <div className="prompt-preview-actions">
                  <button
                    type="button"
                    onClick={() => onApplyPrompt(selectedPrompt.body_md)}
                    disabled={!selectedPrompt.body_md}
                  >
                    Apply to System Prompt
                  </button>
                  <button type="button" onClick={handleEditSelected}>
                    Edit
                  </button>
                </div>
              </div>
              <div className="prompt-preview-meta">
                <div className="prompt-preview-row">
                  <span className="prompt-preview-label">Tags</span>
                  <span className="prompt-preview-value">
                    {selectedPrompt.tags.length ? selectedPrompt.tags.join(', ') : 'No tags'}
                  </span>
                </div>
                {selectedPrompt.updated_at && (
                  <div className="prompt-preview-row">
                    <span className="prompt-preview-label">Updated</span>
                    <span className="prompt-preview-value">{selectedPrompt.updated_at}</span>
                  </div>
                )}
                <div className="prompt-preview-row">
                  <span className="prompt-preview-label">Defaults</span>
                  <span className="prompt-preview-value">
                    {defaultItems.length
                      ? defaultItems.map((item) => `${item.label}: ${item.value}`).join(' | ')
                      : 'None'}
                  </span>
                </div>
              </div>
              <div className="prompt-preview-section">
                <h4>Markdown Body</h4>
                {selectedPrompt.body_md ? (
                  <pre className="prompt-preview-body">{selectedPrompt.body_md}</pre>
                ) : (
                  <p className="empty">No markdown body yet.</p>
                )}
              </div>
            </>
          )}
          {previewError && <p className="error">{previewError}</p>}
        </div>
      )}

      {isEditorOpen && (
        <div className="prompt-editor-overlay" role="presentation">
          <div
            className="prompt-editor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-editor-title"
          >
            <div className="prompt-editor-header">
              <h3 id="prompt-editor-title">{isNew ? 'Create Prompt' : 'Edit Prompt'}</h3>
              <button type="button" className="prompt-editor-close" onClick={handleCloseEditor}>
                Close
              </button>
            </div>

            <div className="prompt-editor">
              <div className="prompt-editor-grid">
                <label>
                  Id
                  <input
                    type="text"
                    value={draft.id}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, id: event.target.value }))
                    }
                    placeholder="customer_support_v1"
                    disabled={!isNew}
                  />
                </label>
                <label>
                  Name
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Customer Support Assistant"
                  />
                </label>
              </div>

              <label>
                Tags
                <input
                  type="text"
                  value={draft.tags.join(', ')}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, tags: parseTags(event.target.value) }))
                  }
                  placeholder="support, tone"
                />
              </label>

              <div className="prompt-defaults">
                <h3>Model Defaults</h3>
                <div className="prompt-defaults-grid">
                  <label>
                    Temperature
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={draft.model_defaults.temperature ?? ''}
                      onChange={(event) =>
                        updateDefaults({ temperature: parseFloatOrUndefined(event.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Top P
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={draft.model_defaults.top_p ?? ''}
                      onChange={(event) =>
                        updateDefaults({ top_p: parseFloatOrUndefined(event.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Top K
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={draft.model_defaults.top_k ?? ''}
                      onChange={(event) =>
                        updateDefaults({ top_k: parseIntOrUndefined(event.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Max Tokens
                    <input
                      type="number"
                      step="16"
                      min="1"
                      value={draft.model_defaults.max_tokens ?? ''}
                      onChange={(event) =>
                        updateDefaults({ max_tokens: parseIntOrUndefined(event.target.value) })
                      }
                    />
                  </label>
                </div>
              </div>

              <label>
                Markdown Body
                <textarea
                  value={draft.body_md}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, body_md: event.target.value }))
                  }
                  rows={10}
                  placeholder="Write the system prompt markdown here."
                />
              </label>

              {editorError && <p className="error">{editorError}</p>}
              {editorStatus && !editorError && <p className="status">{editorStatus}</p>}

              <div className="prompt-actions">
                <button
                  type="button"
                  onClick={() => onApplyPrompt(draft.body_md)}
                  disabled={!draft.body_md}
                >
                  Apply to System Prompt
                </button>
                <button type="button" onClick={handleSave} disabled={saving || loadingPrompt}>
                  {saving ? 'Saving…' : isNew ? 'Create Prompt' : 'Update Prompt'}
                </button>
                <button type="button" onClick={handleDelete} disabled={isNew || deleting}>
                  {deleting ? 'Deleting…' : 'Delete Prompt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PromptLibraryPanel;
