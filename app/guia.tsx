// MORD-33: bloque reutilizable de "¿Y ahora qué hago?" con pasos grandes y numerados,
// pensado para personas mayores o con poca experiencia digital.
export function Guia({ titulo = "¿Y ahora qué hago?", pasos }: { titulo?: string; pasos: React.ReactNode[] }) {
  return (
    <section className="guia" aria-label={titulo}>
      <h2>{titulo}</h2>
      <ol>
        {pasos.map((p, i) => <li key={i}><span className="num" aria-hidden>{i + 1}</span><div>{p}</div></li>)}
      </ol>
    </section>
  );
}

/** Botón para imprimir la pantalla como comprobante (la hoja impresa oculta menús y botones). */
export function BotonImprimir({ texto = "Imprimir comprobante" }: { texto?: string }) {
  return (
    <button type="button" className="sec grande no-imprimir" onClick={() => window.print()}>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></svg>
      {texto}
    </button>
  );
}
