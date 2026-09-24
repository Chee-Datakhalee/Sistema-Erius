export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
        <rect x="5" y="6" width="6" height="28" fill="#00AEEF" />
        <rect x="14" y="6" width="6" height="28" fill="#EC008C" />
        <rect x="23" y="6" width="6" height="28" fill="#FFF200" />
        <rect x="32" y="6" width="3" height="28" fill="#FAFAFA" />
      </svg>
      <div className="leading-none">
        <div className="font-display text-[24px] font-bold tracking-wide text-ink">
          <span style={{ color: "#00AEEF" }}>E</span>rius
        </div>
        <div className="mt-1 text-[9px] uppercase tracking-wider text-mute">Personalizados e Impressos</div>
      </div>
    </div>
  );
}
