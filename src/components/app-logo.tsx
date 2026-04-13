import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-6 h-6", className)}
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(190, 90%, 30%)" /> {/* Primary Teal */}
          <stop offset="100%" stopColor="hsl(220, 80%, 45%)" /> {/* Secondary Blue */}
        </linearGradient>
      </defs>
      <path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        stroke="url(#logo-grad)"
        fill="none"
      />
      <path
        d="M3.5 12h5l1.5-3.5 2 7 1.5-3.5h7"
        stroke="url(#logo-grad)"
        strokeWidth="2"
      />
    </svg>
  );
}
