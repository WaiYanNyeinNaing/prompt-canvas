'use client';

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { comparePrompts, getPrompt, listPrompts } from '../api/client';
import type {
  CompareItemResult,
  CompareResponse,
  GenerationParams,
  ModelInfo,
  PromptMeta,
  PromptTemplate,
} from '../api/types';
import MarkdownMessage from './shared/MarkdownMessage';

type ComparePanelProps = {
  model: string;
  params: GenerationParams;
  onPromotePrompt: (template: PromptTemplate) => void;
  models: ModelInfo[];
  modelsLoading: boolean;
  modelError: string;
};

function resolvePromptName(
  prompts: PromptMeta[],
  promptId: string,
  result: CompareItemResult | null,
): string {
  if (result?.prompt_name) {
    return result.prompt_name;
  }
  const match = prompts.find((prompt) => prompt.id === promptId);
  if (match?.name) {
    return match.name;
  }
  return promptId ? 'Unknown prompt' : 'Select a prompt';
}

function resolveResult(
  response: CompareResponse | null,
  promptId: string,
  fallbackIndex: number,
): CompareItemResult | null {
  if (!response) return null;
  const byId = promptId
    ? response.results.find((result) => result.prompt_id === promptId)
    : undefined;
  return byId ?? response.results[fallbackIndex] ?? null;
}

export default function ComparePanel({
  model,
  params,
  onPromotePrompt,
  models,
  modelsLoading,
  modelError,
}: ComparePanelProps) {
  const [compareModel, setCompareModel] = useState(model);
  const [modelLocked, setModelLocked] = useState(false);
  const [prompts, setPrompts] = useState<PromptMeta[]>([]);
  const [promptAId, setPromptAId] = useState('');
  const [promptBId, setPromptBId] = useState('');
  const [userInput, setUserInput] = useState('');
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [listError, setListError] = useState('');
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState('');
  const [response, setResponse] = useState<CompareResponse | null>(null);
  const [promoteALoading, setPromoteALoading] = useState(false);
  const [promoteBLoading, setPromoteBLoading] = useState(false);
  const [promoteAError, setPromoteAError] = useState('');
  const [promoteBError, setPromoteBError] = useState('');

  const modelReady = useMemo(() => Boolean(compareModel && compareModel.trim()), [compareModel]);
  const promptsEnabled = modelLocked && modelReady;
  const canRun =
    modelReady &&
    modelLocked &&
    promptAId &&
    promptBId &&
    promptAId !== promptBId &&
    userInput.trim() &&
    !running;

  const loadPrompts = useCallback(async () => {
    try {
      setLoadingPrompts(true);
      const data = await listPrompts();
      setPrompts(data);
      setListError('');
    } catch (err) {
      setListError(
        err instanceof Error ? err.message || 'Unable to load prompts' : 'Unable to load prompts',
      );
    } finally {
      setLoadingPrompts(false);
    }
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  useEffect(() => {
    if (modelLocked) return;
    const modelNames = new Set(models.map((item) => item.name));
    let nextModel = compareModel;

    if (nextModel && !modelNames.has(nextModel)) {
      nextModel = '';
    }

    if (!nextModel && model && modelNames.has(model)) {
      nextModel = model;
    }

    if (!nextModel && models.length) {
      nextModel = models[0]?.name ?? '';
    }

    if (nextModel !== compareModel) {
      setCompareModel(nextModel);
    }
  }, [compareModel, model, modelLocked, models]);

  useEffect(() => {
    if (!modelLocked) return;
    if (!prompts.length) {
      if (promptAId) setPromptAId('');
      if (promptBId) setPromptBId('');
      return;
    }

    const promptIds = new Set(prompts.map((prompt) => prompt.id));
    let nextA = promptIds.has(promptAId) ? promptAId : prompts[0]?.id ?? '';
    let nextB = promptIds.has(promptBId) ? promptBId : '';

    if (!nextB || nextB === nextA) {
      nextB = prompts.find((prompt) => prompt.id !== nextA)?.id ?? '';
    }

    if (nextA !== promptAId) setPromptAId(nextA);
    if (nextB !== promptBId) setPromptBId(nextB);
  }, [prompts, promptAId, promptBId, modelLocked]);

  const handleModelChange = (value: string) => {
    setCompareModel(value);
    setResponse(null);
    setRunError('');
    setPromoteAError('');
    setPromoteBError('');
  };

  const handleLockModel = () => {
    if (!modelReady) {
      setRunError('Select a model to lock.');
      return;
    }
    setModelLocked(true);
    setRunError('');
  };

  const handleUnlockModel = () => {
    setModelLocked(false);
    setResponse(null);
    setRunError('');
    setPromoteAError('');
    setPromoteBError('');
  };

  const handlePromptAChange = (value: string) => {
    setPromptAId(value);
    setResponse(null);
    setRunError('');
    setPromoteAError('');
  };

  const handlePromptBChange = (value: string) => {
    setPromptBId(value);
    setResponse(null);
    setRunError('');
    setPromoteBError('');
  };

  const handleInputChange = (value: string) => {
    setUserInput(value);
    setResponse(null);
    setRunError('');
  };

  const handlePromote = async (promptId: string, side: 'A' | 'B') => {
    if (!promptId) {
      if (side === 'A') {
        setPromoteAError('Select a prompt to apply.');
      } else {
        setPromoteBError('Select a prompt to apply.');
      }
      return;
    }

    const setLoading = side === 'A' ? setPromoteALoading : setPromoteBLoading;
    const setError = side === 'A' ? setPromoteAError : setPromoteBError;
    setLoading(true);
    setError('');
    try {
      const template = await getPrompt(promptId);
      onPromotePrompt(template);
    } catch (err) {
      setError(
        err instanceof Error ? err.message || 'Unable to load prompt' : 'Unable to load prompt',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async (event: FormEvent) => {
    event.preventDefault();
    if (!modelReady) {
      setRunError('Select a model before running compare.');
      return;
    }
    if (!modelLocked) {
      setRunError('Lock a model before running compare.');
      return;
    }
    if (!promptAId || !promptBId) {
      setRunError('Select two prompts to compare.');
      return;
    }
    if (promptAId === promptBId) {
      setRunError('Prompt A and Prompt B must be different.');
      return;
    }

    const trimmedInput = userInput.trim();
    if (!trimmedInput) {
      setRunError('User input is required.');
      return;
    }

    setResponse(null);
    setRunning(true);
    setRunError('');
    setPromoteAError('');
    setPromoteBError('');
    try {
      const data = await comparePrompts({
        model: compareModel,
        prompt_a_id: promptAId,
        prompt_b_id: promptBId,
        user_input: trimmedInput,
        params,
      });
      setResponse(data);
    } catch (err) {
      setRunError(
        err instanceof Error ? err.message || 'Unable to run compare' : 'Unable to run compare',
      );
    } finally {
      setRunning(false);
    }
  };

  const resultA = resolveResult(response, promptAId, 0);
  const resultB = resolveResult(response, promptBId, 1);
  const promptAName = resolvePromptName(prompts, promptAId, resultA);
  const promptBName = resolvePromptName(prompts, promptBId, resultB);
  const hasEnoughPrompts = prompts.length >= 2;
  const canPromoteA = Boolean(promptAId && resultA && !promoteALoading && !running);
  const canPromoteB = Boolean(promptBId && resultB && !promoteBLoading && !running);
  const canSwap =
    Boolean(promptAId && promptBId && promptAId !== promptBId) &&
    modelLocked &&
    !running &&
    !loadingPrompts &&
    !promoteALoading &&
    !promoteBLoading;
  const modelLabel = modelReady ? compareModel : 'Select a model';
  const modelSelectDisabled = modelsLoading || !models.length || modelLocked || Boolean(modelError);
  const canLockModel = modelReady && !modelLocked && !modelsLoading && !modelError && !running;
  const canUnlockModel = modelLocked && !running;
  const promptSelectDisabled = loadingPrompts || !prompts.length || !promptsEnabled;

  const handleSwap = () => {
    if (!promptAId || !promptBId) return;
    const nextA = promptBId;
    const nextB = promptAId;
    setPromptAId(nextA);
    setPromptBId(nextB);
    setRunError('');
    setPromoteAError('');
    setPromoteBError('');
  };

  const renderResultBody = (result: CompareItemResult | null, promptId: string) => {
    if (running) {
      return <p className="status">Running...</p>;
    }
    if (!promptId) {
      return <p className="empty">Select a prompt to compare.</p>;
    }
    if (!result) {
      return <p className="empty">Run compare to see output.</p>;
    }
    if (result.error) {
      return <p className="compare-error">{result.error}</p>;
    }
    if (result.assistant_output) {
      return <MarkdownMessage content={result.assistant_output} />;
    }
    return <p className="empty">No output returned.</p>;
  };

  return (
    <section className="compare-panel">
      <div className="compare-controls">
        <div className="compare-controls-header">
          <div>
            <h2>Compare Controls</h2>
            <p className="compare-note">Run the same input against two prompts side-by-side.</p>
          </div>
          <div className="compare-model-readout">
            <span className="compare-model-label">Model</span>
            {modelLocked ? (
              <>
                <span className="compare-model">{modelLabel}</span>
                <button
                  type="button"
                  className="compare-model-action"
                  onClick={handleUnlockModel}
                  disabled={!canUnlockModel}
                >
                  Unlock
                </button>
              </>
            ) : (
              <>
                <select
                  className="compare-model-select"
                  value={compareModel}
                  onChange={(event) => handleModelChange(event.target.value)}
                  disabled={modelSelectDisabled}
                >
                  <option value="" disabled>
                    {modelsLoading ? 'Loading models...' : 'Select a model'}
                  </option>
                  {models.map((modelOption) => (
                    <option key={modelOption.name} value={modelOption.name}>
                      {modelOption.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="compare-model-action compare-model-action--primary"
                  onClick={handleLockModel}
                  disabled={!canLockModel}
                >
                  Lock Model
                </button>
              </>
            )}
          </div>
        </div>
        <form className="compare-form" onSubmit={handleCompare}>
          <div className="compare-selectors">
            <label>
              Prompt A
              <select
                value={promptAId}
                onChange={(event) => handlePromptAChange(event.target.value)}
                disabled={promptSelectDisabled}
              >
                <option value="" disabled>
                  {!promptsEnabled
                    ? 'Lock a model to choose prompts'
                    : loadingPrompts
                      ? 'Loading prompts...'
                      : 'Select a prompt'}
                </option>
                {prompts.map((prompt) => (
                  <option key={prompt.id} value={prompt.id}>
                    {prompt.name || prompt.id}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Prompt B
              <select
                value={promptBId}
                onChange={(event) => handlePromptBChange(event.target.value)}
                disabled={promptSelectDisabled}
              >
                <option value="" disabled>
                  {!promptsEnabled
                    ? 'Lock a model to choose prompts'
                    : loadingPrompts
                      ? 'Loading prompts...'
                      : 'Select a prompt'}
                </option>
                {prompts.map((prompt) => (
                  <option key={prompt.id} value={prompt.id}>
                    {prompt.name || prompt.id}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="compare-input">
            User input
            <textarea
              value={userInput}
              onChange={(event) => handleInputChange(event.target.value)}
              placeholder={
                modelLocked ? 'Type a message to compare...' : 'Lock a model to continue'
              }
              rows={5}
            />
          </label>
          {modelError && <p className="error">{modelError}</p>}
          {listError && <p className="error">{listError}</p>}
          {!listError && !loadingPrompts && !hasEnoughPrompts && (
            <p className="status">Create at least two prompts to run a comparison.</p>
          )}
          {!modelReady && !modelError && (
            <p className="status">Select a model to start comparing.</p>
          )}
          {modelReady && !modelLocked && (
            <p className="status">Lock the model to enable prompt selection.</p>
          )}
          {runError && <p className="error">{runError}</p>}
          <div className="compare-actions">
            <button
              type="button"
              className="compare-swap"
              onClick={handleSwap}
              disabled={!canSwap}
            >
              Swap A/B
            </button>
            <button type="submit" className="compare-run" disabled={!canRun}>
              {running ? 'Running...' : 'Run Compare'}
            </button>
          </div>
        </form>
      </div>

      <div className="compare-results">
        <article className="compare-result-card">
          <div className="compare-result-header">
            <div>
              <span className="compare-result-label">Prompt A</span>
              <h3>{promptAName}</h3>
              <p className="compare-result-meta">{promptAId || 'No prompt selected'}</p>
            </div>
            {resultA?.latency_ms !== undefined && (
              <span className="compare-latency">{resultA.latency_ms} ms</span>
            )}
          </div>
          <div className="compare-output">{renderResultBody(resultA, promptAId)}</div>
          <div className="compare-result-actions">
            <button
              type="button"
              className="compare-use"
              onClick={() => handlePromote(promptAId, 'A')}
              disabled={!canPromoteA}
            >
              {promoteALoading ? 'Applying...' : 'Use This Prompt'}
            </button>
            {promoteAError && <p className="compare-error">{promoteAError}</p>}
          </div>
        </article>
        <article className="compare-result-card">
          <div className="compare-result-header">
            <div>
              <span className="compare-result-label">Prompt B</span>
              <h3>{promptBName}</h3>
              <p className="compare-result-meta">{promptBId || 'No prompt selected'}</p>
            </div>
            {resultB?.latency_ms !== undefined && (
              <span className="compare-latency">{resultB.latency_ms} ms</span>
            )}
          </div>
          <div className="compare-output">{renderResultBody(resultB, promptBId)}</div>
          <div className="compare-result-actions">
            <button
              type="button"
              className="compare-use"
              onClick={() => handlePromote(promptBId, 'B')}
              disabled={!canPromoteB}
            >
              {promoteBLoading ? 'Applying...' : 'Use This Prompt'}
            </button>
            {promoteBError && <p className="compare-error">{promoteBError}</p>}
          </div>
        </article>
      </div>
    </section>
  );
}
