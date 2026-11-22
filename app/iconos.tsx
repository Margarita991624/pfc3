// Iconos SVG en línea (sin dependencias ni peticiones externas: compatibles con la CSP).
type P = { size?: number };
const base = (size = 18) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const Escudo = ({ size }: P) => <svg {...base(size)}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>;
export const Candado = ({ size }: P) => <svg {...base(size)}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>;
export const Ojo = ({ size }: P) => <svg {...base(size)}><path d="M3 3l18 18" /><path d="M10.6 6.1A9.8 9.8 0 0112 6c5 0 9 6 9 6a17 17 0 01-2.6 3.3M6.6 6.6C4.3 8.1 3 12 3 12s4 6 9 6c1.4 0 2.7-.4 3.9-1" /></svg>;
export const Qr = ({ size }: P) => <svg {...base(size)}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M21 14v7h-4M14 18v3" /></svg>;
export const Tienda = ({ size }: P) => <svg {...base(size)}><path d="M3 9l1.5-5h15L21 9" /><path d="M3 9h18v2a3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-6 0V9z" /><path d="M5 13v8h14v-8" /><path d="M10 21v-5h4v5" /></svg>;
export const Megafono = ({ size }: P) => <svg {...base(size)}><path d="M3 11v2a1 1 0 001 1h3l6 4V6L7 10H4a1 1 0 00-1 1z" /><path d="M17 8a5 5 0 010 8" /></svg>;
export const Lupa = ({ size }: P) => <svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>;
export const Check = ({ size }: P) => <svg {...base(size)}><path d="M5 12l5 5 9-10" /></svg>;
export const Alerta = ({ size }: P) => <svg {...base(size)}><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v4M12 18h.01" /></svg>;
export const Telefono = ({ size }: P) => <svg {...base(size)}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></svg>;
export const Documento = ({ size }: P) => <svg {...base(size)}><path d="M6 3h8l5 5v13H6z" /><path d="M14 3v5h5M9 13h7M9 17h5" /></svg>;
export const Servidor = ({ size }: P) => <svg {...base(size)}><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M7 7.5h.01M7 16.5h.01" /></svg>;
export const Radar = ({ size }: P) => <svg {...base(size)}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="M12 12l6-6" /></svg>;
export const Flecha = ({ size }: P) => <svg {...base(size)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const Sobre = ({ size }: P) => <svg {...base(size)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
export const Libro = ({ size }: P) => <svg {...base(size)}><path d="M4 4h10a4 4 0 014 4v12H8a4 4 0 01-4-4V4z" /><path d="M4 16a4 4 0 014-4h10" /><path d="M9 7h5" /></svg>;
export const Copiar = ({ size }: P) => <svg {...base(size)}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 012-2h8" /></svg>;

/** Logotipo: un cajón de mercado ordenado en cuadrícula. */
export function Logo({ size = 34 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <rect width="40" height="40" rx="11" fill="#10241a" />
      <rect x="8" y="9" width="10" height="10" rx="3" fill="#f0a432" />
      <rect x="22" y="9" width="10" height="10" rx="3" fill="#d2452a" />
      <rect x="8" y="23" width="10" height="10" rx="3" fill="#3fa36b" />
      <rect x="22" y="23" width="10" height="10" rx="3" fill="#f6f1e6" />
    </svg>
  );
}

/** Patrón decorativo tipo QR (determinista, solo ilustración). */
export function QrDecorativo({ size = 96 }: P) {
  const n = 21;
  const celdas: [number, number][] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const enEsquina = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      if (!enEsquina && ((x * 7 + y * 13 + x * y) % 5 < 2)) celdas.push([x, y]);
    }
  const ojo = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" fill="currentColor" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="currentColor" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" aria-hidden>
      {celdas.map(([x, y]) => <rect key={`${x}.${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />)}
      {ojo(0, 0)}{ojo(n - 7, 0)}{ojo(0, n - 7)}
    </svg>
  );
}
