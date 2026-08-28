"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, Select, Label, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { conditions, type Phone } from "@/data/phones";

export function EditListingForm({ phone }: { phone: Phone }) {
  const router = useRouter();
  const [price, setPrice] = React.useState(String(phone.price));
  const [condition, setCondition] = React.useState(phone.condition);
  const [description, setDescription] = React.useState(phone.description);
  const [negotiable, setNegotiable] = React.useState(phone.negotiable);
  const [saved, setSaved] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {saved && (
            <p className="flex items-center gap-2 text-sm text-verify-dark bg-verify-tint rounded-[var(--pb-radius-sm)] px-3.5 py-2.5">
              <CheckCircle2 className="h-4 w-4" /> Changes saved.
            </p>
          )}
          <div>
            <Label>Price (PKR)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-ink-soft">
            <Checkbox checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} />
            Price is negotiable
          </label>
          <div>
            <Label>Condition</Label>
            <Select value={condition} onChange={(e) => setCondition(e.target.value as Phone["condition"])}>
              {conditions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" className="text-danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" /> Delete listing
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Card>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete this listing?">
        <p className="text-sm text-ink-soft">
          This will permanently remove {phone.model} from the marketplace. This action can't be undone.
        </p>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => router.push("/dashboard/listings")}>
            Delete Listing
          </Button>
        </div>
      </Modal>
    </>
  );
}
