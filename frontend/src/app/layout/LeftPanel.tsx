'use client';

import React, { useEffect, useState } from 'react';
import { fetchModels } from '../../api/client';
import type { ModelInfo } from '../../api/types';

export function LeftPanel() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const availableModels = await fetchModels();
        if (!availableModels.length) {
          setError('No models available. Ensure Ollama is running.');
        } else {
          setModels(availableModels);
          setSelectedModel(availableModels[0]?.name ?? '');
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message || 'Unable to load models'
            : 'Unable to load models',
        );
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  return (
    <div className="left-panel">
      <h2>Model</h2>
      {loading && <p>Loading models…</p>}
      {error && !loading && <p className="error">{error}</p>}
      {!loading && !error && (
        <select
          value={selectedModel}
          onChange={(event) => setSelectedModel(event.target.value)}
        >
          {models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default LeftPanel;
