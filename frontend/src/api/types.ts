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

export type CompareRequest = {
  model: string;
  prompt_a_id: string;
  prompt_b_id: string;
  user_input: string;
  params: GenerationParams;
};

export type CompareItemResult = {
  prompt_id: string;
  prompt_name: string;
  assistant_output?: string | null;
  error?: string | null;
  latency_ms?: number;
};

export type CompareResponse = {
  model: string;
  input: string;
  results: CompareItemResult[];
};

export type PromptMeta = {
  id: string;
  name: string;
  tags: string[];
  updated_at?: string;
};

export type PromptTemplate = {
  id: string;
  name: string;
  tags: string[];
  model_defaults: GenerationParams;
  body_md: string;
  updated_at?: string;
};
