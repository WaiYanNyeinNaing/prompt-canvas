'use client';

import React, { FormEvent, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendChat } from '../api/client';
import type { GenerationParams } from '../api/types';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
  error?: boolean;
};

type ChatPanelProps = {
  model: string;
  systemPrompt: string;
  params: GenerationParams;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ChatPanel({ model, systemPrompt, params }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const modelReady = useMemo(() => Boolean(model && model.trim()), [model]);
  const canClear = messages.length > 0 || sending;

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedMessageId(messageId);
      window.setTimeout(() => setCopiedMessageId((prev) => (prev === messageId ? null : prev)), 1200);
    } catch (err) {
      setStatus('Copy failed.');
    }
  };

  const handleSend = async (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    if (!modelReady) {
      setStatus('Select a model before sending a message.');
      return;
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: trimmed,
    };
    const pendingId = createId();
    const assistantPlaceholder: ChatMessage = {
      id: pendingId,
      role: 'assistant',
      content: 'Thinking…',
      pending: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setInput('');
    setSending(true);
    setStatus('');
    setConfirmClear(false);

    try {
      const response = await sendChat({
        model,
        system_prompt: systemPrompt,
        user_input: trimmed,
        params,
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === pendingId
            ? { ...msg, content: response.assistant_output, pending: false, error: false }
            : msg,
        ),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message || 'Unable to reach backend' : 'Unable to reach backend';
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === pendingId
            ? { ...msg, content: `Error: ${message}`, pending: false, error: true }
            : msg,
        ),
      );
      setStatus(message);
    } finally {
      setSending(false);
    }
  };

  const handleClear = () => {
    if (!canClear) return;
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setMessages([]);
    setSending(false);
    setStatus('');
    setCopiedMessageId(null);
    setConfirmClear(false);
  };

  const handleCancelClear = () => {
    setConfirmClear(false);
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>Chat</h2>
        <div className="chat-actions">
          {confirmClear ? (
            <>
              <button type="button" className="clear-button confirm" onClick={handleClear}>
                Confirm
              </button>
              <button type="button" className="clear-button cancel" onClick={handleCancelClear}>
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              disabled={!canClear}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="chat-transcript">
        {messages.length === 0 && <p className="empty">Start a conversation by sending a message.</p>}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.role} ${msg.pending ? 'pending' : ''} ${
              msg.error ? 'error' : ''
            }`}
          >
            <div className="chat-message-header">
              <strong>{msg.role === 'user' ? 'You' : 'Assistant'}</strong>
              {!msg.pending && !msg.error && (
                <button
                  type="button"
                  className="copy-button"
                  onClick={() => copyToClipboard(msg.content, msg.id)}
                  aria-label={`Copy ${msg.role} message`}
                  title="Copy"
                >
                  {copiedMessageId === msg.id ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div className="markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      {status && <p className="status">{status}</p>}
      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder={modelReady ? 'Type your message…' : 'Select a model to start'}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={sending || !modelReady}
        />
        <button type="submit" disabled={sending || !modelReady || !input.trim()}>
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
