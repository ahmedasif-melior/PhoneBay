import type { Metadata } from "next";
import { Section } from "@/components/marketing/Section";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { reviews } from "@/data/reviews";

export const metadata: Metadata = {
  title: "Shop Reviews",
  description: "Reviews and customer feedback for PhoneBay partner shops.",
};

export default function ShopReviewsPage() {
  return (
    <Section className="pt-10 sm:pt-14">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-brand">Shop reviews</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Community feedback</h1>
      </div>

      <div className="space-y-5">
        {reviews.map((review) => (
          <Card key={review.id} className="p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-ink">{review.author}</p>
                <p className="text-sm text-ink-faint">{review.device ?? "Store purchase"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Rating value={review.rating} />
                <span className="text-xs text-ink-faint">{review.date}</span>
              </div>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{review.comment}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
