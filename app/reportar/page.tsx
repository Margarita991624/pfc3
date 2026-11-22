import type { Metadata } from "next";
import { FormReporte } from "../formReporte";
import { Guia } from "../guia";

export const metadata: Metadata = { title: "Reportar un comercio – MercaOrden" };

export default function Reportar() {
  return (
    <div className="aparece" style={{ maxWidth: 820, margin: "auto" }}>
      <div className="cabecera">
        <span className="ceja">Para clientes e inspectores</span>
        <h1>Reportar una falta de un comercio</h1>
        <p className="sub">¿Viste precios abusivos, una balanza adulterada o productos en mal estado? Avísanos. La administración revisará la licencia del comercio.</p>
      </div>
      <div className="card"><FormReporte /></div>
      <Guia titulo="¿Qué pasa después?" pasos={[
        <><b>La administración revisa tu reporte</b> y verifica lo ocurrido en el puesto.</>,
        <><b>Si hay una falta</b>, la licencia del comercio pasa a «En revisión», «Suspendida» o «Revocada», según su gravedad.</>,
        <><b>Cualquiera puede comprobarlo</b> escaneando el QR del puesto: verá si la licencia está vigente o no.</>,
      ]} />
    </div>
  );
}
