"use client";
import { use, useEffect, useState } from "react";
import { Alerta, Check, Escudo, Logo } from "../../iconos";

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

  if (error) return <div className="err" style={{ maxWidth: 560, margin: "auto" }}><Alerta /><span>{error}</span></div>;
  if (!lic) return <p className="cargando">Consultando…</p>;
  return (
    <div className="aparece">
      <div className="cabecera" style={{ textAlign: "center" }}>
        <span className="ceja">Verificación pública <span className="chip">HU04</span></span>
      </div>
      <article className="licencia">
        <div className="izq">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lic.qr} alt="Código QR de la licencia" width={220} height={220} />
          <span>Escanea para verificar en línea</span>
        </div>
        <div className="der">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Logo size={28} />
            <span className="aviso" style={{ textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700, fontSize: 11 }}>Licencia de funcionamiento</span>
          </div>
          <h1 style={{ marginTop: 14 }}>Licencia <span style={{ whiteSpace: "nowrap" }}>{lic.codigoLicencia}</span></h1>
          <div className={`estado-lic ${lic.vigente ? "si" : "no"}`}>
            {lic.vigente ? <Check /> : <Alerta />}
            <span>{lic.vigente ? "VIGENTE · comerciante formalizado" : "NO VIGENTE"}</span>
          </div>
          <dl className="datos">
            <dt>Titular</dt><dd>{lic.razonSocial}</dd>
            <dt>RUC</dt><dd className="mono">{lic.ruc}</dd>
            <dt>Giro</dt><dd>{lic.giro}</dd>
            <dt>Ubicación</dt><dd>{lic.puesto}</dd>
          </dl>
          <p className="aviso" style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 22 }}><Escudo size={16} /> Solo se muestran datos públicos: nunca el documento ni el contacto del titular.</p>
        </div>
      </article>
    </div>
  );
}
