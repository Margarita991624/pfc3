import Link from "next/link";
import type { Metadata } from "next";
import { CONTACTO_EMAIL } from "@/lib/contacto";

export const metadata: Metadata = { title: "Términos y condiciones – MercaOrden" };

export default function Terminos() {
  return (
    <article className="legal aparece">
      <span className="ceja">Información legal</span>
      <h1>Términos y condiciones de uso</h1>
      <p className="aviso">Última actualización: noviembre de 2026</p>

      <h2>1. ¿Qué es MercaOrden?</h2>
      <p>MercaOrden es la plataforma del Mercado Mayorista para que los comerciantes soliciten su formalización, reciban su licencia digital con código QR y para que cualquier persona denuncie, de forma anónima, cobros de cupos, extorsión u otras situaciones irregulares dentro del mercado. El uso de la plataforma es gratuito.</p>

      <h2>2. Uso correcto</h2>
      <ul>
        <li>Debes ingresar información verdadera. Los datos falsos pueden hacer que tu solicitud sea rechazada.</li>
        <li>No debes usar la plataforma para molestar, amenazar o acusar falsamente a otras personas.</li>
        <li>No debes intentar acceder a zonas restringidas ni alterar el funcionamiento del sitio.</li>
      </ul>

      <h2>3. Datos personales de los comerciantes</h2>
      <p>Para formalizarte te pedimos nombre, DNI, RUC, razón social, giro, correo y celular. Los usamos <b>solo</b> para evaluar tu solicitud, asignarte un puesto, emitir tu licencia y avisarte por correo sobre tu trámite. No los vendemos ni los compartimos con terceros, salvo por mandato de una autoridad competente. La licencia pública solo muestra tu razón social, RUC, giro y puesto; <b>nunca</b> tu DNI, correo o teléfono.</p>
      <p>De acuerdo con la Ley N.º 29733, Ley de Protección de Datos Personales, puedes pedir el acceso, la rectificación, la cancelación o la oposición al uso de tus datos escribiendo a <a href={`mailto:${CONTACTO_EMAIL}`}>{CONTACTO_EMAIL}</a>.</p>

      <h2>4. Denuncias anónimas</h2>
      <p>Para denunciar no pedimos nombre, DNI, teléfono ni correo, y no guardamos información que permita identificarte. Recibirás un código de seguimiento: guárdalo, porque es la única forma de consultar tu denuncia. La administración puede derivar los casos a la Policía Nacional del Perú o al Ministerio Público. Esta plataforma <b>no reemplaza</b> a la denuncia policial: si estás en peligro, llama al <b>105</b>.</p>

      <h2>5. Comunicaciones</h2>
      <p>Las novedades de tu trámite se envían al correo que registraste. También puedes consultarlas en cualquier momento en <Link href="/comerciantes/estado">Mi solicitud</Link> (con tu RUC y DNI) o en <Link href="/denuncias/seguimiento">Seguir mi denuncia</Link> (con tu código).</p>

      <h2>6. Reclamos y quejas</h2>
      <p>Si no estás conforme con nuestra atención, puedes registrar un reclamo o una queja en nuestro <Link href="/libro-reclamaciones">Libro de Reclamaciones</Link>. Te responderemos en un plazo máximo de 15 días hábiles.</p>

      <h2>7. Contacto</h2>
      <p>Nuestro centro de contacto atiende únicamente por correo electrónico: <a href={`mailto:${CONTACTO_EMAIL}`}>{CONTACTO_EMAIL}</a>.</p>
    </article>
  );
}
