import Link from "next/link";
import { Candado, Check, Escudo, Flecha, Lupa, Megafono, Ojo, Qr, QrDecorativo, Radar, Servidor, Tienda } from "./iconos";

export default function Inicio() {
  return (
    <>
      <section className="hero aparece">
        <div>
          <span className="ceja">Caso La Parada · Plataforma municipal</span>
          <h1>Mercado Mayorista <em>ordenado</em> y seguro</h1>
          <p className="sub">
            Formaliza tu puesto en minutos, obtén una licencia digital verificable con QR y denuncia el cobro de cupos sin revelar quién eres.
          </p>
          <div className="acciones">
            <Link className="btn grande" href="/comerciantes/registro"><Tienda /> Registrarme</Link>
            <Link className="btn grande tomate" href="/denuncias/nueva"><Megafono /> Denunciar</Link>
          </div>
          <div className="confianza">
            <span><Ojo /> No guardamos tu IP</span>
            <span><Qr /> Licencia con QR verificable</span>
            <span><Candado /> Conexión cifrada (HTTPS + HSTS)</span>
          </div>
        </div>

        <div style={{ position: "relative", padding: "10px 18px 24px" }} aria-hidden>
          <div className="credencial-fondo" />
          <div className="credencial">
            <div className="cab"><span>Licencia de funcionamiento</span><span className="sello"><Check size={12} /> VIGENTE</span></div>
            <div className="nombre">Frutas Rosita</div>
            <div className="dato">RUC 10467793549 · Frutas</div>
            <div className="pie">
              <div>
                <div className="dato">Puesto</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 30 }}>A-101</div>
                <div className="dato" style={{ fontFamily: "var(--mono)", marginTop: 6 }}>LIC-7KQ2MD</div>
              </div>
              <div className="qr"><QrDecorativo size={92} /></div>
            </div>
          </div>
          <div className="flota">
            <Escudo size={22} />
            <div><b>DEN-8F3K-Q2LM</b>Denuncia en revisión</div>
          </div>
        </div>
      </section>

      <section className="seccion">
        <span className="ceja">Para comerciantes</span>
        <h2>De informal a formalizado en tres pasos</h2>
        <div className="pasos">
          <div className="paso"><h3>Envía tu solicitud</h3><p>Ingresa tu DNI y RUC. Validamos el dígito verificador de SUNAT al instante.</p></div>
          <div className="paso"><h3>Revisión municipal</h3><p>La administración aprueba tu solicitud y te asigna un puesto libre según tu giro.</p></div>
          <div className="paso"><h3>Licencia con QR</h3><p>Muestra tu licencia digital: cualquiera puede escanearla y comprobar que es auténtica.</p></div>
        </div>
      </section>

      <section className="seccion">
        <span className="ceja">Canal seguro</span>
        <h2>Nadie debería pagar para trabajar</h2>
        <div className="bloques">
          <div className="bloque oscuro">
            <span className="marca"><Megafono size={200} /></span>
            <h2>Denuncia anónima</h2>
            <p style={{ color: "#c9d5cc" }}>¿Te cobran cupos o te extorsionan? Cuéntanos qué pasó sin dar tu nombre, DNI ni teléfono. Recibirás un código único para seguir tu caso.</p>
            <ul className="lista" style={{ marginTop: 20 }}>
              <li><span className="ico"><Ojo /></span>Sin registro de IP ni cookies de rastreo</li>
              <li><span className="ico"><Candado /></span>Solo personal autorizado puede leer el contenido</li>
            </ul>
            <div className="acciones"><Link className="btn tomate" href="/denuncias/nueva">Hacer una denuncia <Flecha /></Link></div>
          </div>
          <div className="bloque mango">
            <h2>Seguimiento</h2>
            <p style={{ color: "var(--tinta-2)" }}>Consulta el estado de tu denuncia con tu código <span className="mono">DEN-XXXX-XXXX</span>. Verás en qué etapa está, sin exponer tu identidad.</p>
            <div className="acciones"><Link className="btn claro" href="/denuncias/seguimiento"><Lupa /> Consultar mi código</Link></div>
          </div>
        </div>
      </section>

      <section className="seccion">
        <span className="ceja">Seguridad desde el diseño · DevSecOps</span>
        <h2>Construido para proteger a quien denuncia</h2>
        <div className="escudo">
          <div><Escudo size={22} /><b>CSP y cabeceras</b><span>8 cabeceras de seguridad verificadas en cada despliegue.</span></div>
          <div><Servidor size={22} /><b>RLS en PostgreSQL</b><span>La base de datos solo acepta al servidor, nunca al navegador.</span></div>
          <div><Radar size={22} /><b>OWASP ZAP</b><span>Escaneo DAST automático en producción: 0 alertas altas.</span></div>
          <div><Lupa size={22} /><b>CodeQL + Gitleaks</b><span>Análisis estático y búsqueda de secretos en cada PR.</span></div>
        </div>
      </section>
    </>
  );
}

