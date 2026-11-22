"use client";
/** MORD-37: descargar el QR como imagen PNG e imprimir solo la licencia. */
export function AccionesLicencia({ qr, codigo }: { qr: string; codigo: string }) {
  return (
    <div className="acciones no-imprimir" style={{ justifyContent: "center" }}>
      <a className="btn grande" href={qr} download={`licencia-${codigo}-QR.png`}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
        Descargar QR
      </a>
      <button type="button" className="sec grande" onClick={() => window.print()}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></svg>
        Imprimir licencia
      </button>
    </div>
  );
}
