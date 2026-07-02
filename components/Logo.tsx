/** Marca Keedio Tender Radar: un radar (anillos + barrido + blip) en el color de marca. */
export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="#5b94ff" strokeOpacity="0.35" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="8.5" stroke="#5b94ff" strokeOpacity="0.35" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="4" stroke="#5b94ff" strokeOpacity="0.35" strokeWidth="1.6" />
      {/* Barrido del radar */}
      <path d="M16 16 L26.5 7.5" stroke="#5b94ff" strokeWidth="2.2" strokeLinecap="round" />
      {/* Blip detectado */}
      <circle cx="22.5" cy="10.5" r="2.6" fill="#5b94ff" />
    </svg>
  );
}
