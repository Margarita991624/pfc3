import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "./iconos";
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
              <Link href="/denuncias/seguimiento">Seguimiento</Link>
              <Link href="/admin">Administración</Link>
              <Link className="cta" href="/denuncias/nueva">Denuncia anónima</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="pie">
          <div className="in">
            <span><b>MercaOrden</b> · Proyecto Final de Carrera III · USIL 2026-2</span>
            <span>Emergencias: 105 (PNP) · Datos protegidos con RLS, HTTPS y CSP estricta</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
