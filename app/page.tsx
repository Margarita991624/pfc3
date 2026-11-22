import Link from "next/link";
import { Candado, Check, Escudo, Flecha, Libro, Lupa, Megafono, Ojo, Qr, QrDecorativo, Sobre, Tienda } from "./iconos";
import { CONTACTO_EMAIL } from "@/lib/contacto";

export default function Inicio() {
  return (
    <>
      <section className="hero aparece">
        <div>
          <span className="ceja">Mercado Mayorista · Plataforma municipal</span>
          <h1>Mercado Mayorista <em>ordenado</em> y seguro</h1>
          <p className="sub">
            Formaliza tu puesto en minutos, obtén una licencia digital verificable con QR y denuncia el cobro de cupos sin revelar quién eres.
          </p>
          <div className="acciones">
            <Link className="btn grande" href="/comerciantes/registro"><Tienda /> Registrarme</Link>
            <Link className="btn grande tomate" href="/denuncias/nueva"><Megafono /> Denunciar</Link>
          </div>
          <div className="confianza no-imprimir">
            <span><Ojo /> No guardamos tu IP</span>
            <span><Qr /> Licencia con QR verificable</span>
            <span><Candado /> Tus datos están protegidos</span>
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

      <section aria-label="Consultar un trámite">
        <span className="ceja">¿Ya hiciste un trámite?</span>
        <h2>Revisa cómo va cuando quieras</h2>
        <div className="atajos">
          <Link href="/comerciantes/estado">
            <span className="ico"><Tienda size={26} /></span>
            <span><b>Ver mi solicitud de comerciante</b><span>Solo necesitas tu RUC y tu DNI.</span></span>
          </Link>
          <Link href="/denuncias/seguimiento">
            <span className="ico"><Lupa size={26} /></span>
            <span><b>Ver cómo va mi denuncia</b><span>Usa el código DEN que te dimos.</span></span>
          </Link>
        </div>
      </section>

      <section className="seccion">
        <span className="ceja">Para comerciantes</span>
        <h2>De informal a formalizado en tres pasos</h2>
        <div className="pasos">
          <div className="paso"><h3>Envía tu solicitud</h3><p>Ingresa tu DNI y tu RUC. Te avisamos al instante si algún número está mal.</p></div>
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
              <li><span className="ico"><Ojo /></span>No guardamos nada que te identifique</li>
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
        <span className="ceja">¿Necesitas ayuda?</span>
        <h2>Estamos para atenderte</h2>
        <div className="atajos">
          <a href={`mailto:${CONTACTO_EMAIL}`}>
            <span className="ico"><Sobre size={26} /></span>
            <span><b>Escríbenos un correo</b><span>{CONTACTO_EMAIL}</span></span>
          </a>
          <Link href="/libro-reclamaciones">
            <span className="ico"><Libro size={26} /></span>
            <span><b>Libro de Reclamaciones</b><span>Registra un reclamo o una queja sobre nuestra atención.</span></span>
          </Link>
        </div>
      </section>
    </>
  );
}

