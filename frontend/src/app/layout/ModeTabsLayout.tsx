'use client';

import React, { useState } from 'react';

type ModeTab = 'config' | 'prompts' | 'compare';

type ModeTabsLayoutProps = {
  configPanel: React.ReactNode;
  promptsPanel: React.ReactNode;
  comparePanel: React.ReactNode;
  chatPanel: React.ReactNode;
};

export default function ModeTabsLayout({
  configPanel,
  promptsPanel,
  comparePanel,
  chatPanel,
}: ModeTabsLayoutProps) {
  const [activeTab, setActiveTab] = useState<ModeTab>('config');

  return (
    <main className="app-shell">
      <section className="mode-tabs">
        <div className="mode-tabs-header" role="tablist" aria-label="Modes">
          <button
            type="button"
            id="mode-tab-config"
            role="tab"
            aria-selected={activeTab === 'config'}
            aria-controls="mode-panel-config"
            className={activeTab === 'config' ? 'mode-tab active' : 'mode-tab'}
            onClick={() => setActiveTab('config')}
          >
            Config
          </button>
          <button
            type="button"
            id="mode-tab-prompts"
            role="tab"
            aria-selected={activeTab === 'prompts'}
            aria-controls="mode-panel-prompts"
            className={activeTab === 'prompts' ? 'mode-tab active' : 'mode-tab'}
            onClick={() => setActiveTab('prompts')}
          >
            Prompts
          </button>
          <button
            type="button"
            id="mode-tab-compare"
            role="tab"
            aria-selected={activeTab === 'compare'}
            aria-controls="mode-panel-compare"
            className={activeTab === 'compare' ? 'mode-tab active' : 'mode-tab'}
            onClick={() => setActiveTab('compare')}
          >
            Compare
          </button>
        </div>
        <div className="mode-tabs-content">
          <div
            id="mode-panel-config"
            role="tabpanel"
            aria-labelledby="mode-tab-config"
            className="mode-panel"
            hidden={activeTab !== 'config'}
          >
            {configPanel}
          </div>
          <div
            id="mode-panel-prompts"
            role="tabpanel"
            aria-labelledby="mode-tab-prompts"
            className="mode-panel"
            hidden={activeTab !== 'prompts'}
          >
            {promptsPanel}
          </div>
          <div
            id="mode-panel-compare"
            role="tabpanel"
            aria-labelledby="mode-tab-compare"
            className="mode-panel"
            hidden={activeTab !== 'compare'}
          >
            {comparePanel}
          </div>
        </div>
      </section>
      {chatPanel}
    </main>
  );
}
