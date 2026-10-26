import { expect, test, type Page } from '@playwright/test';
import {
  casino,
  CONFIG_CASINO_POR_DEFECTO,
  crearAzar,
  iaCasinoBasica,
  type AccionCasino,
  type EstadoCasino,
} from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 8 } };

async function empezar(page: Page, query: string, jugadores = 2) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-casino').click();
  await page.getByLabel(`${jugadores} jugadores`, { exact: true }).check();
  await page.getByTestId('empezar').click();
}

function crear(semilla: string): EstadoCasino {
  const r = casino.crear(CONFIG_CASINO_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** La primera semilla cuya mano inicial del asiento 0 tiene una jugada que cumple `vale`. */
function semillaCon(
  prefijo: string,
  vale: (e: EstadoCasino, accion: AccionCasino) => boolean,
): { semilla: string; accion: AccionCasino } {
  for (let i = 0; i < 500; i++) {
    const semilla = `${prefijo}-${i}`;
    const e = crear(semilla);
    const accion = casino.accionesLegales(e, 0).find((a) => vale(e, a));
    if (accion) return { semilla, accion };
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

/**
 * Construye con la jugada y deja que responda la IA normal (la básica, determinista): la
 * construcción sigue siendo del asiento 0 cuando vuelve a tocarle.
 */
function conservaLaConstruccion(e: EstadoCasino, accion: AccionCasino): boolean {
  if (accion.tipo !== 'construir' || accion.construccion !== null) return false;
  let s = casino.transicion(e, 0, accion);
  const legales = casino.accionesLegales(s, 1);
  const respuesta = iaCasinoBasica.decidir(casino.vistaDe(s, 1), legales, crearAzar('x')).accion;
  s = casino.transicion(s, 1, respuesta);
  return s.turno === 0 && s.mesa.some((el) => el.tipo === 'construccion' && el.duenio === 0);
}

async function tocarCarta(page: Page, carta: string) {
  await page.locator(`.carta-mano[data-carta="${carta}"]`).click(ESQUINA);
}

// ── Recoger, construir y dejar ───────────────────────────────────────────────

test('recoger con una carta de la mano', async ({ page }) => {
  const { semilla, accion } = semillaCon('recoger', (_e, a) => a.tipo === 'recoger');
  const e = crear(semilla);
  await empezar(page, `semilla=${semilla}`);
  await expect(page.locator('.carta-mano')).toHaveCount(4);
  await expect(page.getByTestId('cartas-mazo')).toHaveText('40');
  await page.screenshot({ path: `test-results/casino-mesa-${page.viewportSize()!.width}.png` });

  await tocarCarta(page, accion.carta);
  const boton = page.locator('[data-testid="jugadas"] [data-tipo="recoger"]');
  await expect(boton).toBeVisible();
  // Las cartas que se lleva, resaltadas en la mesa.
  await boton.hover();
  await expect(page.locator('[data-testid="mesa"] .resaltada').first()).toBeVisible();
  const recoge = casino.transicion(e, 0, accion).recogidas[0]!.length;
  await boton.click();
  await expect(page.getByTestId('recogidas-0')).toHaveText(
    recoge === 1 ? '1 carta recogida' : `${recoge} cartas recogidas`,
  );
  await expect(page.locator('.carta-mano')).toHaveCount(3);
});

test('construir y, con la construcción propia en la mesa, no poder dejar carta', async ({
  page,
}) => {
  const { semilla, accion } = semillaCon('construir', conservaLaConstruccion);
  if (accion.tipo !== 'construir') throw new Error('Se esperaba una construcción');
  await empezar(page, `rapido&semilla=${semilla}`);
  await tocarCarta(page, accion.carta);
  await page
    .getByTestId('jugadas')
    .getByRole('button', { name: `Construir ${accion.valor}`, exact: true })
    .first()
    .click();
  const construccion = page.locator('[data-testid="mesa"] .construccion.mia');
  await expect(construccion).toBeVisible();
  await expect(construccion).toContainText(`${accion.valor}`);
  await expect(construccion).toContainText('tuya');

  // Vuelve a tocarle con la construcción suya: ninguna carta se puede dejar.
  await expect(page.getByTestId('turno')).toHaveText('Tu turno: toca una carta', {
    timeout: 30_000,
  });
  await expect(construccion).toBeVisible();
  const cartas = await page
    .locator('.carta-mano.jugable')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')!));
  expect(cartas.length).toBeGreaterThan(0);
  for (const carta of cartas) {
    await tocarCarta(page, carta);
    await expect(page.getByTestId('jugadas')).toBeVisible();
    await expect(page.locator('[data-testid="jugadas"] [data-tipo="dejar"]')).toHaveCount(0);
  }
  await page.screenshot({
    path: `test-results/casino-construccion-${page.viewportSize()!.width}.png`,
  });
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Casino completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=casino-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 2_000; pasos++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="panel-mano"], [data-testid="fin"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-casino')).toBeVisible();
      await expect(page.getByTestId('resumen-casino')).toContainText('10♦ (Big Casino)');
      if (manos === 0)
        await page.screenshot({
          path: `test-results/casino-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    // La primera jugada de la primera carta jugable.
    await page
      .locator('.carta-mano.jugable')
      .first()
      .click(ESQUINA)
      .catch(() => {});
    await page
      .getByTestId('jugada-0')
      .click({ timeout: 2_000 })
      .catch(() => {});
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin).toContainText('Puntos (a 21)');
  await expect(fin.getByTestId('resumen-casino')).toBeVisible();
  await page.screenshot({ path: `test-results/casino-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Casino se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=casino-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(4);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Casino de 4 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await page.goto('./?rapido&semilla=pequena');
  await page.getByTestId('juego-casino').click();
  await page.getByLabel('4 jugadores', { exact: true }).check();
  await page.getByTestId('parejas').check();
  await page.getByTestId('empezar').click();
  await page.locator('.carta-mano.jugable').first().waitFor({ timeout: 30_000 });
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await expect(page.getByTestId('asiento-2')).toContainText('Compañero');
  await expect(page.getByTestId('bando-0')).toContainText('Tu pareja');
  await page.screenshot({ path: 'test-results/casino4-360.png' });
});
