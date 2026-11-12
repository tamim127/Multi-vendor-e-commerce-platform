'use client';

/**
 * ==============================================================================
 * AI FEATURE — SELLER AI OPTIMIZATION STUDIO
 * ==============================================================================
 * Seller-facing AI assistant offering listing copy generation, title optimization,
 * SEO tags, attribute extraction, and listing quality scorecards.
 * STRICT SAFETY RULE: AI-generated copy is editable and requires explicit seller
 * approval before saving or publishing to live marketplace catalog.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  FileText,
  Search,
  ListPlus,
  ShieldAlert,
} from 'lucide-react';
import type {
  ProductTitleSuggestion,
  ProductDescriptionDraft,
  SeoMetadataSuggestion,
  ListingQualityScore,
} from '@/domains/ai/types/seller-ai';

export function SellerAiToolsView(): React.JSX.Element {
  const [productTitle, setProductTitle] = useState('Pro Wireless Noise-Cancelling Headphones');
  const [brandName, setBrandName] = useState('Aura Sound Labs');
  const [category, setCategory] = useState('Electronics > Audio > Headphones');
  const [rawNotes, setRawNotes] = useState(
    'Bluetooth 5.3, 40hr battery, ANC with 8 mics, memory foam earcups, USB-C fast charge, lightweight 250g.'
  );
  const [targetAudience, setTargetAudience] = useState('Audiophiles and daily commuters');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hasAppliedToDraft, setHasAppliedToDraft] = useState(false);

  // Results state
  const [titles, setTitles] = useState<ProductTitleSuggestion[]>([]);
  const [description, setDescription] = useState<ProductDescriptionDraft | null>(null);
  const [seo, setSeo] = useState<SeoMetadataSuggestion | null>(null);
  const [quality, setQuality] = useState<ListingQualityScore | null>(null);

  // Editable drafts
  const [editableTitle, setEditableTitle] = useState('');
  const [editableShortDesc, setEditableShortDesc] = useState('');
  const [editableBulletPoints, setEditableBulletPoints] = useState<string[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasAppliedToDraft(false);

    try {
      const response = await fetch('/api/ai/seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle,
          brandName,
          category,
          rawNotes,
          targetAudience,
          keyFeatures: rawNotes.split(',').map((s) => s.trim()),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate suggestions.');
      }

      const data = await response.json();
      setTitles(data.titleSuggestions);
      setDescription(data.descriptionDraft);
      setSeo(data.seo);
      setQuality(data.quality);

      // Populate editable fields
      if (data.titleSuggestions?.[0]) {
        setEditableTitle(data.titleSuggestions[0].title);
      }
      if (data.descriptionDraft) {
        setEditableShortDesc(data.descriptionDraft.shortDescription);
        setEditableBulletPoints(data.descriptionDraft.bulletPoints);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during AI generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyToDraft = () => {
    setHasAppliedToDraft(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Safety Notice */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Seller AI Optimization Studio
              </h2>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Demo Studio
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Generate optimized product titles, persuasive descriptions, SEO metadata, and listing
              quality audits.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-card border border-border p-3 text-xs text-muted-foreground">
            <ShieldAlert className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>
              <strong>Editorial Control:</strong> All AI drafts remain editable and require your
              review before publishing.
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Product Specifications Input
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label
                  htmlFor="ai-product-title"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Working Product Name *
                </label>
                <input
                  id="ai-product-title"
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="ai-brand-name"
                    className="block text-xs font-semibold text-foreground mb-1"
                  >
                    Brand Name
                  </label>
                  <input
                    id="ai-brand-name"
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ai-category"
                    className="block text-xs font-semibold text-foreground mb-1"
                  >
                    Category
                  </label>
                  <input
                    id="ai-category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="ai-raw-specs"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Raw Technical Specs & Keywords *
                </label>
                <textarea
                  id="ai-raw-specs"
                  rows={4}
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  placeholder="Paste raw vendor specs, materials, battery life, connectivity..."
                  required
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label
                  htmlFor="ai-target-audience"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Target Audience
                </label>
                <input
                  id="ai-target-audience"
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !productTitle.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>Synthesizing Copy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate AI Listing Assets</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: AI Output & Editable Draft */}
        <div className="lg:col-span-7 space-y-6">
          {!description && !isLoading && (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[350px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">AI Studio Ready</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Enter your product details and click generate to produce market-ready titles, bullet
                points, SEO tags, and listing quality scores.
              </p>
            </div>
          )}

          {description && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Quality Scorecard */}
              {quality && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-foreground">
                      Listing Quality Audit Score
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-3.5 w-3.5" /> {quality.overallScore}/100 Grade A
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="text-[10px] text-muted-foreground">Title</div>
                      <div className="font-bold text-foreground">{quality.titleScore}%</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="text-[10px] text-muted-foreground">Description</div>
                      <div className="font-bold text-foreground">{quality.descriptionScore}%</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="text-[10px] text-muted-foreground">Attributes</div>
                      <div className="font-bold text-foreground">
                        {quality.attributeCoverageScore}%
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="text-[10px] text-muted-foreground">Media Guidance</div>
                      <div className="font-bold text-foreground">{quality.imageGuidanceScore}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Title Suggestions */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Search className="h-4 w-4 text-primary" /> Title Variations
                  </h3>
                  <span className="text-[10px] text-muted-foreground">Click to edit title</span>
                </div>

                <div className="space-y-2">
                  {titles.map((t, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-foreground">{t.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span>{t.characterCount} chars</span>
                          <span>•</span>
                          <span>Score: {t.readabilityScore}/100</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditableTitle(t.title)}
                        className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent transition-colors"
                      >
                        Use Title
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable Listing Draft */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Editable Listing Draft</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Review and adjust copy before applying to inventory catalog.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyToDraft}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                  >
                    {hasAppliedToDraft ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Approved & Stored
                      </>
                    ) : (
                      <>
                        <ListPlus className="h-3.5 w-3.5" /> Approve & Apply to Store
                      </>
                    )}
                  </button>
                </div>

                {hasAppliedToDraft && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <Check className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Copy approved and staged in your seller drafts. Remember to set price and
                      inventory before publishing!
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="ai-editable-title"
                      className="block text-xs font-semibold text-muted-foreground mb-1"
                    >
                      Active Listing Title
                    </label>
                    <input
                      id="ai-editable-title"
                      type="text"
                      value={editableTitle}
                      onChange={(e) => setEditableTitle(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs font-semibold text-foreground"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ai-editable-desc"
                      className="block text-xs font-semibold text-muted-foreground mb-1"
                    >
                      Short Description
                    </label>
                    <textarea
                      id="ai-editable-desc"
                      rows={2}
                      value={editableShortDesc}
                      onChange={(e) => setEditableShortDesc(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Key Bullet Points
                    </label>
                    <div className="space-y-1.5">
                      {editableBulletPoints.map((bp, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={bp}
                            onChange={(e) => {
                              const updated = [...editableBulletPoints];
                              updated[i] = e.target.value;
                              setEditableBulletPoints(updated);
                            }}
                            className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Meta Tags */}
              {seo && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground">SEO Search Engine Preview</h3>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `Title: ${seo.metaTitle}\nDesc: ${seo.metaDescription}\nSlug: ${seo.canonicalSlugSuggestion}`,
                          'seo'
                        )
                      }
                      className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                    >
                      {copiedKey === 'seo' ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      Copy SEO Pack
                    </button>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1 font-sans">
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
                      {seo.metaTitle}
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      https://marketplace.example/products/{seo.canonicalSlugSuggestion}
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {seo.metaDescription}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

