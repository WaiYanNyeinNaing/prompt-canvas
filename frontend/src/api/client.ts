import { ChatRequest, ChatResponse, ModelInfo, PromptMeta, PromptTemplate } from './types';

// Call backend directly to avoid Next.js dev proxy timeout on long LLM requests
const API_BASE = 'http://127.0.0.1:8000';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(input: RequestInfo | URL, init: RequestInit, retries = 1): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    if (retries <= 0) throw err;
    // This commonly happens when the backend restarts (dev reload) and the proxy resets the socket.
    await delay(250);
    return fetchWithRetry(input, init, retries - 1);
  }
}

function extractErrorMessage(payload: unknown, rawText: string, fallback: string): string {
  if (payload && typeof payload === 'object') {
    const asRecord = payload as Record<string, unknown>;
    const detail = asRecord.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    const error = asRecord.error;
    if (typeof error === 'string') {
      return error;
    }
  }
  if (rawText) {
    return rawText;
  }
  return fallback;
}

async function parseJsonResponse<T>(response: Response, fallback: string): Promise<T> {
  let text = '';
  try {
    text = await response.text();
  } catch (err) {
    if (!response.ok) {
      throw new Error(fallback);
    }
    return {} as T;
  }

  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (err) {
      if (!response.ok) {
        throw new Error(text || fallback);
      }
      throw new Error('Invalid JSON response.');
    }
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, text, fallback));
  }

  return (payload ?? {}) as T;
}
export async function fetchModels(): Promise<ModelInfo[]> {
  const response = await fetchWithRetry(`${API_BASE}/models`, {}, 1);

  const data = await parseJsonResponse<{ models?: ModelInfo[] }>(
    response,
    'Failed to fetch models',
  );
  return data.models ?? [];
}

export async function sendChat(request: ChatRequest): Promise<ChatResponse> {
  const params = request.params ?? {};
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as ChatRequest['params'];
  const cleanedRequest: ChatRequest = {
    ...request,
    params: cleanedParams,
  };

  const response = await fetchWithRetry(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cleanedRequest),
  }, 1);

  return parseJsonResponse<ChatResponse>(response, 'Failed to send chat request');
}

export async function listPrompts(query?: string): Promise<PromptMeta[]> {
  const queryString = query ? `?query=${encodeURIComponent(query)}` : '';
  const response = await fetchWithRetry(`${API_BASE}/prompts${queryString}`, {}, 1);

  const data = await parseJsonResponse<{ prompts?: PromptMeta[] }>(
    response,
    'Failed to fetch prompts',
  );
  return data.prompts ?? [];
}

export async function getPrompt(id: string): Promise<PromptTemplate> {
  const response = await fetchWithRetry(`${API_BASE}/prompts/${id}`, {}, 1);

  const data = await parseJsonResponse<{ prompt: PromptTemplate }>(
    response,
    'Failed to fetch prompt',
  );
  return data.prompt;
}

export async function createPrompt(payload: PromptTemplate): Promise<PromptTemplate> {
  const response = await fetchWithRetry(`${API_BASE}/prompts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }, 1);

  const data = await parseJsonResponse<{ prompt: PromptTemplate }>(
    response,
    'Failed to create prompt',
  );
  return data.prompt;
}

export async function updatePrompt(id: string, payload: PromptTemplate): Promise<PromptTemplate> {
  const response = await fetchWithRetry(`${API_BASE}/prompts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }, 1);

  const data = await parseJsonResponse<{ prompt: PromptTemplate }>(
    response,
    'Failed to update prompt',
  );
  return data.prompt;
}

export async function deletePrompt(id: string): Promise<void> {
  const response = await fetchWithRetry(`${API_BASE}/prompts/${id}`, {
    method: 'DELETE',
  }, 1);

  await parseJsonResponse(response, 'Failed to delete prompt');
}
