import { expect, test, type Page } from '@playwright/test';
import { CONFIG_TUTE_POR_DEFECTO, type IdCarta } from '@juegos/engine';
import { eleccionHumana, simularTute } from './tute-simulacion';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarTute(page: Page, query: string, cuatro = false) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-tute').click();
  if (cuatro) await page.getByLabel('4 jugadores en parejas').check();
  await page.getByTestId('empezar').click();
}

/** Busca una semilla cuya partida simulada cumpla la condición. */
function buscarSemilla(prefijo: string, cumple: (s: ReturnType<typeof simularTute>) => boolean) {
  for (let i = 0; i < 500; i++) {
    const semilla = `${prefijo}-${i}`;
    if (cumple(simularTute(CONFIG_TUTE_POR_DEFECTO, semilla))) return semilla;
  }
  throw new Error('Ninguna semilla de prueba cumple la condición');
}

/**
 * Juega el Tute desde la UI con la misma política que `simularTute`: canta lo que puede y, si
 * no, juega la primera carta jugable que no rompa una pareja. Para cuando `parar` se cumple.
 */
async function jugarTute(page: Page, parar: () => Promise<boolean> = async () => false) {
  const fin = page.getByTestId('fin');
  for (let jugadas = 0; jugadas < 300; jugadas++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="fin"], [data-testid^="cantar-"]')
      .first()
      .waitFor();
    if ((await fin.isVisible()) || (await parar())) return;
    const cantar = page.locator('[data-testid="cantar-tute"], [data-testid^="cantar-"]').first();
    if (await cantar.isVisible()) {
      await cantar.click();
      continue;
    }
    const ids = (sel: string) =>
      page.locator(sel).evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')!));
    const mano = (await ids('.carta-mano')) as IdCarta[];
    const jugables = (await ids('.carta-mano.jugable')) as IdCarta[];
    if (jugables.length === 0) continue;
    const cantados = await page
      .locator('[data-testid="cantes"]')
      .allTextContents()
      .then((t) => ['oros', 'copas', 'espadas', 'bastos'].filter((p) => t.join(' ').includes(p)));
    const carta = eleccionHumana(mano, jugables, cantados);
    await page.locator(`[data-testid="mano-${carta}"]`).click(ESQUINA);
    await page.getByTestId('mesa').click();
  }
  throw new Error('La partida de Tute no terminó');
}

// ── Partidas completas ───────────────────────────────────────────────────────

test('partida de Tute completa contra la IA con 2 jugadores', async ({ page }) => {
  await empezarTute(page, 'rapido&semilla=tute-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(8);
  await expect(page.getByTestId('cartas-mazo')).toHaveText('24 cartas en el mazo');
  await jugarTute(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido|Empate/);
  await expect(fin.getByRole('button', { name: 'Jugar otra vez' })).toBeVisible();
});

test('partida de Tute completa con 4 jugadores en parejas', async ({ page }) => {
  await empezarTute(page, 'rapido&semilla=tute4-e2e', true);
  await expect(page.locator('.carta-mano')).toHaveCount(10);
  // La carta de triunfo del repartidor (asiento 3) se ve en su mano.
  await expect(page.getByTestId('asiento-3').locator('[data-carta]')).toHaveCount(1);
  await expect(page.getByTestId('asiento-2').locator('[data-carta]')).toHaveCount(0);
  await jugarTute(page);
  await expect(page.getByTestId('fin')).toContainText('Tu pareja');
});

// ── Cantes ───────────────────────────────────────────────────────────────────

test('el jugador canta desde la mesa', async ({ page }) => {
  const semilla = buscarSemilla('canta', (s) => s.cantes.some((c) => c.asiento === 0));
  await empezarTute(page, `rapido&semilla=${semilla}`);
  const cantes = page.getByTestId('cantes');
  await jugarTute(
    page,
    async () => (await cantes.count()) > 0 && /Tú:/.test(await cantes.innerText()),
  );
  await expect(cantes).toContainText(/Tú: (20|40) en/);
});

test('el cante de la IA se anuncia con su pareja', async ({ page }) => {
  // Una semilla en la que la IA canta pronto, para jugar a velocidad normal.
  const semilla = buscarSemilla('ia', (s) =>
    s.cantes.some((c) => c.asiento === 1 && c.accion < 12),
  );
  await empezarTute(page, `semilla=${semilla}`);
  const aviso = page.getByTestId('aviso').filter({ hasText: 'Rival canta las' });
  await jugarTute(page, async () => (await aviso.count()) > 0);
  await expect(aviso).toBeVisible();
  await expect(aviso.locator('svg')).toHaveCount(2);
  await expect(page.getByTestId('cantes')).toContainText('Rival:');
});

// ── Guía y pausa de la IA ────────────────────────────────────────────────────

test('con la guía abierta la IA espera y al cerrarla la partida sigue', async ({ page }) => {
  await empezarTute(page, 'semilla=guia');
  const carta = page.locator('.carta-mano.jugable').first();
  await carta.click(ESQUINA);
  await page.getByTestId('mesa').click();
  await page.getByTestId('ver-ayuda').click();
  await expect(page.getByTestId('como-se-juega')).toBeVisible();
  await page.waitForTimeout(1_500);
  await expect(page.getByTestId('mesa').locator('[data-carta]')).toHaveCount(1);

  await page.getByTestId('cerrar-ayuda').click();
  await expect(page.getByTestId('mesa').locator('[data-carta]')).toHaveCount(2);
});

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test('10 cartas en 360 × 640 sin scroll horizontal y con cada índice a la vista', async ({
  page,
}) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarTute(page, 'semilla=pequena', true);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);

  const cajas = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON() as DOMRect));
  expect(cajas).toHaveLength(10);
  for (const [i, caja] of cajas.entries()) {
    expect(caja.left).toBeGreaterThanOrEqual(0);
    expect(caja.right).toBeLessThanOrEqual(anchos.ventana);
    expect(caja.width).toBeGreaterThanOrEqual(40);
    // La siguiente carta deja a la vista al menos un cuarto de esta (su índice).
    const siguiente = cajas[i + 1];
    if (siguiente) expect(siguiente.left - caja.left).toBeGreaterThanOrEqual(caja.width * 0.25);
  }
  await page.screenshot({ path: 'test-results/tute4-360.png' });
});
