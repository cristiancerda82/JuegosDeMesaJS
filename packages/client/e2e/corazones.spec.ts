import { expect, test, type Page } from '@playwright/test';
import {
  aplicar,
  CONFIG_CORAZONES_POR_DEFECTO,
  corazones,
  crearAzar,
  iaCorazonesBasica,
  type EstadoCorazones,
  type IdCarta,
} from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 8 } };

async function empezar(page: Page, query: string, aCincuenta = false) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-corazones').click();
  if (aCincuenta) await page.getByLabel('A 50 puntos').check();
  await page.getByTestId('empezar').click();
}

const SIGUIENTE =
  '.carta-mano.jugable, [data-testid="pasar"], [data-testid="panel-mano"], [data-testid="fin"]';

/** Juega la partida: pasa las tres primeras cartas, juega la primera legal y cierra cada resumen. */
async function jugar(page: Page): Promise<number> {
  let resumenes = 0;
  for (let paso = 0; paso < 1500; paso++) {
    await page.locator(SIGUIENTE).first().waitFor();
    if (await page.getByTestId('fin').isVisible()) return resumenes;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('fila-0')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
      resumenes++;
    } else if (await page.getByTestId('pasar').isVisible()) {
      for (let i = 0; i < 3; i++) await page.locator('[data-testid^="pase-"]').nth(i).click();
      await page.getByTestId('pasar').click();
    } else {
      await page.locator('.carta-mano.jugable').first().click(ESQUINA);
      await page.getByTestId('mesa').click();
    }
  }
  throw new Error('La partida de Corazones no terminó');
}

/** Orden en que el panel de pase muestra la mano: por palo y por valor. */
const ORDEN_PALOS = ['treboles', 'diamantes', 'picas', 'corazones'];
const rango = (c: string) => {
  const v = Number(c.split('-')[1]);
  return v === 1 ? 14 : v;
};
const ordenar = (mano: readonly IdCarta[]) =>
  [...mano].sort(
    (a, b) =>
      ORDEN_PALOS.indexOf(a.split('-')[0]!) - ORDEN_PALOS.indexOf(b.split('-')[0]!) ||
      rango(a) - rango(b),
  );

/**
 * Semilla en la que, si el humano pasa sus tres cartas más altas, acaba con el 2 de tréboles y
 * tiene que salir. Devuelve también las cartas que pasa.
 */
function semillaConSalida(): { semilla: string; pase: IdCarta[] } {
  for (let i = 0; i < 300; i++) {
    const semilla = `salida-${i}`;
    const r = corazones.crear(CONFIG_CORAZONES_POR_DEFECTO, semilla);
    if (!r.ok) throw new Error(r.error);
    let e: EstadoCorazones = r.valor;
    const pase = ordenar(e.manos[0]!).slice(-3);
    if (pase.includes('treboles-2')) continue;
    e = (
      aplicar(corazones, e, 0, {
        tipo: 'pasar',
        cartas: e.manos[0]!.filter((c) => pase.includes(c)),
      }) as { valor: EstadoCorazones }
    ).valor;
    while (e.fase === 'pase') {
      const legales = corazones.accionesLegales(e, e.turno);
      const accion = iaCorazonesBasica.decidir(
        corazones.vistaDe(e, e.turno),
        legales,
        crearAzar('x'),
      ).accion;
      e = (aplicar(corazones, e, e.turno, accion) as { valor: EstadoCorazones }).valor;
    }
    if (e.turno === 0) return { semilla, pase };
  }
  throw new Error('Ninguna semilla deja salir al humano');
}

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Corazones completa contra la IA, a 50 puntos', async ({ page }) => {
  await empezar(page, 'rapido&semilla=corazones-e2e', true);
  await expect(page.getByTestId('panel-pase')).toBeVisible();
  const resumenes = await jugar(page);
  expect(resumenes).toBeGreaterThan(0);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido|Empate/);
  await expect(fin).toContainText('Puntos (menos es mejor)');
});

// ── Pase y salida ────────────────────────────────────────────────────────────

test('pasar tres cartas, ver las recibidas y salir con el 2 de tréboles', async ({ page }) => {
  const { semilla, pase } = semillaConSalida();
  await empezar(page, `rapido&semilla=${semilla}`);
  await expect(page.getByTestId('panel-pase')).toContainText('Rival 1');
  const pasar = page.getByTestId('pasar');
  await expect(pasar).toBeDisabled();
  for (const id of pase) await page.getByTestId(`pase-${id}`).click();
  await expect(pasar).toBeEnabled();
  await pasar.click();
  await expect(page.getByTestId('panel-pase')).toBeHidden();
  await expect(page.getByTestId('recibidas').locator('svg')).toHaveCount(3);
  for (const id of pase) await expect(page.getByTestId(`mano-${id}`)).toHaveCount(0);
  await expect(page.locator('.carta-mano')).toHaveCount(13);
  const jugables = page.locator('.carta-mano.jugable');
  await expect(jugables).toHaveCount(1);
  await expect(jugables).toHaveAttribute('data-carta', 'treboles-2');
});

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test('la mesa de los Corazones entra en 360 × 640', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'rapido&semilla=pequena');
  await expect(page.getByTestId('panel-pase')).toBeVisible();
  await page.screenshot({ path: 'test-results/corazones-pase-360.png' });
  for (let i = 0; i < 3; i++) await page.locator('[data-testid^="pase-"]').nth(i).click();
  await page.getByTestId('pasar').click();
  await expect(page.getByTestId('panel-pase')).toBeHidden();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(page.locator('.carta-mano')).toHaveCount(13);
  await page.screenshot({ path: 'test-results/corazones-360.png' });
});
