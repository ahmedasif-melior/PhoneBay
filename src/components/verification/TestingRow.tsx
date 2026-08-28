import { BadgeCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TestResult } from "@/data/phones";

export function TestingRow({ result }: { result: TestResult }) {
  const pass = result.status === "pass";
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-ink-soft">{result.label}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-medium font-data",
          pass ? "text-verify-dark" : "text-danger"
        )}
      >
        {pass ? <BadgeCheck className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
        {pass ? "PASS" : "FAIL"}
      </span>
    </div>
  );
}
