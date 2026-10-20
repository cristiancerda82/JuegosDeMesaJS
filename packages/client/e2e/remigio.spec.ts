import { expect, test, type Page } from '@playwright/test';
import { bajadasRemigio, type CartaRemigio } from '@juegos/engine';

async function empezarRemigio(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-remigio').click();
  if (jugadores) await page.getByLabel(`${jugadores} jugadores`, { exact: true }).check();
  await page.getByTestId('empezar').click();
}

const manoActual = async (page: Page) =>
  (await page
    .locator('[data-testid="mano"] .carta-mano')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')!))) as CartaRemigio[];

async function elegir(page: Page, cartas: readonly CartaRemigio[]) {
  for (const c of cartas) await page.getByTestId(`mano-${c}`).click({ position: { x: 6, y: 6 } });
}

/**
 * Un turno propio: roba del mazo, baja lo que pueda (de 3 en 3), intenta añadir cartas a las
 * combinaciones de la mesa y descarta la primera carta. Devuelve si bajó o añadió algo.
 */
async function turno(page: Page): Promise<{ bajo: boolean; anadio: boolean }> {
  await page.getByTestId('mazo').click();
  await expect(page.getByTestId('descartar')).toBeVisible();
  let bajo = false;
  let anadio = false;
  for (let i = 0; i < 4; i++) {
    const bajadas = bajadasRemigio(await manoActual(page));
    if (bajadas.length === 0) break;
    const b = bajadas[0]!;
    await elegir(page, b.tipo === 'grupo' ? b.cartas : b.puestos);
    await page.getByTestId('bajar').click();
    if (await page.getByTestId('opciones-bajada').isVisible())
      await page.getByTestId('opcion-0').click();
    bajo = true;
    if (
      (await page.getByTestId('panel-mano').isVisible()) ||
      (await manoActual(page)).length === 0
    ) {
      return { bajo, anadio };
    }
  }
  // Prueba a añadir cada carta a cada combinación (solo se puede tras haber bajado).
  const combis = page.locator('[data-testid^="combi-"]');
  for (const carta of await manoActual(page)) {
    if ((await manoActual(page)).length <= 1) break;
    for (let k = 0; k < (await combis.count()); k++) {
      const antes = (await manoActual(page)).length;
      if (!(await manoActual(page)).includes(carta)) break;
      await elegir(page, [carta]);
      await combis.nth(k).click({ position: { x: 4, y: 4 } });
      if (await page.getByTestId('opciones-bajada').isVisible())
        await page.getByTestId('opcion-0').click();
      if ((await manoActual(page)).length < antes) {
        anadio = true;
        break;
      }
      if (await page.getByTestId('limpiar').isVisible()) await page.getByTestId('limpiar').click();
    }
  }
  if (await page.getByTestId('panel-mano').isVisible()) return { bajo, anadio };
  const mano = await manoActual(page);
  if (mano.length > 0) {
    await elegir(page, [mano[0]!]);
    await page.getByTestId('descartar').click();
  }
  return { bajo, anadio };
}

/** Juega turnos hasta que acaba la mano o la partida, o se cumple `parar`. */
async function jugarRemigio(page: Page, parar: () => Promise<boolean> = async () => false) {
  let bajo = false;
  let anadio = false;
  for (let t = 0; t < 200; t++) {
    const fin = page.getByTestId('fin');
    const panel = page.getByTestId('panel-mano');
    await page
      .locator('[data-testid="mazo"].robable, [data-testid="fin"], [data-testid="panel-mano"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if ((await fin.isVisible()) || (await panel.isVisible()) || (await parar())) break;
    const r = await turno(page);
    bajo ||= r.bajo;
    anadio ||= r.anadio;
  }
  return { bajo, anadio };
}

// ── Una mano ─────────────────────────────────────────────────────────────────

test('robar, bajar y descartar hasta el resumen de la mano', async ({ page }) => {
  test.setTimeout(180_000);
  await empezarRemigio(page, 'rapido&semilla=remigio-e2e');
  await expect(page.locator('[data-testid="mano"] .carta-mano')).toHaveCount(7);
  await expect(page.getByTestId('monton')).toBeVisible();

  // «Bajar» se desactiva con tres cartas que no combinan.
  await page.getByTestId('mazo').click();
  const mano = await manoActual(page);
  const sueltas = [mano[0]!, mano[1]!, mano[2]!];
  if (bajadasRemigio(sueltas).length === 0) {
    await elegir(page, sueltas);
    await expect(page.getByTestId('bajar')).toBeDisabled();
    await page.getByTestId('limpiar').click();
  }
  await elegir(page, [mano.at(-1)!]);
  await page.getByTestId('descartar').click();

  const { bajo } = await jugarRemigio(page);
  expect(bajo).toBe(true);
  await page.screenshot({ path: 'test-results/remigio-mesa.png' });
  const panel = page.getByTestId('panel-mano');
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId('resumen-remigio')).toBeVisible();
  await expect(panel.getByTestId('quien-cierra')).not.toBeEmpty();
  await page.screenshot({ path: 'test-results/remigio-resumen.png' });
  await page.getByTestId('siguiente-mano').click();
  await expect(page.locator('[data-testid="mano"] .carta-mano')).toHaveCount(7);
});

test('añadir a una combinación de la mesa tras haber bajado', async ({ page }) => {
  test.setTimeout(180_000);
  await empezarRemigio(page, 'rapido&semilla=remigio-anadir');
  let anadido = false;
  for (let mano = 0; mano < 4 && !anadido; mano++) {
    const r = await jugarRemigio(page);
    anadido = r.anadio;
    if (await page.getByTestId('fin').isVisible()) break;
    if (!anadido && (await page.getByTestId('panel-mano').isVisible())) {
      await page.getByTestId('siguiente-mano').click();
    }
  }
  expect(anadido).toBe(true);
});

// ── 4 jugadores, retomar y móvil ─────────────────────────────────────────────

test('partida de 4 jugadores: los rivales juegan y se ven sus combinaciones', async ({ page }) => {
  test.setTimeout(180_000);
  await empezarRemigio(page, 'rapido&semilla=remigio-4', 4);
  for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await jugarRemigio(
    page,
    async () => (await page.locator('[data-testid^="combis-"]').count()) > 1,
  );
});

test('al recargar una partida de Remigio se continúa en el mismo punto', async ({ page }) => {
  await empezarRemigio(page, 'rapido&semilla=remigio-retomar');
  await page.getByTestId('mazo').click();
  await expect(page.getByTestId('descartar')).toBeVisible();
  const mano = await manoActual(page);
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByTestId('descartar')).toBeVisible();
  expect((await manoActual(page)).sort()).toEqual([...mano].sort());
});

test('la mesa del Remigio entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  for (const jugadores of [2, 5]) {
    await empezarRemigio(page, 'semilla=pequena', jugadores);
    await page.getByTestId('mazo').waitFor();
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    await page.screenshot({ path: `test-results/remigio${jugadores}-360.png` });
  }
});
