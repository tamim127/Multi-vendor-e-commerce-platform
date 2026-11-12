'use client';

/**
 * ==============================================================================
 * AI FEATURE — FLOATING ASSISTANT WIDGET TOGGLE
 * ==============================================================================
 * Unobtrusive floating trigger placed in the bottom right corner of the viewport.
 * Features glowing badge, sparkle animations, and accessible keyboard trigger.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAIAssistant } from './ai-assistant-context';

export function AIAssistantWidget(): React.JSX.Element {
  const { isOpen, toggleOpen } = useAIAssistant();

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden">
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={isOpen ? 'Close AI Shopping Assistant' : 'Open AI Shopping Assistant'}
        aria-expanded={isOpen}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95"
      >
        <span className="sr-only">Toggle AI Shopping Assistant</span>

        {/* Ambient pulse ring */}
        <span className="absolute -inset-0.5 rounded-full bg-primary/30 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />

        {/* Dynamic Icon */}
        <div className="relative flex items-center justify-center">
          <Sparkles className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
        </div>

        {/* Badge */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        </span>

        {/* Tooltip on desktop hover */}
        <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 hidden sm:block border border-border">
          Ask AI Shopping Assistant
        </span>
      </button>
    </div>
  );
}
