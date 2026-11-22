import Link from "next/link";
import type { Metadata } from "next";
import { Libro, Logo, Sobre } from "./iconos";
import { CONTACTO_EMAIL } from "@/lib/contacto";
import "./globals.css";

export const metadata: Metadata = {
  title: "MercaOrden – Mercado Mayorista",
  description: "Formalización de comerciantes y canal de denuncias anónimas (caso La Parada)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="franja" aria-hidden />
        <header className="top">
          <div className="in">
            <Link className="logo" href="/" aria-label="MercaOrden, inicio">
              <Logo />
              <span><b>MercaOrden</b><small>Mercado Mayorista</small></span>
            </Link>
            <nav className="menu" aria-label="Principal">
              <Link href="/comerciantes/registro">Registro de comerciantes</Link>
              <Link href="/comerciantes/estado">Mi solicitud</Link>
              <Link href="/denuncias/seguimiento">Seguir mi denuncia</Link>
              <Link href="/admin">Administración</Link>
              <Link className="cta" href="/denuncias/nueva">Denuncia anónima</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="pie">
          <div className="in">
            <div>
              <b>MercaOrden</b>
              <p className="aviso" style={{ margin: "6px 0 0", maxWidth: 340 }}>Plataforma del Mercado Mayorista para formalizar comerciantes y denunciar cobros de cupos de forma anónima.</p>
            </div>
            <div className="pie-col">
              <span className="pie-tit">Centro de contacto</span>
              <a href={`mailto:${CONTACTO_EMAIL}?subject=${encodeURIComponent("Consulta MercaOrden")}`}><Sobre size={16} /> {CONTACTO_EMAIL}</a>
              <span className="aviso">Atención solo por correo.</span>
            </div>
            <div className="pie-col">
              <span className="pie-tit">Información</span>
              <Link href="/terminos">Términos y condiciones</Link>
              <Link href="/libro-reclamaciones" className="libro"><Libro size={18} /> Libro de Reclamaciones</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
