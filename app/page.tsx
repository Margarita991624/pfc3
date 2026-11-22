import Link from "next/link";
export default function Inicio() {
  return (
    <>
      <h1>Mercado Mayorista ordenado y seguro</h1>
      <p className="sub">Plataforma municipal para formalizar a los comerciantes y denunciar de forma anónima el cobro de cupos.</p>
      <div className="grid">
        <div className="card">
          <h3>Comerciantes</h3>
          <p>Regístrate con tu DNI y RUC para obtener tu licencia digital con código QR.</p>
          <Link className="btn" href="/comerciantes/registro">Registrarme</Link>
        </div>
        <div className="card">
          <h3>Denuncia anónima</h3>
          <p>¿Te cobran cupos o te extorsionan? Denuncia sin dar tu nombre. No guardamos tu IP.</p>
          <Link className="btn" href="/denuncias/nueva">Denunciar</Link>
        </div>
        <div className="card">
          <h3>Seguimiento</h3>
          <p>Consulta el estado de tu denuncia con tu código DEN-XXXX-XXXX.</p>
          <Link className="btn" href="/denuncias/seguimiento">Consultar</Link>
        </div>
      </div>
    </>
  );
}
