'use client';

import React from 'react';

export default function ComparePlaceholderPanel() {
  return (
    <div className="compare-panel">
      <div className="compare-card">
        <div className="compare-card-header">
          <h2>Compare Prompts</h2>
          <p className="compare-note">Comparison coming soon.</p>
        </div>
        <div className="compare-selectors">
          <label>
            Prompt A
            <select disabled aria-disabled="true">
              <option>Select a prompt</option>
            </select>
          </label>
          <label>
            Prompt B
            <select disabled aria-disabled="true">
              <option>Select a prompt</option>
            </select>
          </label>
        </div>
        <button type="button" className="compare-run" disabled aria-disabled="true">
          Run Compare
        </button>
      </div>
    </div>
  );
}
