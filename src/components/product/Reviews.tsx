"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Star } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Review, ReviewSummary } from "@/lib/types";
import { useAuth } from "@/store/auth";
import { toast } from "@/store/toast";
import { useHydrated } from "@/components/providers/SettingsProvider";
import { StarRating } from "@/components/ui/StarRating";

interface ReviewsResponse {
  items: Review[];
  total: number;
  page: number;
  pages: number;
  summary: ReviewSummary;
}

interface MyReview {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  approved: boolean;
}

function ReviewForm({ productId, existing, onSaved }: { productId: number; existing: MyReview | null; onSaved: (r: MyReview) => void }) {
  const token = useAuth((s) => s.token);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) {
      toast("Please choose a star rating", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await api<{ review: MyReview }>("/reviews", {
        method: "POST",
        token,
        body: { productId, rating, title: title || undefined, comment: comment || undefined },
      });
      onSaved(res.review);
      toast("Thank you! Your review will appear once approved.");
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 border border-sand bg-cream p-6">
      <h3 className="font-serif text-2xl text-charcoal">{existing ? "Update your review" : "Write a review"}</h3>
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} aria-label={`${n} stars`}>
            <Star size={26} strokeWidth={1} className={clsx("transition-colors", (hover || rating) >= n ? "fill-gold text-gold" : "text-taupe")} />
          </button>
        ))}
      </div>
      <div>
        <label className="label" htmlFor="review-title">
          Title
        </label>
        <input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} className="input" placeholder="Sum it up in a few words" />
      </div>
      <div>
        <label className="label" htmlFor="review-comment">
          Your review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={3000}
          rows={4}
          className="input resize-y"
          placeholder="How does it wear? How long does it last?"
        />
      </div>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}

export function Reviews({ productId, productSlug }: { productId: number; productSlug: string }) {
  const hydrated = useHydrated();
  const token = useAuth((s) => s.token);
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [mine, setMine] = useState<MyReview | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<ReviewsResponse>(`/reviews?productId=${productId}&page=${page}`)
      .then((res) => {
        if (!cancelled) setData((prev) => (page > 1 && prev ? { ...res, items: [...prev.items, ...res.items] } : res));
      })
      .catch(() => {
        if (!cancelled) setData({ items: [], total: 0, page: 1, pages: 1, summary: { average: 0, count: 0, distribution: {} } });
      });
    return () => {
      cancelled = true;
    };
  }, [productId, page]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api<{ review: MyReview | null }>(`/reviews/mine?productId=${productId}`, { token })
      .then((r) => !cancelled && setMine(r.review))
      .catch(() => !cancelled && setMine(null));
    return () => {
      cancelled = true;
    };
  }, [token, productId]);

  const summary = data?.summary;

  return (
    <section id="reviews" className="scroll-mt-28 border-t border-sand py-16 md:py-20">
      <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
        <div>
          <p className="eyebrow mb-3 text-gold">Reviews</p>
          <h2 className="font-serif text-4xl font-light text-charcoal">What our clients say</h2>
          {summary && summary.count > 0 ? (
            <div className="mt-8 space-y-4">
              <div className="flex items-end gap-3">
                <span className="font-serif text-6xl leading-none text-charcoal">{summary.average.toFixed(1)}</span>
                <div className="pb-1">
                  <StarRating value={summary.average} size={16} />
                  <p className="mt-1 text-xs text-taupe">
                    {summary.count} {summary.count === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((n) => {
                  const c = summary.distribution[n] ?? 0;
                  return (
                    <div key={n} className="flex items-center gap-3 text-xs text-ink/70">
                      <span className="w-3">{n}</span>
                      <div className="h-1.5 flex-1 bg-sand">
                        <div className="h-full bg-gold" style={{ width: `${summary.count ? (c / summary.count) * 100 : 0}%` }} />
                      </div>
                      <span className="w-6 text-right">{c}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink/60">No reviews yet. Be the first to share your impressions.</p>
          )}

          <div className="mt-8">
            {!hydrated ? null : token ? (
              <>
                {mine && !mine.approved && !showForm && (
                  <p className="mb-3 text-xs text-espresso">Your review is awaiting approval.</p>
                )}
                {!showForm && (
                  <button onClick={() => setShowForm(true)} className="btn-outline">
                    {mine ? "Edit your review" : "Write a review"}
                  </button>
                )}
              </>
            ) : (
              <Link href={`/account?next=/product/${productSlug}%23reviews`} className="btn-outline">
                Sign in to review
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {showForm && token && (
            <ReviewForm
              productId={productId}
              existing={mine}
              onSaved={(r) => {
                setMine(r);
                setShowForm(false);
              }}
            />
          )}
          {data?.items.map((r) => (
            <article key={r.id} className="border-b border-sand pb-8">
              <div className="flex items-center justify-between gap-4">
                <StarRating value={r.rating} />
                <span className="text-xs text-taupe">{formatDate(r.createdAt)}</span>
              </div>
              {r.title && <h3 className="mt-3 font-serif text-xl text-charcoal">{r.title}</h3>}
              {r.comment && <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink/75">{r.comment}</p>}
              <p className="eyebrow mt-4 text-[10px] text-taupe">{r.authorName}</p>
            </article>
          ))}
          {data && data.page < data.pages && (
            <button onClick={() => setPage((p) => p + 1)} className="btn-outline">
              Load more reviews
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
