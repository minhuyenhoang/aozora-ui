export function Loader({ className }: { className: string }) {
  return (
    <svg fill="none" viewBox="0 0 16 16" className={className}>
      <circle
        className="stroke-current opacity-30"
        cx="8"
        cy="8"
        r="6.5"
        strokeWidth="1.5"
      />
      <circle
        className="origin-center animate-spin stroke-current"
        cx="8"
        cy="8"
        r="6.5"
        strokeWidth="1.5"
        strokeDasharray="10 40"
        strokeLinecap="round"
      />
    </svg>
  );
}
