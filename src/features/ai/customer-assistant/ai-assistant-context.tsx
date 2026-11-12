'use client';

/**
 * ==============================================================================
 * AI FEATURE — CUSTOMER ASSISTANT CONTEXT
 * ==============================================================================
 * Manages customer shopping assistant chat state, message history, suggested prompts,
 * API communication, error handling, and localStorage persistence.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  AssistantChatSessionMessage,
  AssistantStructuredResponse,
} from '@/domains/ai/types/assistant';

interface AIAssistantContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  messages: AssistantChatSessionMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
  suggestedPrompts: string[];
}

const STORAGE_KEY = 'marketplace_ai_assistant_history';

const DEFAULT_SUGGESTIONS = [
  'Find laptops under $2,000',
  'What are top noise cancelling headphones?',
  'What is the 30-day return policy?',
  'Compare running shoes with Nike',
];

const INITIAL_GREETING: AssistantChatSessionMessage = {
  id: 'msg-initial-greeting',
  role: 'assistant',
  content:
    'Hello! I am your marketplace shopping assistant. I can help you discover products, compare specifications, find items within your budget, and explain shipping and return policies.',
  timestamp: new Date().toISOString(),
  status: 'sent',
};

const AIAssistantContext = createContext<AIAssistantContextValue | undefined>(undefined);

export function AIAssistantProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantChatSessionMessage[]>([INITIAL_GREETING]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore history on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore local storage parse errors
    }
  }, []);

  // Save history on change
  const saveHistory = useCallback((newMessages: AssistantChatSessionMessage[]) => {
    setMessages(newMessages);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const clearHistory = useCallback(() => {
    saveHistory([INITIAL_GREETING]);
    setError(null);
  }, [saveHistory]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsgId = `user-${Date.now()}`;
      const userMessage: AssistantChatSessionMessage = {
        id: userMsgId,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      const updatedHistory = [...messages, userMessage];
      setMessages(updatedHistory);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: trimmed,
            history: messages.slice(-5).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.error || `Server responded with status ${response.status}`);
        }

        const data: AssistantStructuredResponse = await response.json();

        const assistantMsg: AssistantChatSessionMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          structuredData: data,
          timestamp: new Date().toISOString(),
          status: 'sent',
        };

        saveHistory([...updatedHistory, assistantMsg]);
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Unable to reach the assistant right now. Please try again.';
        setError(errorMsg);

        const errorAssistantMsg: AssistantChatSessionMessage = {
          id: `asst-err-${Date.now()}`,
          role: 'assistant',
          content: `I'm having trouble processing that right now: ${errorMsg}`,
          timestamp: new Date().toISOString(),
          status: 'error',
          errorMessage: errorMsg,
        };

        saveHistory([...updatedHistory, errorAssistantMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, saveHistory]
  );

  return (
    <AIAssistantContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        messages,
        isLoading,
        error,
        sendMessage,
        clearHistory,
        suggestedPrompts: DEFAULT_SUGGESTIONS,
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant(): AIAssistantContextValue {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
}
