export type ModelInfo = {
  name: string;
  digest?: string;
  modified_at?: string;
  size?: number;
};

export type GenerationParams = {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
};

export type ChatRequest = {
  model: string;
  system_prompt: string;
  user_input: string;
  params: GenerationParams;
};

export type ChatResponse = {
  assistant_output: string;
  model: string;
  latency_ms?: number;
};
