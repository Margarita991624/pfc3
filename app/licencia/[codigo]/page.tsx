"use client";
import { use, useEffect, useState } from "react";

type Licencia = { razonSocial: string; ruc: string; giro: string; puesto: string; vigente: boolean; codigoLicencia: string; qr: string };

export default function VerLicencia({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = use(params);
  const [lic, setLic] = useState<Licencia | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/licencias/${encodeURIComponent(codigo)}`)
      .then(async (r) => (r.ok ? setLic(await r.json()) : setError((await r.json()).error)))
      .catch(() => setError("No se pudo consultar la licencia"));
  }, [codigo]);

  if (error) return <div className="err">{error}</div>;
  if (!lic) return <p>Consultando…</p>;
  return (
    <div className="card" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={lic.qr} alt="Código QR de la licencia" width={220} height={220} />
      <div>
        <h1>Licencia {lic.codigoLicencia}</h1>
        <p className={lic.vigente ? "ok" : "err"}>{lic.vigente ? "VIGENTE · comerciante formalizado" : "NO VIGENTE"}</p>
        <p><b>{lic.razonSocial}</b><br />RUC {lic.ruc} · {lic.giro}<br />{lic.puesto}</p>
      </div>
    </div>
  );
}
