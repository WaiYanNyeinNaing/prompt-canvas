## Verification Plan (Manual)
- `GET /models` returns configured Gemini models.
- `POST /chat` works with a system prompt + user input and returns text.
- `POST /compare` returns two results; handles partial failures cleanly.
- Error cases return clear messages if the API key is missing or the Gemini API is unreachable.

