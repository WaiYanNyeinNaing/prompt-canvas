'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const emptyTemplate: PromptTemplate = {
  id: '',
  name: '',
  tags: [],
  model_defaults: {},
  body_md: '',
  updated_at: undefined,
};

function normalizeTemplate(template: PromptTemplate): PromptTemplate {
  return {
    ...template,
    tags: template.tags ?? [],
    model_defaults: template.model_defaults ?? {},
    body_md: template.body_md ?? '',
  };
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
  const [draft, setDraft] = useState<PromptTemplate>(emptyTemplate);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const isNew = useMemo(() => selectedId === null, [selectedId]);

  const loadPrompts = useCallback(async (currentQuery: string) => {
    try {
      setLoadingList(true);
      const data = await listPrompts(currentQuery || undefined);
      setPrompts(data);
      setError('');
    } catch (err) {
      setError(
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
    setStatus('');
    setError('');
    try {
      setLoadingPrompt(true);
      const prompt = await getPrompt(promptId);
      setDraft(normalizeTemplate(prompt));
    } catch (err) {
      setError(
        err instanceof Error ? err.message || 'Unable to load prompt' : 'Unable to load prompt',
      );
    } finally {
      setLoadingPrompt(false);
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setDraft(emptyTemplate);
    setStatus('');
    setError('');
  };

  const handleSave = async () => {
    if (!draft.id.trim() || !draft.name.trim()) {
      setError('Prompt id and name are required.');
      return;
    }
    setSaving(true);
    setError('');
    setStatus('');
    try {
      const payload: PromptTemplate = normalizeTemplate({
        ...draft,
        tags: draft.tags,
        model_defaults: draft.model_defaults ?? {},
      });
      const saved = isNew ? await createPrompt(payload) : await updatePrompt(payload.id, payload);
      setDraft(normalizeTemplate(saved));
      setSelectedId(saved.id);
      setStatus(isNew ? 'Prompt created.' : 'Prompt updated.');
      await loadPrompts(query);
    } catch (err) {
      setError(err instanceof Error ? err.message || 'Unable to save prompt' : 'Unable to save prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setDeleting(true);
    setError('');
    setStatus('');
    try {
      await deletePrompt(selectedId);
      setStatus('Prompt deleted.');
      setSelectedId(null);
      setDraft(emptyTemplate);
      await loadPrompts(query);
    } catch (err) {
      setError(
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

        {loadingPrompt && <p>Loading prompt…</p>}
        {error && <p className="error">{error}</p>}
        {status && !error && <p className="status">{status}</p>}

        <div className="prompt-actions">
          <button type="button" onClick={() => onApplyPrompt(draft.body_md)} disabled={!draft.body_md}>
            Apply to System Prompt
          </button>
          <button type="button" onClick={handleSave} disabled={saving || loadingPrompt}>
            {saving ? 'Saving…' : isNew ? 'Create Prompt' : 'Update Prompt'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isNew || deleting}
          >
            {deleting ? 'Deleting…' : 'Delete Prompt'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default PromptLibraryPanel;
