import { expect, test, type Page } from '@playwright/test';
import { CONFIG_ESCOBA_POR_DEFECTO, escoba, type AccionEscoba } from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarEscoba(page: Page, query: string, opciones: { cuatro?: boolean } = {}) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-escoba').click();
  if (opciones.cuatro) await page.getByLabel('4 jugadores en parejas').check();
  await page.getByLabel('A 15 puntos').check();
  await page.getByTestId('empezar').click();
}

/** Toca el fondo de la mesa (el centro del borde superior, libre de cartas y del redondeo). */
async function tocarMesa(page: Page) {
  const mesa = page.getByTestId('mesa');
  const caja = (await mesa.boundingBox())!;
  await mesa.click({ position: { x: caja.width / 2, y: 4 } });
}

/** Primera jugada del humano (sale en la primera mano) en una partida con esta semilla. */
function jugadasIniciales(semilla: string): readonly AccionEscoba[] {
  const r = escoba.crear({ ...CONFIG_ESCOBA_POR_DEFECTO, puntosPartida: 15 }, semilla);
  if (!r.ok) throw new Error(r.error);
  return escoba.accionesLegales(r.valor, 0);
}

/** Busca una semilla en la que alguna carta inicial del humano cumpla la condición. */
function buscar(condicion: (jugadas: readonly AccionEscoba[]) => boolean) {
  for (let i = 0; i < 2_000; i++) {
    const semilla = `escoba-${i}`;
    const jugadas = jugadasIniciales(semilla);
    const cartas = [...new Set(jugadas.map((j) => j.carta))];
    for (const carta of cartas) {
      const deCarta = jugadas.filter((j) => j.carta === carta);
      if (condicion(deCarta)) return { semilla, carta, jugadas: deCarta };
    }
  }
  throw new Error('Ninguna semilla de prueba cumple la condición');
}

/** Juega la partida entera: carta jugable → mesa, primera opción del selector, y cierra cada mano. */
async function jugarEscoba(page: Page) {
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  const selector = page.getByTestId('opciones-captura');
  for (let jugadas = 0; jugadas < 600; jugadas++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="fin"], [data-testid="panel-mano"]')
      .first()
      .waitFor();
    if (await fin.isVisible()) return;
    if (await panel.isVisible()) {
      await expect(panel.getByTestId('desglose')).toBeVisible();
      await page.screenshot({
        path: `test-results/escoba-panel-${page.viewportSize()!.width}.png`,
      });
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    await page.locator('.carta-mano.jugable').first().click(ESQUINA);
    await tocarMesa(page);
    if (await selector.isVisible()) await page.getByTestId('opcion-0').click();
  }
  throw new Error('La partida de Escoba no terminó');
}

// ── Partidas completas ───────────────────────────────────────────────────────

test('partida de Escoba completa contra la IA con 2 jugadores', async ({ page }) => {
  await empezarEscoba(page, 'rapido&semilla=escoba-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  await jugarEscoba(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido/);
  await expect(fin.getByTestId('desglose')).toBeVisible();
  const total = Math.max(
    Number(await fin.getByTestId('total-0').textContent()),
    Number(await fin.getByTestId('total-1').textContent()),
  );
  expect(total).toBeGreaterThanOrEqual(15);
});

test('partida de Escoba completa con 4 jugadores en parejas', async ({ page }) => {
  await empezarEscoba(page, 'rapido&semilla=escoba4-e2e', { cuatro: true });
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  await jugarEscoba(page);
  await expect(page.getByTestId('fin')).toContainText('Tu pareja');
});

// ── Elegir la captura ────────────────────────────────────────────────────────

test('al soltar una carta con varias capturas, se elige en el selector', async ({ page }) => {
  const { semilla, carta, jugadas } = buscar(
    (j) => j.filter((x) => x.captura.length > 0).length >= 2,
  );
  await empezarEscoba(page, `rapido&semilla=${semilla}`);
  await page.getByTestId(`mano-${carta}`).click(ESQUINA);
  await tocarMesa(page);
  const selector = page.getByTestId('opciones-captura');
  await expect(selector).toBeVisible();
  await expect(selector.locator('[data-testid^="opcion-"]')).toHaveCount(jugadas.length);
  await page.screenshot({ path: `test-results/escoba-selector-${page.viewportSize()!.width}.png` });

  const elegida = jugadas[1]!;
  await page.getByTestId('opcion-1').click();
  await expect(selector).toBeHidden();
  await expect(page.getByTestId('monton-0')).toContainText(`${elegida.captura.length + 1} cartas`);
  for (const c of elegida.captura) await expect(page.getByTestId(`mesa-${c}`)).toHaveCount(0);
});

test('se arma una captura tocando las cartas de la mesa', async ({ page }) => {
  const { semilla, carta, jugadas } = buscar((j) => j.some((x) => x.captura.length >= 2));
  const captura = jugadas.find((x) => x.captura.length >= 2)!.captura;
  await empezarEscoba(page, `rapido&semilla=${semilla}`);

  await page.getByTestId(`mano-${carta}`).click(ESQUINA);
  const recoger = page.getByTestId('recoger');
  await expect(recoger).toBeDisabled();
  for (const c of captura) await page.getByTestId(`mesa-${c}`).click();
  await expect(page.getByTestId('suma')).toHaveText('15 / 15');
  await expect(recoger).toBeEnabled();
  await recoger.click();

  await expect(page.getByTestId('monton-0')).toContainText(`${captura.length + 1} cartas`);
  for (const c of captura) await expect(page.getByTestId(`mesa-${c}`)).toHaveCount(0);
});

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test('la mesa de la Escoba entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  for (const cuatro of [false, true]) {
    await empezarEscoba(page, 'semilla=pequena', { cuatro });
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    const cartas = page.locator('.carta-mesa, .carta-mano');
    for (let i = 0; i < (await cartas.count()); i++) {
      const caja = (await cartas.nth(i).boundingBox())!;
      expect(caja.width).toBeGreaterThanOrEqual(40);
      expect(caja.x + caja.width).toBeLessThanOrEqual(anchos.ventana);
      await expect(cartas.nth(i).getByRole('img')).toHaveAttribute('aria-label', /\S/);
    }
    await page.screenshot({ path: `test-results/escoba${cuatro ? '4' : ''}-360.png` });
  }
});
