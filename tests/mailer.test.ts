import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const sendMail = vi.fn();
vi.mock("nodemailer", () => ({ default: { createTransport: vi.fn(() => ({ sendMail })) } }));

const correo = { para: "rosa@example.com", asunto: "Prueba", texto: "hola", html: "<p>hola</p>" };

describe("MORD-34 · Envío de correos (mailer)", () => {
  beforeEach(() => { vi.resetModules(); sendMail.mockReset(); vi.spyOn(console, "info").mockImplementation(() => {}); vi.spyOn(console, "error").mockImplementation(() => {}); });
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  it("Dado que no hay credenciales SMTP, entonces se omite el envío sin error", async () => {
    vi.stubEnv("SMTP_USER", "");
    vi.stubEnv("SMTP_PASS", "");
    const { enviarCorreo, correoActivo } = await import("@/lib/mailer");
    expect(correoActivo()).toBe(false);
    expect(await enviarCorreo(correo)).toBe(false);
    expect(sendMail).not.toHaveBeenCalled();
  });
  it("Dado credenciales, envía desde la cuenta configurada y no registra la dirección completa", async () => {
    vi.stubEnv("SMTP_USER", "mercaorden@gmail.com");
    vi.stubEnv("SMTP_PASS", "abcd efgh ijkl mnop");
    sendMail.mockResolvedValue({});
    const { enviarCorreo } = await import("@/lib/mailer");
    expect(await enviarCorreo(correo)).toBe(true);
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "rosa@example.com", from: { name: "MercaOrden", address: "mercaorden@gmail.com" } }));
    expect(JSON.stringify(vi.mocked(console.info).mock.calls)).not.toContain("rosa@example.com");
  });
  it("Dado un fallo del servidor SMTP, devuelve false y no lanza (el trámite no se rompe)", async () => {
    vi.stubEnv("SMTP_USER", "mercaorden@gmail.com");
    vi.stubEnv("SMTP_PASS", "abcdefghijklmnop");
    sendMail.mockRejectedValue(new Error("535 auth failed"));
    const { enviarCorreo } = await import("@/lib/mailer");
    await expect(enviarCorreo(correo)).resolves.toBe(false);
  });
});
