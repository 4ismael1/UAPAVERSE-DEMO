// Iconos SVG inline (heredan el color con currentColor).
type IconProps = { className?: string; size?: number };

export function IconRobot({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="4.5" y="7.5" width="15" height="11" rx="2.5" />
      <path d="M12 3.5v4" />
      <circle cx="12" cy="3" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="13" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="1.25" fill="currentColor" stroke="none" />
      <path d="M9.5 16h5" />
      <path d="M2.5 11.5v3M21.5 11.5v3" />
    </svg>
  );
}

export function IconMic({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21" />
      <path d="M8.5 21h7" />
    </svg>
  );
}

export function IconSpeaker({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 9v6h3.5L13 19V5L7.5 9H4z" fill="currentColor" stroke="none" />
      <path d="M16 9.5a3.5 3.5 0 0 1 0 5" />
      <path d="M18.5 7a7 7 0 0 1 0 10" />
    </svg>
  );
}

export function IconSpeakerMuted({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 9v6h3.5L13 19V5L7.5 9H4z" fill="currentColor" stroke="none" />
      <path d="M17 9.5l4 5M21 9.5l-4 5" />
    </svg>
  );
}

export function IconStop({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
