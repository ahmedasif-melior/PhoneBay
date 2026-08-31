import { Button } from "@/components/ui/Button";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <Button variant="outline" fullWidth type="button" onClick={() => { window.location.href = "/api/auth/google"; }}>
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.54 5.54 0 0 1-2.4 3.64v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3a7.4 7.4 0 0 1-4.07 1.14c-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.27a12 12 0 0 0 0 10.76l4-3.11z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.62l4 3.11C6.22 6.88 8.87 4.77 12 4.77z"
        />
      </svg>
      {label}
    </Button>
  );
}

export function Divider({ label = "OR" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-6" role="separator">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-ink-faint">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
