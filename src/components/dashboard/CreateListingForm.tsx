"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, ShieldCheck, CheckCircle2, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, Select, Label, Checkbox, HelperText } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { StepProgress } from "@/components/dashboard/StepProgress";
import { brands, conditions, locations } from "@/data/phones";

const steps = ["Device", "Condition", "Photos", "Pricing", "Location", "Verification"];

interface ListingData {
  brand: string;
  model: string;
  storage: string;
  color: string;
  condition: string;
  batteryHealth: number;
  repairHistory: string;
  photoCount: number;
  imageUrls: string[];
  price: string;
  negotiable: boolean;
  city: string;
  area: string;
  requestVerification: boolean;
}

const initial: ListingData = {
  brand: "",
  model: "",
  storage: "",
  color: "",
  condition: "",
  batteryHealth: 90,
  repairHistory: "",
  photoCount: 0,
  imageUrls: [],
  price: "",
  negotiable: true,
  city: "",
  area: "",
  requestVerification: true,
};

export function CreateListingForm() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState<ListingData>(initial);
  const [published, setPublished] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const set = <K extends keyof ListingData>(key: K, value: ListingData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files).slice(0, 8 - data.imageUrls.length);
    Promise.all(selected.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }))).then((images) => setData((current) => ({
      ...current,
      imageUrls: [...current.imageUrls, ...images],
      photoCount: current.imageUrls.length + images.length,
    })));
  };

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canProceed = () => {
    switch (step) {
      case 0:
        return data.brand && data.model && data.storage;
      case 1:
        return !!data.condition;
      case 2:
        return data.photoCount > 0;
      case 3:
        return !!data.price;
      case 4:
        return !!data.city;
      default:
        return true;
    }
  };

  const publish = async () => {
    setSubmitting(true);
    setError("");
    const response = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand: data.brand,
        model: data.model,
        storage: data.storage,
        color: data.color || null,
        condition: data.condition,
        price: Number(data.price),
        negotiable: data.negotiable,
        city: data.city,
        area: data.area || null,
        batteryHealth: data.batteryHealth,
        repairHistory: data.repairHistory || null,
        photoCount: data.photoCount,
        imageUrls: data.imageUrls,
        requestVerification: data.requestVerification,
      }),
    });
    const result = await response.json().catch(() => ({}));
    setSubmitting(false);
    if (!response.ok) {
      setError(result.error ?? "Unable to publish this listing. Please try again.");
      return;
    }
    setPublished(true);
  };

  if (published) {
    return (
      <Card className="text-center py-12">
        <CheckCircle2 className="h-12 w-12 text-verify mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-ink">Listing published</h2>
        <p className="text-sm text-ink-soft mt-2 max-w-sm mx-auto">
          Your {data.brand} {data.model} is now live on PhoneBay marketplace.
          {data.requestVerification && " We'll notify you once a verified partner accepts your testing request."}
        </p>
        <div className="flex gap-3 justify-center mt-7">
          <Button variant="outline" onClick={() => router.push("/dashboard/listings")}>
            View My Listings
          </Button>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <StepProgress steps={steps} current={step} />

      <div className="mt-8 min-h-[280px]">
        {error && <Alert tone="danger" className="mb-5">{error}</Alert>}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg text-ink">Device details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label required>Brand</Label>
                <Select value={data.brand} onChange={(e) => set("brand", e.target.value)}>
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label required>Model</Label>
                <Input value={data.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g. iPhone 15 Pro" />
              </div>
              <div>
                <Label required>Storage</Label>
                <Select value={data.storage} onChange={(e) => set("storage", e.target.value)}>
                  <option value="">Select storage</option>
                  {["64GB", "128GB", "256GB", "512GB", "1TB"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Color</Label>
                <Input value={data.color} onChange={(e) => set("color", e.target.value)} placeholder="e.g. Natural Titanium" />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-semibold text-lg text-ink">Condition</h2>
            <div>
              <Label required>Condition</Label>
              <div className="grid grid-cols-3 gap-3">
                {conditions.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => set("condition", c)}
                    className={`rounded-[var(--pb-radius-sm)] border px-4 py-3 text-sm font-medium transition-colors ${
                      data.condition === c
                        ? "border-brand bg-brand-tint text-brand-dark"
                        : "border-border-strong text-ink-soft hover:border-ink-faint"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Battery health: {data.batteryHealth}%</Label>
              <input
                type="range"
                min={50}
                max={100}
                value={data.batteryHealth}
                onChange={(e) => set("batteryHealth", Number(e.target.value))}
                className="w-full accent-[var(--pb-brand)]"
              />
            </div>
            <div>
              <Label>Repair history</Label>
              <Textarea
                value={data.repairHistory}
                onChange={(e) => set("repairHistory", e.target.value)}
                placeholder="e.g. Screen replaced in March 2026 at an authorized service center"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg text-ink">Photos</h2>
            <p className="text-sm text-ink-soft">Add at least one clear photo of the device.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {data.imageUrls.map((image, i) => (
                <div key={i} className="relative aspect-square rounded-[var(--pb-radius-sm)] bg-brand-tint border border-border flex items-center justify-center">
                  <img src={image} alt={`Device photo ${i + 1}`} className="h-full w-full object-cover rounded-[var(--pb-radius-sm)]" />
                  <button
                    type="button"
                    onClick={() => setData((current) => ({ ...current, imageUrls: current.imageUrls.filter((_, index) => index !== i), photoCount: current.photoCount - 1 }))}
                    aria-label="Remove photo"
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-ink text-white rounded-full flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {data.imageUrls.length < 8 && (
                <button
                  type="button"
                  onClick={() => document.getElementById("listing-photos")?.click()}
                  className="aspect-square rounded-[var(--pb-radius-sm)] border-2 border-dashed border-border-strong flex flex-col items-center justify-center gap-1.5 text-ink-faint hover:border-brand hover:text-brand"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs font-medium">Add photo</span>
                </button>
              )}
            </div>
            <input id="listing-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
            <HelperText>Upload up to 8 JPG, PNG, or WebP images. Images are saved with your listing.</HelperText>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4 max-w-sm">
            <h2 className="font-semibold text-lg text-ink">Pricing</h2>
            <div>
              <Label required>Price (PKR)</Label>
              <Input
                type="number"
                value={data.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="e.g. 150000"
              />
            </div>
            <label className="flex items-center gap-2.5 text-sm text-ink-soft">
              <Checkbox checked={data.negotiable} onChange={(e) => set("negotiable", e.target.checked)} />
              Price is negotiable
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4 max-w-sm">
            <h2 className="font-semibold text-lg text-ink">Location</h2>
            <div>
              <Label required>City</Label>
              <Select value={data.city} onChange={(e) => set("city", e.target.value)}>
                <option value="">Select city</option>
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Area</Label>
              <Input value={data.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Blue Area" />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg text-ink">Verification</h2>
            <Alert tone="success" title="Get a verified badge and testing certificate.">
              Requesting verification connects you with a nearby PhoneBay partner shop for a
              free 12-point inspection. Verified listings sell up to 3.2x faster.
            </Alert>
            <label className="flex items-center gap-3 rounded-[var(--pb-radius-sm)] border border-border-strong px-4 py-3.5 cursor-pointer">
              <Checkbox
                checked={data.requestVerification}
                onChange={(e) => set("requestVerification", e.target.checked)}
              />
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <ShieldCheck className="h-4 w-4 text-verify" />
                Request professional verification
              </span>
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button variant="ghost" onClick={back} disabled={step === 0}>
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={next} disabled={!canProceed()}>
            Continue
          </Button>
        ) : (
          <Button onClick={publish} loading={submitting}>
            Publish Listing
          </Button>
        )}
      </div>
    </Card>
  );
}
