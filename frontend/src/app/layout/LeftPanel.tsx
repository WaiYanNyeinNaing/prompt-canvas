'use client';

import React from 'react';
import type { GenerationParams, ModelInfo } from '../../api/types';

type LeftPanelProps = {
  models: ModelInfo[];
  selectedModel: string;
  onModelChange: (value: string) => void;
  loading: boolean;
  error: string;
  systemPrompt: string;
  onSystemPromptChange: (value: string) => void;
  params: GenerationParams;
  onParamsChange: (params: GenerationParams) => void;
  promotionNotice?: string;
};

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

export function LeftPanel({
  models,
  selectedModel,
  onModelChange,
  loading,
  error,
  systemPrompt,
  onSystemPromptChange,
  params,
  onParamsChange,
  promotionNotice,
}: LeftPanelProps) {
  return (
    <div className="left-panel">
      {promotionNotice && (
        <div className="promotion-notice" role="status">
          {promotionNotice}
        </div>
      )}
      <div className="config-accordions">
        <details className="config-accordion">
          <summary>Model Selection</summary>
          <div className="accordion-body">
            {loading && <p>Loading models…</p>}
            {error && !loading && <p className="error">{error}</p>}
            {!loading && !error && (
              <select
                value={selectedModel}
                onChange={(event) => onModelChange(event.target.value)}
              >
                {models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </details>

        <details className="config-accordion" open>
          <summary>System Prompt</summary>
          <div className="accordion-body system-prompt">
            <textarea
              value={systemPrompt}
              onChange={(event) => onSystemPromptChange(event.target.value)}
              placeholder="You are a helpful assistant."
              rows={6}
            />
          </div>
        </details>

        <details className="config-accordion">
          <summary>Generation Parameters</summary>
          <div className="accordion-body params">
            <label>
              Temperature
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={params.temperature ?? ''}
                onChange={(event) =>
                  onParamsChange({
                    ...params,
                    temperature: parseFloatOrUndefined(event.target.value),
                  })
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
                value={params.top_p ?? ''}
                onChange={(event) =>
                  onParamsChange({
                    ...params,
                    top_p: parseFloatOrUndefined(event.target.value),
                  })
                }
              />
            </label>
            <label>
              Top K
              <input
                type="number"
                step="1"
                min="1"
                value={params.top_k ?? ''}
                onChange={(event) =>
                  onParamsChange({
                    ...params,
                    top_k: parseIntOrUndefined(event.target.value),
                  })
                }
              />
            </label>
            <label>
              Max Tokens
              <input
                type="number"
                step="16"
                min="1"
                value={params.max_tokens ?? ''}
                onChange={(event) =>
                  onParamsChange({
                    ...params,
                    max_tokens: parseIntOrUndefined(event.target.value),
                  })
                }
              />
            </label>
          </div>
        </details>
      </div>
    </div>
  );
}

export default LeftPanel;
