'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { authClient } from '@/lib/auth-client';
import type { ProviderName } from '@/lib/types';

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  preview: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoadConversation: (id: string) => void;
  currentSessionId: string;
  provider: ProviderName;
  model: string;
}

export default function HistoryPanel({ isOpen, onClose, onLoadConversation, currentSessionId, provider, model }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (isOpen && session?.user) {
      fetchConversations();
    }
  }, [isOpen, session?.user]);

  async function fetchConversations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/conversations');
      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to view history');
        } else {
          throw new Error('Failed to fetch conversations');
        }
        return;
      }
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  }

  if (!isOpen) return null;

  return (
    <div className="history-panel-overlay" onClick={onClose}>
      <div className="history-panel" onClick={e => e.stopPropagation()} ref={ref}>
        <div className="history-header">
          <span className="history-title">Conversation History</span>
          <button className="icon-btn" onClick={onClose} title="Close">
            <Icon name="x" size={16} />
          </button>
        </div>

        {!session?.user ? (
          <div className="history-empty">
            <Icon name="log-in" size={32} style={{ color: 'var(--fg-faint)', marginBottom: 12 }} />
            <p style={{ color: 'var(--fg-dim)', marginBottom: 16 }}>Sign in to view your conversation history</p>
            <button className="btn" onClick={() => authClient.signIn.social({ provider: 'github', callbackURL: '/' })}>
              <Icon name="github" size={14} />Sign in with GitHub
            </button>
          </div>
        ) : loading ? (
          <div className="history-loading">
            <span className="spin" style={{ width: 24, height: 24 }} />
            <span style={{ marginLeft: 8, color: 'var(--fg-faint)' }}>Loading conversations…</span>
          </div>
        ) : error ? (
          <div className="history-error" style={{ color: 'var(--red, #f87171)', padding: 16, textAlign: 'center' }}>
            {error}
          </div>
        ) : conversations.length === 0 ? (
          <div className="history-empty">
            <Icon name="message-square" size={32} style={{ color: 'var(--fg-faint)', marginBottom: 12 }} />
            <p style={{ color: 'var(--fg-dim)' }}>No conversations yet</p>
            <p style={{ fontSize: 12, color: 'var(--fg-faint)', marginTop: 4 }}>Start a new task to create your first conversation</p>
          </div>
        ) : (
          <div className="history-list">
            {conversations.map(conv => (
              <button
                key={conv.id}
                className={`history-item ${conv.id === currentSessionId ? 'active' : ''}`}
                onClick={() => onLoadConversation(conv.id)}
                title={conv.preview}
              >
                <div className="history-item-main">
                  <span className="history-item-title" title={conv.title}>{conv.title}</span>
                  <span className="history-item-time">{formatDate(conv.updatedAt)}</span>
                </div>
                <div className="history-item-preview">{conv.preview}</div>
                {conv.id === currentSessionId && (
                  <span className="history-current-badge">Current</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}