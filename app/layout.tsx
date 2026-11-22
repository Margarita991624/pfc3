import Link from "next/link";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MercaOrden – Mercado Mayorista",
  description: "Formalización de comerciantes y canal de denuncias anónimas (caso La Parada)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header>
          <div className="in">
            <Link className="logo" href="/">MercaOrden</Link>
            <Link href="/comerciantes/registro">Registro de comerciantes</Link>
            <Link href="/denuncias/nueva">Denuncia anónima</Link>
            <Link href="/denuncias/seguimiento">Seguimiento</Link>
            <Link href="/admin">Administración</Link>
          </div>
        </header>
        <main>{children}</main>
        <footer>MercaOrden · Proyecto Final de Carrera III · USIL 2026-2</footer>
      </body>
    </html>
  );
}
