import { ChatRequest, ChatResponse, ModelInfo } from './types';

const API_BASE = '';

async function extractError(response: Response, fallback: string): Promise<string> {
  try {
    const asJson = await response.json();
    if (asJson?.detail) {
      return typeof asJson.detail === 'string' ? asJson.detail : fallback;
    }
    if (typeof asJson?.error === 'string') {
      return asJson.error;
    }
  } catch (err) {
    const text = await response.text();
    if (text) return text;
  }
  return fallback;
}
export async function fetchModels(): Promise<ModelInfo[]> {
  const response = await fetch(`${API_BASE}/models`);

  if (!response.ok) {
    const message = await extractError(response, 'Failed to fetch models');
    throw new Error(message);
  }

  const data = await response.json();
  return data.models ?? [];
}

export async function sendChat(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await extractError(response, 'Failed to send chat request');
    throw new Error(message);
  }

  return response.json();
}
