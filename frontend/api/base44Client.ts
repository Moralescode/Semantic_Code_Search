const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request(path: string, options?: RequestInit): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const base44 = {
  entities: {
    CodeSnippet: {
      list: (limit?: number) =>
        request('/corpus').then(r => r.entries || []),
      create: (data: Record<string, any>) =>
        request('/index_code', { method: 'POST', body: JSON.stringify(data) }),
    },
    SearchHistory: {
      list: (limit?: number) =>
        request(`/search_history?limit=${limit || 100}`),
      create: (data: Record<string, any>) =>
        request('/save_search', { method: 'POST', body: JSON.stringify(data) }),
    },
    Favorite: {
      list: () => Promise.resolve([]),
      create: (data: Record<string, any>) => Promise.resolve({ success: true }),
      delete: () => Promise.resolve({ success: true }),
    },
  },
  integrations: {
    Core: {
      InvokeLLM: async (params: {
        prompt: string;
        response_json_schema?: Record<string, any>;
        model?: string;
      }): Promise<any> => {
        return request('/explain', {
          method: 'POST',
          body: JSON.stringify({
            name: '',
            language: 'python',
            code: params.prompt,
            docstring: '',
          }),
        });
      },
    },
  },
  search: {
    query: (q: string, language?: string, top_k?: number, use_rerank?: boolean) =>
      request('/search', {
        method: 'POST',
        body: JSON.stringify({ query: q, language, top_k: top_k || 5, use_rerank: use_rerank !== false }),
      }),
  },
  ai: {
    explain: (name: string, language: string, code: string, docstring: string) =>
      request('/explain', { method: 'POST', body: JSON.stringify({ name, language, code, docstring }) }),
    translate: (code: string, source_language: string, target_language: string) =>
      request('/translate', { method: 'POST', body: JSON.stringify({ code, source_language, target_language }) }),
    generate: (description: string, language: string) =>
      request('/generate', { method: 'POST', body: JSON.stringify({ description, language }) }),
    audit: (code: string, language: string) =>
      request('/audit', { method: 'POST', body: JSON.stringify({ code, language }) }),
    optimize: (code: string, language: string) =>
      request('/optimize', { method: 'POST', body: JSON.stringify({ code, language }) }),
    docstring: (code: string, language: string) =>
      request('/docstring', { method: 'POST', body: JSON.stringify({ code, language }) }),
    refactor_duplicate: (code1: string, code2: string, language: string) =>
      request('/refactor_duplicate', { method: 'POST', body: JSON.stringify({ code1, code2, language }) }),
    patch_security: (code: string, language: string) =>
      request('/patch_security', { method: 'POST', body: JSON.stringify({ code, language }) }),
    openapi_spec: (name: string, code: string, language: string) =>
      request('/openapi_spec', { method: 'POST', body: JSON.stringify({ name, code, language }) }),
copilot_chat: (message: string, history: Array<{ role: string; content: string }>) =>
      request('/copilot_chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
  },
  voice: {
    listVoices: (apiKey?: string) =>
      request(`/voices${apiKey ? `?api_key=${encodeURIComponent(apiKey)}` : ''}`),
    speak: (text: string, voiceId?: string) =>
      request('/speak', {
        method: 'POST',
        body: JSON.stringify({ text, voice_id: voiceId || 'EXAVITQu4vrRV9E3zY0' }),
      }),
    testConnection: (apiKey?: string) =>
      request(`/test_elevenlabs${apiKey ? `?api_key=${encodeURIComponent(apiKey)}` : ''}`),
  },
};
