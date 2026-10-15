import { expect, test, type Page } from '@playwright/test';
import type { AccionKlondike } from '@juegos/engine';
import { jugarKlondike, solucionarKlondike } from './klondike-solucion';

// ── Utilidades ───────────────────────────────────────────────────────────────

async function abrirJuego(page: Page, juego: 'klondike' | 'brisca', query = '') {
  await page.goto(`./?rapido${query}`);
  await page.getByTestId(`juego-${juego}`).click();
}

/** Toca la esquina superior izquierda, que siempre queda a la vista aunque haya cartas encima. */
const ESQUINA = { position: { x: 8, y: 8 } };

/** Juega la Brisca tocando una carta jugable y luego la mesa, hasta el fin de la partida. */
async function jugarBrisca(page: Page) {
  const fin = page.getByTestId('fin');
  for (let jugadas = 0; jugadas < 200; jugadas++) {
    await page.locator('.carta-mano.jugable, [data-testid="fin"]').first().waitFor();
    if (await fin.isVisible()) return;
    await page.locator('.carta-mano.jugable').first().click();
    await page.getByTestId('mesa').click();
  }
  throw new Error('La partida de Brisca no terminó');
}

// ── Partidas completas ───────────────────────────────────────────────────────

test('partida de Klondike completa con semilla fija', async ({ page }) => {
  let semilla = '';
  let solucion: AccionKlondike[] | null = null;
  for (let i = 1; solucion === null && i <= 30; i++) {
    semilla = `e2e-${i}`;
    solucion = solucionarKlondike(semilla, undefined, 60_000);
  }
  expect(solucion, 'ninguna semilla de prueba tiene solución').not.toBeNull();

  await abrirJuego(page, 'klondike', `&semilla=${semilla}`);
  await page.getByTestId('empezar').click();
  await jugarKlondike(page, semilla, solucion!);

  await expect(page.getByTestId('fin')).toBeVisible();
  await expect(page.getByTestId('fin')).toContainText('¡Solitario completado!');
  await expect(page.getByTestId('f0').locator('[data-carta]')).toHaveCount(13);
});

test('partida de Brisca completa contra la IA', async ({ page }) => {
  await abrirJuego(page, 'brisca', '&semilla=brisca-e2e');
  await page.getByTestId('empezar').click();
  await expect(page.getByTestId('cartas-mazo')).toHaveText('34 cartas en el mazo');
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  await jugarBrisca(page);

  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido|Empate/);
  const a = Number(await fin.getByTestId('puntos-0').textContent());
  const b = Number(await fin.getByTestId('puntos-1').textContent());
  expect(a + b).toBe(120);
  await expect(fin.getByRole('button', { name: 'Jugar otra vez' })).toBeVisible();
  await expect(fin.getByRole('button', { name: 'Volver al menú' })).toBeVisible();
});

test('Brisca de 4 jugadores: las manos ajenas se ven boca abajo', async ({ page }) => {
  await abrirJuego(page, 'brisca', '&semilla=cuatro');
  await page.getByLabel('4 jugadores en parejas').check();
  await page.getByTestId('empezar').click();
  await expect(page.getByTestId('cartas-mazo')).toHaveText('28 cartas en el mazo');
  for (const asiento of [1, 2, 3]) {
    const mano = page.getByTestId(`asiento-${asiento}`);
    await expect(mano.locator('[data-carta]')).toHaveCount(0);
    await expect(mano.getByRole('img', { name: 'Carta boca abajo' })).toHaveCount(3);
  }
  await jugarBrisca(page);
  await expect(page.getByTestId('fin')).toContainText('Tu pareja');
});

// ── Interacción ──────────────────────────────────────────────────────────────

test('un movimiento ilegal devuelve la carta y no cambia la partida', async ({ page }) => {
  await abrirJuego(page, 'brisca', '&semilla=ilegal');
  await page.getByTestId('empezar').click();
  await expect(page.getByTestId('turno')).toHaveText('Tu turno');
  const carta = page.locator('.carta-mano').first();
  await page.waitForTimeout(400);
  const antes = await carta.boundingBox();
  // Se arrastra la carta a una zona que no es destino (la cabecera) y se suelta.
  await page.mouse.move(antes!.x + 10, antes!.y + 10);
  await page.mouse.down();
  await page.mouse.move(antes!.x + 40, antes!.y - 60, { steps: 5 });
  await page.mouse.move(20, 20, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  await expect(page.getByTestId('mesa').locator('[data-carta]')).toHaveCount(0);
  await expect.poll(async () => (await carta.boundingBox())?.y).toBeCloseTo(antes!.y, 0);
});

test('arrastrar una carta a la mesa la juega', async ({ page }) => {
  await abrirJuego(page, 'brisca', '&semilla=arrastre');
  await page.getByTestId('empezar').click();
  const carta = page.locator('.carta-mano.jugable').first();
  await carta.waitFor();
  // Se mide cuando el reparto ha terminado de animarse, o el arrastre empieza fuera de la carta.
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const id = await carta.getAttribute('data-carta');
  const desde = (await carta.boundingBox())!;
  const mesa = (await page.getByTestId('mesa').boundingBox())!;
  await page.mouse.move(desde.x + desde.width / 2, desde.y + desde.height / 2);
  await page.mouse.down();
  await page.mouse.move(mesa.x + mesa.width / 2, mesa.y + mesa.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect(page.getByTestId('mesa').locator(`[data-carta="${id}"]`)).toBeVisible();
});

test('doble toque manda la carta a la fundación', async ({ page }) => {
  // Se busca una semilla en la que haya un as a la vista en las columnas.
  await abrirJuego(page, 'klondike', '&semilla=e2e-1');
  await page.getByTestId('empezar').click();
  let as = page.locator('.columna [data-carta$="-1"]');
  for (let robos = 0; (await as.count()) === 0 && robos < 24; robos++) {
    await page.getByTestId('mazo').click();
    as = page.locator('.columna [data-carta$="-1"], .descarte [data-carta$="-1"]:last-child');
  }
  const id = await as.first().getAttribute('data-carta');
  await as.first().dblclick(ESQUINA);
  await expect(page.getByTestId('f0').locator(`[data-carta="${id}"]`)).toBeVisible();
});

// ── Guardado y red ───────────────────────────────────────────────────────────

test('al recargar a mitad de partida se ofrece continuarla en el mismo punto', async ({ page }) => {
  await abrirJuego(page, 'klondike', '&semilla=recarga');
  await page.getByTestId('empezar').click();
  for (let i = 1; i <= 3; i++) {
    await page.getByTestId('mazo').click();
    await expect(page.getByTestId('movimientos')).toHaveText(String(i));
  }
  const descarte = await page
    .locator('.descarte [data-carta]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')));

  await page.reload();
  await expect(page.getByTestId('retomar')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByTestId('movimientos')).toHaveText('3');
  const despues = await page
    .locator('.descarte [data-carta]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')));
  expect(despues).toEqual(descarte);
});

test('sin conexión tras la carga se juega una partida completa sin peticiones', async ({
  page,
  context,
}) => {
  await page.goto('./?rapido&semilla=offline');
  await page.waitForLoadState('networkidle');
  const peticiones: string[] = [];
  page.on('request', (r) => peticiones.push(r.url()));
  await context.setOffline(true);

  await page.getByTestId('juego-brisca').click();
  await page.getByTestId('empezar').click();
  await jugarBrisca(page);
  await expect(page.getByTestId('fin')).toBeVisible();
  expect(peticiones).toEqual([]);
});

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test.describe('pantalla de 360 × 640', () => {
  test.beforeEach(({ page }) => {
    test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  });

  async function sinScrollHorizontal(page: Page) {
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  }

  async function cartasLegibles(page: Page) {
    const cartas = page.locator('[data-carta]');
    const n = await cartas.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const caja = await cartas.nth(i).boundingBox();
      expect(caja!.width).toBeGreaterThanOrEqual(40);
      await expect(cartas.nth(i).getByRole('img')).toHaveAttribute('aria-label', /\S/);
    }
  }

  test('Klondike entra sin scroll horizontal y con cartas legibles', async ({ page }) => {
    await abrirJuego(page, 'klondike');
    await sinScrollHorizontal(page);
    await page.getByTestId('empezar').click();
    await sinScrollHorizontal(page);
    await cartasLegibles(page);
    await page.waitForFunction(() => document.getAnimations().length === 0);
    await page.screenshot({ path: 'test-results/klondike-360.png' });
  });

  test('Brisca de 2 y de 4 entra sin scroll horizontal', async ({ page }) => {
    await abrirJuego(page, 'brisca');
    await sinScrollHorizontal(page);
    await page.getByTestId('empezar').click();
    await sinScrollHorizontal(page);
    await cartasLegibles(page);
    await page.waitForFunction(() => document.getAnimations().length === 0);
    await page.screenshot({ path: 'test-results/brisca-360.png' });

    await page.getByTestId('volver-menu').click();
    await page.getByTestId('juego-brisca').click();
    await page.getByLabel('4 jugadores en parejas').check();
    await page.getByTestId('empezar').click();
    await sinScrollHorizontal(page);
    await page.waitForFunction(() => document.getAnimations().length === 0);
    await page.screenshot({ path: 'test-results/brisca4-360.png' });
  });
});

// ── Cómo se juega ────────────────────────────────────────────────────────────

for (const juego of [
  'klondike',
  'brisca',
  'tute',
  'escoba',
  'chinchon',
  'guinote',
  'sieteYMedia',
  'freecell',
  'cinquillo',
  'pocha',
  'mus',
  'spider',
  'corazones',
  'burro',
] as const) {
  test(`la guía de ${juego} se abre desde las opciones y desde la partida`, async ({ page }) => {
    await abrirJuego(page, juego);
    await page.getByTestId('ver-ayuda').click();
    const guia = page.getByTestId('como-se-juega');
    await expect(guia).toBeVisible();
    await expect(guia.getByRole('heading', { name: 'El objetivo' })).toBeVisible();
    await page.screenshot({
      path: `test-results/ayuda-${juego}-${page.viewportSize()!.width}.png`,
    });
    await page.getByTestId('cerrar-ayuda').click();
    await expect(guia).toBeHidden();

    await page.getByTestId('empezar').click();
    await page.getByTestId('ver-ayuda').click();
    await expect(guia).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(guia).toBeHidden();
  });
}
