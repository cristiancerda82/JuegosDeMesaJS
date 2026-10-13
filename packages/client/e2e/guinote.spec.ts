import { expect, test, type Page } from '@playwright/test';
import {
  aplicar,
  CONFIG_GUINOTE_POR_DEFECTO,
  crearAzar,
  guinote,
  iaGuinoteBasica,
  type AccionGuinote,
  type EstadoGuinote,
  type IdCarta,
} from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarGuinote(page: Page, query: string, cuatro = false) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-guinote').click();
  if (cuatro) await page.getByLabel('4 jugadores en parejas').check();
  await page.getByTestId('empezar').click();
}

/** La política del humano en los tests: cantar si puede y, si no, la carta jugable menor. */
function eleccionHumana(acciones: readonly AccionGuinote[]): AccionGuinote {
  const cante = acciones.find((a) => a.tipo === 'cantar');
  if (cante) return cante;
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : [])).sort();
  return { tipo: 'jugar', carta: cartas[0]! };
}

/** Busca una semilla en la que, con esa política, el humano canta en la primera mano. */
function semillaConCante(): string {
  for (let i = 0; i < 500; i++) {
    const semilla = `cante-${i}`;
    const r = guinote.crear(CONFIG_GUINOTE_POR_DEFECTO, semilla);
    if (!r.ok) throw new Error(r.error);
    let e: EstadoGuinote = r.valor;
    while (guinote.resultado(e) === null && e.resultadosManos.length === 0) {
      const legales = guinote.accionesLegales(e, e.turno);
      const accion =
        e.turno === 0
          ? eleccionHumana(legales)
          : iaGuinoteBasica.decidir(guinote.vistaDe(e, e.turno), legales, crearAzar('x')).accion;
      if (e.turno === 0 && accion.tipo === 'cantar') return semilla;
      e = (aplicar(guinote, e, e.turno, accion) as { valor: EstadoGuinote }).valor;
    }
  }
  throw new Error('Ninguna semilla de prueba permite cantar');
}

/**
 * Juega el Guiñote desde la UI con la política de `eleccionHumana`, cerrando el resumen de
 * cada mano. Para cuando `parar` se cumple.
 */
async function jugarGuinote(page: Page, parar: () => Promise<boolean> = async () => false) {
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  for (let jugadas = 0; jugadas < 600; jugadas++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="fin"], [data-testid^="cantar-"], [data-testid="panel-mano"]',
      )
      .first()
      .waitFor();
    if ((await fin.isVisible()) || (await parar())) return;
    if (await panel.isVisible()) {
      await expect(panel.getByTestId('resumen-guinote')).toBeVisible();
      await expect(panel.getByTestId('de-vueltas')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    const cantar = page.locator('[data-testid^="cantar-"]').first();
    if (await cantar.isVisible()) {
      await cantar.click();
      continue;
    }
    const jugables = (await page
      .locator('.carta-mano.jugable')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')!))) as IdCarta[];
    if (jugables.length === 0) continue;
    const carta = [...jugables].sort()[0]!;
    await page.locator(`[data-testid="mano-${carta}"]`).click(ESQUINA);
    await page.getByTestId('mesa').click();
  }
  throw new Error('La partida de Guiñote no terminó');
}

// ── Partidas completas ───────────────────────────────────────────────────────

test('partida de Guiñote completa contra la IA con 2 jugadores', async ({ page }) => {
  await empezarGuinote(page, 'rapido&semilla=guinote-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(6);
  await expect(page.getByTestId('cartas-mazo')).toHaveText('28 cartas en el mazo');
  await expect(page.getByTestId('marcador')).toContainText('0 – 0 (a 101)');
  await jugarGuinote(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido/);
  await expect(fin.getByTestId('resumen-guinote')).toBeVisible();
  await expect(fin.getByTestId('fin-guinote')).toBeVisible();
});

test('partida de Guiñote completa con 4 jugadores en parejas', async ({ page }) => {
  await empezarGuinote(page, 'rapido&semilla=guinote4-e2e', true);
  await expect(page.locator('.carta-mano')).toHaveCount(6);
  await expect(page.getByTestId('cartas-mazo')).toHaveText('16 cartas en el mazo');
  await jugarGuinote(page);
  await expect(page.getByTestId('fin')).toContainText('Tu pareja');
});

// ── Cantes y arrastre ────────────────────────────────────────────────────────

test('el jugador canta desde la mesa con rey y sota', async ({ page }) => {
  const semilla = semillaConCante();
  await empezarGuinote(page, `rapido&semilla=${semilla}`);
  const cantes = page.getByTestId('cantes');
  await jugarGuinote(
    page,
    async () => (await cantes.count()) > 0 && /Tú:/.test(await cantes.innerText()),
  );
  await expect(cantes).toContainText(/Tú: (20|40) en/);
});

test('al agotarse el mazo la mesa avisa del arrastre', async ({ page }) => {
  await empezarGuinote(page, 'rapido&semilla=arrastre');
  const arrastre = page.getByTestId('arrastre');
  await expect(arrastre).toHaveCount(0);
  await jugarGuinote(page, async () => (await arrastre.count()) > 0);
  await expect(arrastre).toBeVisible();
  await expect(page.getByTestId('cartas-mazo')).toHaveCount(0);
});

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test('la mesa del Guiñote entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  for (const cuatro of [false, true]) {
    await empezarGuinote(page, 'semilla=pequena', cuatro);
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    const cartas = page.locator('.carta-mano');
    await expect(cartas).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      const caja = (await cartas.nth(i).boundingBox())!;
      expect(caja.x + caja.width).toBeLessThanOrEqual(anchos.ventana);
      await expect(cartas.nth(i).getByRole('img')).toHaveAttribute('aria-label', /\S/);
    }
    await page.screenshot({ path: `test-results/guinote${cuatro ? 4 : 2}-360.png` });
  }
});
