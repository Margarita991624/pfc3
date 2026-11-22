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
    await expect(page.getByRole("heading", { name: "¿Y ahora qué hago?" })).toBeVisible();
    await page.getByRole("button", { name: "Registrar otro comerciante" }).click();

    await page.getByLabel("Nombres y apellidos").fill("Rosa Quispe Huamán");
    await page.getByLabel("DNI").fill("45678912");
    await page.getByLabel("RUC").fill("20131312955");
    await page.getByLabel("Razón social o nombre comercial").fill("Frutas Rosita E2E");
    await page.getByLabel("Correo").fill("rosa@example.com");
    await page.getByLabel("Celular").fill("987654321");
    await page.getByRole("button", { name: "Enviar solicitud" }).click();
    await expect(page.getByText("RUC ya registrado")).toBeVisible();
  });

  test("MORD-33: el comerciante consulta su solicitud con RUC y DNI y ve qué hacer", async ({ page, request }) => {
    const r = await request.post("/api/comerciantes", {
      data: { nombres: "Lucía Flores", dni: "87654321", ruc: "20100070970", razonSocial: "Abarrotes Lucía E2E", giro: "Abarrotes", email: "lucia@example.com", telefono: "934567812" },
    });
    expect(r.status()).toBe(201);
    await page.goto("/comerciantes/estado");
    await page.getByLabel("RUC").fill("20100070970");
    await page.getByLabel("DNI").fill("11111111");
    await page.getByRole("button", { name: "Consultar mi solicitud" }).click();
    await expect(page.getByText("No encontramos una solicitud con ese RUC y DNI")).toBeVisible();
    await page.getByLabel("DNI").fill("87654321");
    await page.getByRole("button", { name: "Consultar mi solicitud" }).click();
    await expect(page.getByRole("heading", { name: "Tu solicitud está en revisión" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "¿Y ahora qué hago?" })).toBeVisible();
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
    // MORD-37: el QR se puede descargar como imagen PNG
    const [descarga] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Descargar QR" }).click()]);
    expect(descarga.suggestedFilename()).toMatch(/^licencia-LIC-[A-Z0-9]{6}-QR\.png$/);
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

  test("MORD-35: libro de reclamaciones registra la hoja y el pie muestra contacto y términos", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "cristel.narvaez@usil.pe" }).first()).toHaveAttribute("href", /^mailto:cristel\.narvaez@usil\.pe/);
    await expect(page.getByRole("link", { name: "Términos y condiciones" })).toBeVisible();
    await page.getByRole("contentinfo").getByRole("link", { name: "Libro de Reclamaciones" }).click();
    await page.getByLabel("Nombre completo").fill("Juana Pérez Ramos");
    await page.getByLabel("DNI o carné de extranjería").fill("45678912");
    await page.getByLabel("Domicilio").fill("Av. Las Flores 123, Lima");
    await page.getByLabel("Correo electrónico (aquí te responderemos)").fill("juana@example.com");
    await page.getByLabel("Descripción del producto o servicio").fill("Atención de mi solicitud");
    await page.getByLabel("¿Qué pasó?").fill("Registré mi solicitud hace tres semanas y sigue sin respuesta.");
    await page.getByLabel("¿Qué solución pides?").fill("Que revisen mi solicitud.");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Enviar hoja de reclamación" }).click();
    await expect(page.getByRole("heading", { name: "Registramos tu hoja de reclamación" })).toBeVisible();
    await expect(page.locator(".codigo")).toHaveText(/^REC-\d{4}-[A-Z2-9]{6}$/);
  });

  test("MORD-36: un cliente reporta una falta y el admin pone la licencia en revisión; el QR lo refleja", async ({ page, request }) => {
    const r = await request.post("/api/comerciantes", {
      data: { nombres: "Marco Torres", dni: "11223344", ruc: "20131380951", razonSocial: "Verduras Marco E2E", giro: "Verduras", email: "marco@example.com", telefono: "955667788" },
    });
    expect(r.status()).toBe(201);
    await page.goto("/admin");
    await page.getByLabel("Contraseña").fill("e2e-admin-pruebas");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await page.getByRole("row", { name: /Verduras Marco E2E/ }).getByRole("button", { name: "Aprobar" }).click();
    await expect(page.getByText("Solicitud aprobada y licencia generada")).toBeVisible();
    await page.getByRole("row", { name: /Verduras Marco E2E/ }).getByRole("combobox").selectOption("B-201");
    await expect(page.getByText("Puesto asignado")).toBeVisible();
    const enlace = page.getByRole("row", { name: /Verduras Marco E2E/ }).getByRole("link", { name: /Ver licencia/ });
    const lic = ((await enlace.textContent()) ?? "").match(/LIC-[A-Z0-9]{6}/)![0];

    await page.goto(`/licencia/${lic}`);
    await page.getByText("¿Viste una falta en este comercio? Repórtala aquí").click();
    await page.getByLabel("¿Qué falta viste?").selectOption("Balanza o pesos adulterados");
    await page.getByLabel("Cuéntanos qué pasó").fill("La balanza marca 200 g de más en cada kilo.");
    await page.getByRole("button", { name: "Enviar reporte" }).click();
    await expect(page.getByText(/Recibimos tu reporte RPT-/)).toBeVisible();

    await page.goto("/admin");
    await page.getByRole("tab", { name: /Reportes de comercios/ }).click();
    page.once("dialog", (d) => d.accept("Balanza adulterada verificada en inspección"));
    await page.getByRole("row", { name: /Verduras Marco E2E/ }).getByRole("button", { name: "Poner licencia en revisión" }).click();
    await expect(page.getByText("Licencia de Verduras Marco E2E: En revisión")).toBeVisible();

    await page.goto(`/licencia/${lic}`);
    await expect(page.getByText(/EN REVISIÓN/)).toBeVisible();
  });

  test("MORD-35: el admin responde una hoja del Libro de Reclamaciones con el formato formal", async ({ page, request }) => {
    const r = await request.post("/api/reclamos", {
      data: { tipo: "Queja", nombres: "Pedro Salas", documento: "12312312", domicilio: "Jr. Lima 456", email: "pedro@example.com", bienTipo: "Servicio",
        descripcionBien: "Atención en ventanilla", detalle: "Me atendieron de mala manera en la oficina.", pedido: "Una disculpa y mejor trato.", acepta: true },
    });
    expect(r.status()).toBe(201);
    const { codigo } = await r.json();
    await page.goto("/admin");
    await page.getByLabel("Contraseña").fill("e2e-admin-pruebas");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await page.getByRole("tab", { name: /Libro de Reclamaciones/ }).click();
    await page.getByRole("row", { name: new RegExp(codigo) }).getByRole("button", { name: "Responder" }).click();
    const caja = page.getByLabel(/Respuesta formal para Pedro Salas/);
    await expect(caja).toHaveValue(new RegExp(codigo));
    await page.getByRole("button", { name: "Enviar respuesta al consumidor" }).click();
    await expect(page.getByText(/Completa o borra las partes entre corchetes/)).toBeVisible();
    await caja.fill((await caja.inputValue()).replace(/\[[^\]]*\]/g, "se habló con el personal y se reforzó la capacitación en atención"));
    await page.getByRole("button", { name: "Enviar respuesta al consumidor" }).click();
    await expect(page.getByText(new RegExp(`Respuesta a la hoja ${codigo} registrada`))).toBeVisible();
    await expect(page.getByRole("row", { name: new RegExp(codigo) }).getByText("Respondido")).toBeVisible();
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
