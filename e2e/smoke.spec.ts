import { expect, test } from "@playwright/test";

test.describe("@smoke MercaOrden", () => {
  test("la página de inicio muestra los tres accesos principales", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Mercado Mayorista ordenado y seguro" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Registrarme" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Denunciar" })).toBeVisible();
  });

  test("HU01 · MORD-10: registro de comerciante queda Pendiente y rechaza RUC duplicado", async ({ page }) => {
    await page.goto("/comerciantes/registro");
    await page.getByLabel("Nombres y apellidos").fill("Rosa Quispe Huamán");
    await page.getByLabel("DNI").fill("45678912");
    await page.getByLabel("RUC").fill("20131312955");
    await page.getByLabel("Razón social o nombre comercial").fill("Frutas Rosita E2E");
    await page.getByLabel("Correo").fill("rosa@example.com");
    await page.getByLabel("Celular").fill("987654321");
    await page.getByRole("button", { name: "Enviar solicitud" }).click();
    await expect(page.getByText("Estado: Pendiente")).toBeVisible();

    await page.getByLabel("Nombres y apellidos").fill("Rosa Quispe Huamán");
    await page.getByLabel("DNI").fill("45678912");
    await page.getByLabel("RUC").fill("20131312955");
    await page.getByLabel("Razón social o nombre comercial").fill("Frutas Rosita E2E");
    await page.getByLabel("Correo").fill("rosa@example.com");
    await page.getByLabel("Celular").fill("987654321");
    await page.getByRole("button", { name: "Enviar solicitud" }).click();
    await expect(page.getByText("RUC ya registrado")).toBeVisible();
  });

  test("HU02/HU03/HU04 · admin aprueba, asigna puesto y la licencia QR es pública", async ({ page, request }) => {
    const r = await request.post("/api/comerciantes", {
      data: { nombres: "Pedro Mamani", dni: "12345678", ruc: "10467793549", razonSocial: "Papas Pedro E2E", giro: "Tubérculos", email: "pedro@example.com", telefono: "912345678" },
    });
    expect(r.status()).toBe(201);

    await page.goto("/admin");
    await page.getByLabel("Contraseña").fill("e2e-admin-pruebas");
    await page.getByRole("button", { name: "Ingresar" }).click();
    const fila = page.getByRole("row", { name: /Papas Pedro E2E/ });
    await fila.getByRole("button", { name: "Aprobar" }).click();
    await expect(page.getByText("Solicitud aprobada y licencia generada")).toBeVisible();
    await page.getByRole("row", { name: /Papas Pedro E2E/ }).getByRole("combobox").selectOption("C-301");
    await expect(page.getByText("Puesto asignado")).toBeVisible();

    await page.getByRole("row", { name: /Papas Pedro E2E/ }).getByRole("link", { name: /Ver licencia/ }).click();
    await expect(page.getByText("VIGENTE · comerciante formalizado")).toBeVisible();
    await expect(page.getByAltText("Código QR de la licencia")).toBeVisible();
  });

  test("HU15/HU17 · denuncia anónima entrega código y se puede consultar", async ({ page }) => {
    await page.goto("/denuncias/nueva");
    await page.getByLabel("Ubicación (bloque, puerta o zona)").fill("Bloque B, puerta 3");
    await page.getByLabel("Descripción").fill("Un grupo exige S/ 20 diarios a los estibadores para dejarlos trabajar.");
    await page.getByRole("button", { name: "Enviar denuncia" }).click();
    const codigo = (await page.locator(".codigo").textContent())?.trim() ?? "";
    expect(codigo).toMatch(/^DEN-[A-Z0-9]{4}-[A-Z0-9]{4}$/);

    await page.goto("/denuncias/seguimiento");
    await page.getByLabel("Código").fill(codigo);
    await page.getByRole("button", { name: "Consultar" }).click();
    await expect(page.getByText("Recibida")).toBeVisible();
  });

  test("HU16 · MORD-25: admin revisa y deriva una denuncia y el denunciante ve el avance", async ({ page, request }) => {
    const r = await request.post("/api/denuncias", {
      data: { categoria: "Extorsión", ubicacion: "Bloque D, puerta 1", descripcion: "Amenazan a los comerciantes que no pagan la cuota semanal." },
    });
    expect(r.status()).toBe(201);
    const { codigo } = await r.json();
    expect((await request.get("/api/denuncias")).status()).toBe(401);

    await page.goto("/admin");
    await page.getByLabel("Contraseña").fill("e2e-admin-pruebas");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await page.getByRole("tab", { name: /Denuncias/ }).click();
    const fila = () => page.getByRole("row", { name: new RegExp(codigo) });
    await fila().getByRole("button", { name: "Iniciar revisión" }).click();
    await expect(page.getByText(`Denuncia ${codigo}: En revisión`)).toBeVisible();
    await fila().getByRole("button", { name: "Derivar a PNP / Fiscalía" }).click();
    await expect(page.getByText(`Denuncia ${codigo}: Derivada`)).toBeVisible();

    await page.goto("/denuncias/seguimiento");
    await page.getByLabel("Código").fill(codigo);
    await page.getByRole("button", { name: "Consultar" }).click();
    await expect(page.getByText("Estado: Derivada")).toBeVisible();
  });

  test("seguridad · /admin protegido y cabeceras de seguridad presentes", async ({ request }) => {
    expect((await request.get("/api/comerciantes")).status()).toBe(401);
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["cross-origin-opener-policy"]).toBe("same-origin");
    expect(h["cross-origin-resource-policy"]).toBe("same-origin");
    expect(h["x-powered-by"]).toBeUndefined();
  });
});
