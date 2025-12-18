'use client';

import React, { useEffect, useState } from 'react';
import ChatPanel from './ChatPanel';
import ComparePanel from './ComparePanel';
import LeftPanel from './layout/LeftPanel';
import ModeTabsLayout, { ModeTab } from './layout/ModeTabsLayout';
import PromptLibraryPanel from './PromptLibraryPanel';
import { fetchModels } from '../api/client';
import type { GenerationParams, ModelInfo, PromptTemplate } from '../api/types';

export default function HomePage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [activePromptName, setActivePromptName] = useState('Custom Prompt');
  const [params, setParams] = useState<GenerationParams>({
    temperature: 0.7,
    top_p: 0.9,
  });
  const [activeTab, setActiveTab] = useState<ModeTab>('config');
  const [promotionNotice, setPromotionNotice] = useState('');
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

  useEffect(() => {
    if (!promotionNotice) return;
    const timer = window.setTimeout(() => setPromotionNotice(''), 2500);
    return () => window.clearTimeout(timer);
  }, [promotionNotice]);

  const handleSystemPromptChange = (value: string) => {
    setSystemPrompt(value);
    setActivePromptName('Custom Prompt');
  };

  const handleApplyPrompt = (body: string, name?: string) => {
    setSystemPrompt(body);
    setActivePromptName(name?.trim() || 'Custom Prompt');
  };

  const handlePromotePrompt = (template: PromptTemplate) => {
    setSystemPrompt(template.body_md ?? '');
    setActivePromptName(template.name?.trim() || 'Custom Prompt');
    setActiveTab('config');
    const label = template.name?.trim() || template.id || 'Prompt';
    setPromotionNotice(`Applied ${label} to System Prompt.`);

    if (template.model_defaults) {
      const updates: GenerationParams = {};
      if (template.model_defaults.temperature !== undefined) {
        updates.temperature = template.model_defaults.temperature;
      }
      if (template.model_defaults.top_p !== undefined) {
        updates.top_p = template.model_defaults.top_p;
      }
      if (template.model_defaults.top_k !== undefined) {
        updates.top_k = template.model_defaults.top_k;
      }
      if (template.model_defaults.max_tokens !== undefined) {
        updates.max_tokens = template.model_defaults.max_tokens;
      }
      if (Object.keys(updates).length) {
        setParams((prev) => ({ ...prev, ...updates }));
      }
    }
  };

  return (
    <ModeTabsLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      configPanel={
        <LeftPanel
          models={models}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          loading={loading}
          error={error}
          systemPrompt={systemPrompt}
          onSystemPromptChange={handleSystemPromptChange}
          params={params}
          onParamsChange={setParams}
          promotionNotice={promotionNotice}
        />
      }
      promptsPanel={<PromptLibraryPanel onApplyPrompt={handleApplyPrompt} />}
      comparePanel={
        <ComparePanel model={selectedModel} params={params} onPromotePrompt={handlePromotePrompt} />
      }
      chatPanel={
        <ChatPanel
          model={selectedModel}
          systemPrompt={systemPrompt}
          activePromptName={activePromptName}
          params={params}
        />
      }
    />
  );
}
