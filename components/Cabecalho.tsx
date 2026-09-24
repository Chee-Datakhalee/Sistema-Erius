import Seletor from "./SeletorMes";
import { ITendencia } from "./Icones";

export default function Cabecalho({ titulo, sub, mes }: { titulo: string; sub: string; mes?: string }) {
  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-5 lg:h-[100px] lg:px-8 lg:py-0">
      <div className="mr-auto">
        <h1 className="font-display text-2xl font-bold text-ink lg:text-[32px]">{titulo}</h1>
        <p className="text-sm text-mute lg:text-base">{sub}</p>
      </div>
      {mes && <Seletor mes={mes} />}
      <div className="hidden items-center gap-4 border-l border-line pl-6 text-right xl:flex">
        <p className="text-sm leading-tight text-mute">
          Planejamento hoje,
          <br />
          <span className="font-semibold text-ink">crescimento amanhã.</span>
        </p>
        <ITendencia className="h-7 w-7 text-verde" />
      </div>
    </header>
  );
}
