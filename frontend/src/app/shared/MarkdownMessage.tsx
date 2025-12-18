'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownMessageProps = {
  content: string;
  className?: string;
};

export default function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  const classes = ['markdown', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
