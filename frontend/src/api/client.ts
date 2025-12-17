import { ModelInfo } from './types';

const API_BASE = '';

export async function fetchModels(): Promise<ModelInfo[]> {
  const response = await fetch(`${API_BASE}/models`);

  if (!response.ok) {
    let message = 'Failed to fetch models';
    try {
      const errorBody = await response.json();
      message = errorBody?.detail ?? message;
    } catch (err) {
      const fallback = await response.text();
      if (fallback) {
        message = fallback;
      }
    }

    throw new Error(message);
  }

  const data = await response.json();
  return data.models ?? [];
}
