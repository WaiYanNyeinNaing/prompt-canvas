'use client';

import React, { useEffect, useState } from 'react';
import ChatPanel from './ChatPanel';
import ComparePlaceholderPanel from './ComparePlaceholderPanel';
import LeftPanel from './layout/LeftPanel';
import ModeTabsLayout from './layout/ModeTabsLayout';
import PromptLibraryPanel from './PromptLibraryPanel';
import { fetchModels } from '../api/client';
import type { GenerationParams, ModelInfo } from '../api/types';

export default function HomePage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [params, setParams] = useState<GenerationParams>({
    temperature: 0.7,
    top_p: 0.9,
  });
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
          setError('');
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
    <ModeTabsLayout
      configPanel={
        <LeftPanel
          models={models}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          loading={loading}
          error={error}
          systemPrompt={systemPrompt}
          onSystemPromptChange={setSystemPrompt}
          params={params}
          onParamsChange={setParams}
        />
      }
      promptsPanel={<PromptLibraryPanel onApplyPrompt={setSystemPrompt} />}
      comparePanel={<ComparePlaceholderPanel />}
      chatPanel={<ChatPanel model={selectedModel} systemPrompt={systemPrompt} params={params} />}
    />
  );
}
