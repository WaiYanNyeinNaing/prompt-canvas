## Risks and Mitigations
- Missing/invalid API key: fail early with a clear 4xx/5xx message.
- Model name mismatch: restrict requests to configured model list.
- Latency or quota issues: surface a descriptive error and keep retries minimal.

