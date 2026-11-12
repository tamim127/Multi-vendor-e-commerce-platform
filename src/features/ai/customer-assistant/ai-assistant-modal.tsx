'use client';

/**
 * ==============================================================================
 * AI FEATURE — CUSTOMER ASSISTANT CONVERSATION MODAL
 * ==============================================================================
 * Responsive conversational window offering natural language product discovery,
 * recommended product cards, direct PDP navigation, policy summaries, and
 * suggested follow-ups.
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  X,
  RotateCcw,
  Send,
  Star,
  ExternalLink,
  ShieldCheck,
  Truck,
  ArrowRight,
  Bot,
  User,
} from 'lucide-react';
import { useAIAssistant } from './ai-assistant-context';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import { useTranslation } from '@/lib/i18n';

export function AIAssistantModal(): React.JSX.Element | null {
  const {
    isOpen,
    setIsOpen,
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    suggestedPrompts,
  } = useAIAssistant();
  const { locale } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue;
    setInputValue('');
    sendMessage(text);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Shopping Assistant"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
    >
      {/* Container: Full-screen drawer on mobile, floating card on sm+ */}
      <div className="relative flex flex-col w-full sm:w-[440px] h-[92vh] sm:h-[650px] max-h-[92vh] sm:max-h-[680px] bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">Marketplace Assistant</h2>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  AI Demo
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Verified multi-vendor catalog data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={clearHistory}
              title="Clear chat history"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Clear conversation</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close assistant</span>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 space-y-3 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-xs'
                    : 'bg-muted/60 text-foreground border border-border/60 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Structured Assistant Data (Products, Policies, Follow-ups) */}
                {msg.structuredData && (
                  <div className="space-y-3 pt-1 border-t border-border/40">
                    {/* Recommended Product Cards */}
                    {msg.structuredData.recommendedProducts.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Recommended Products
                        </div>
                        <div className="grid gap-2">
                          {msg.structuredData.recommendedProducts.map((prod) => (
                            <Link
                              key={prod.productId}
                              href={`/products/${prod.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-2 hover:border-primary/50 hover:bg-accent/30 transition-all text-card-foreground"
                            >
                              <div className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                <Image
                                  src={prod.primaryImage}
                                  alt={prod.title}
                                  fill
                                  sizes="56px"
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-semibold text-muted-foreground">
                                  {prod.brandName}
                                </div>
                                <div className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                                  {prod.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-bold text-foreground">
                                    {formatMoneyMinor(prod.price, {
                                      locale,
                                    })}
                                  </span>
                                  <div className="flex items-center text-[10px] text-amber-500 font-medium">
                                    <Star className="h-3 w-3 fill-amber-500 mr-0.5" />
                                    {prod.ratingAverage.toFixed(1)}
                                  </div>
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 italic">
                                  {prod.matchReason}
                                </div>
                              </div>

                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mr-1" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Referenced Policies */}
                    {msg.structuredData.referencedPolicies &&
                      msg.structuredData.referencedPolicies.length > 0 && (
                        <div className="space-y-1.5 bg-muted/40 p-2.5 rounded-lg border border-border/50">
                          {msg.structuredData.referencedPolicies.map((p, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[11px]">
                              {p.topic === 'returns' ? (
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <Truck className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                              )}
                              <div>
                                <span className="font-semibold capitalize text-foreground mr-1">
                                  {p.topic}:
                                </span>
                                <span className="text-muted-foreground">{p.summary}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Suggested Follow-Ups */}
                    {msg.structuredData.suggestedFollowUps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.structuredData.suggestedFollowUps.map((promptText, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => sendMessage(promptText)}
                            className="inline-flex items-center gap-1 rounded-full bg-background border border-border px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted hover:border-primary/40 transition-colors"
                          >
                            <span>{promptText}</span>
                            <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Explicit AI Disclaimer */}
                    <div className="text-[10px] text-muted-foreground/75 flex items-center justify-between pt-1">
                      <span>{msg.structuredData.disclaimer}</span>
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5 text-muted-foreground text-xs py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4 animate-spin" />
              </div>
              <div className="flex items-center gap-1">
                <span>Analyzing marketplace catalog...</span>
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-100">●</span>
                <span className="animate-pulse delay-200">●</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-[11px] text-destructive">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Empty state quick suggestions if only greeting exists */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="text-[11px] font-semibold text-muted-foreground mb-1.5">
              Suggested questions:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(p)}
                  className="rounded-lg bg-muted/60 border border-border/80 px-2.5 py-1 text-[11px] text-foreground hover:bg-muted hover:border-primary transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="border-t border-border bg-card p-3">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about laptops, headphones, return policy..."
              disabled={isLoading}
              className="w-full rounded-xl border border-input bg-background pl-3.5 pr-12 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-1.5 text-center text-[10px] text-muted-foreground">
            Marketplace AI Assistant provides verified catalog recommendations.
          </div>
        </form>
      </div>
    </div>
  );
}
