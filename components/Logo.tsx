export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden>
        <path d="M6 30 L22 6 L30 6 L14 30Z" fill="#22C55E" />
        <path d="M14 34 L26 16 L34 16 L22 34Z" fill="#16A34A" />
        <path d="M4 22 L10 13 L16 13 L10 22Z" fill="#4ADE80" />
      </svg>
      <div className="leading-none">
        <div className="font-display text-[26px] font-bold tracking-wide text-ink">ERIUS</div>
        <div className="mt-1 text-[10px] text-mute">Personalizados e Impressos</div>
      </div>
    </div>
  );
}
