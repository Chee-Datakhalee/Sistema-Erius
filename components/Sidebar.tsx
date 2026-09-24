"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Logo from "./Logo";
import { ICasa, ICarteira, IEtiqueta, IPessoas, IGrafico, IEngrenagem, IPedido } from "./Icones";

const itens = [
  { href: "/", nome: "Dashboard", I: ICasa },
  { href: "/fluxo", nome: "Fluxo de Caixa", I: ICarteira },
  { href: "/gastos", nome: "Gastos", I: IEtiqueta },
  { href: "/clientes", nome: "Clientes", I: IPessoas },
  { href: "/orcamentos", nome: "Orçamentos", I: IPedido },
  { href: "/faturamento", nome: "Faturamento e Lucro", I: IGrafico },
  { href: "/config", nome: "Configurações", I: IEngrenagem },
];

export default function Sidebar() {
  const path = usePathname();
  const sp = useSearchParams();
  const mes = sp.get("mes");
  const q = mes ? `?mes=${mes}` : "";
  return (
    <aside className="border-line bg-[#050505] lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[218px] lg:shrink-0 lg:flex-col lg:border-r">
      <div className="flex h-[76px] items-center border-b border-line px-5 lg:h-[100px] lg:px-7">
        <Logo />
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 lg:flex-col lg:border-0 lg:px-0 lg:py-5">
        {itens.map(({ href, nome, I }) => {
          const ativo = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href + q}
              className={`relative flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-4 py-2.5 text-[15px] lg:mx-2 lg:py-3 ${
                ativo ? "bg-ink/10 font-semibold text-ink" : "text-mute hover:text-ink"
              }`}
            >
              {ativo && <span className="absolute left-[-8px] top-1 bottom-1 hidden w-1 rounded-r bg-ink lg:block" />}
              <I className={`h-5 w-5 shrink-0 ${ativo ? "text-ink" : ""}`} />
              {nome}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden px-7 pb-10 lg:block">
        <p className="font-display text-[17px] leading-snug text-mute">Grandes resultados vêm de boas decisões.</p>
        <div className="mt-5 h-0.5 w-10 bg-ciano" />
      </div>
    </aside>
  );
}
