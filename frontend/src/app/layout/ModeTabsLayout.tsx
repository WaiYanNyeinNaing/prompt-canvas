'use client';

import React, { useState } from 'react';

export type ModeTab = 'config' | 'prompts' | 'compare';

type ModeTabsLayoutProps = {
  configPanel: React.ReactNode;
  promptsPanel: React.ReactNode;
  comparePanel: React.ReactNode;
  chatPanel: React.ReactNode;
  activeTab?: ModeTab;
  onTabChange?: (tab: ModeTab) => void;
};

export default function ModeTabsLayout({
  configPanel,
  promptsPanel,
  comparePanel,
  chatPanel,
  activeTab,
  onTabChange,
}: ModeTabsLayoutProps) {
  const [internalTab, setInternalTab] = useState<ModeTab>('config');
  const currentTab = activeTab ?? internalTab;
  const setActiveTab = onTabChange ?? setInternalTab;
  const isCompare = currentTab === 'compare';

  return (
    <main className={isCompare ? 'app-shell app-shell--compare' : 'app-shell'}>
      <section className="mode-tabs">
        <div className="mode-tabs-header" role="tablist" aria-label="Modes">
          <button
            type="button"
            id="mode-tab-config"
            role="tab"
            aria-selected={currentTab === 'config'}
            aria-controls="mode-panel-config"
            className={currentTab === 'config' ? 'mode-tab active' : 'mode-tab'}
            onClick={() => setActiveTab('config')}
          >
            Config
          </button>
          <button
            type="button"
            id="mode-tab-prompts"
            role="tab"
            aria-selected={currentTab === 'prompts'}
            aria-controls="mode-panel-prompts"
            className={currentTab === 'prompts' ? 'mode-tab active' : 'mode-tab'}
            onClick={() => setActiveTab('prompts')}
          >
            Prompts
          </button>
          <button
            type="button"
            id="mode-tab-compare"
            role="tab"
            aria-selected={currentTab === 'compare'}
            aria-controls="mode-panel-compare"
            className={currentTab === 'compare' ? 'mode-tab active' : 'mode-tab'}
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
            hidden={currentTab !== 'config'}
          >
            {configPanel}
          </div>
          <div
            id="mode-panel-prompts"
            role="tabpanel"
            aria-labelledby="mode-tab-prompts"
            className="mode-panel"
            hidden={currentTab !== 'prompts'}
          >
            {promptsPanel}
          </div>
          <div
            id="mode-panel-compare"
            role="tabpanel"
            aria-labelledby="mode-tab-compare"
            className="mode-panel"
            hidden={currentTab !== 'compare'}
          >
            {comparePanel}
          </div>
        </div>
      </section>
      {chatPanel}
    </main>
  );
}
