import { expect, test, type Page } from '@playwright/test';
import {
  compararCulo,
  crearAzar,
  culo,
  iaCuloBasica,
  jugadaCulo,
  type EstadoCulo,
  type IdCarta,
  type VistaCulo,
} from '@juegos/engine';

async function empezarCulo(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-culo').click();
  if (jugadores) await page.getByLabel(`${jugadores} jugadores`, { exact: true }).check();
  await page.getByTestId('empezar').click();
}

/** Espera a que le toque al jugador, termine la mano o la partida. */
async function esperar(page: Page) {
  await page
    .locator(
      '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="jugar"], [data-testid="devolver"]',
    )
    .first()
    .waitFor({ timeout: 30_000 });
}

const cartasDe = (page: Page, selector: string) =>
  page
    .locator(`${selector} [data-carta]`)
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta') as IdCarta));

/** Juega el turno del jugador como lo haría la IA normal, que solo mira la mano y la mesa. */
async function jugarComoLaBasica(page: Page) {
  const miMano = await cartasDe(page, '[data-testid="mano"]');
  const mesa = await cartasDe(page, '[data-testid="mesa"]');
  const accion = jugadaCulo({
    miMano,
    mesa: mesa.length ? { asiento: 1, cartas: mesa } : null,
  } as VistaCulo);
  if (accion.tipo === 'pasar') {
    await page.getByTestId('pasar').click();
    return;
  }
  if (accion.tipo !== 'jugar') return;
  if (mesa.length > 0) {
    // Al superar, un toque marca las demás de su valor.
    await page.getByTestId(`mano-${accion.cartas[0]}`).click();
  } else {
    for (const c of accion.cartas) await page.getByTestId(`mano-${c}`).click();
  }
  await page.getByTestId('jugar').click();
}

/**
 * Una semilla de 4 jugadores en la que, jugando todos como la IA normal, el asiento 0 queda
 * presidente en la primera mano.
 */
function semillaPresidente(): string {
  for (let i = 0; i < 300; i++) {
    const semilla = `presidente-${i}`;
    const r = culo.crear({ jugadores: 4 }, semilla);
    if (!r.ok) throw new Error(r.error);
    let e: EstadoCulo = r.valor;
    while (e.resultadosManos.length === 0) {
      const acciones = culo.accionesLegales(e, e.turno);
      const d = iaCuloBasica.decidir(culo.vistaDe(e, e.turno), acciones, crearAzar('x'));
      e = culo.transicion(e, e.turno, d.accion);
    }
    if (e.resultadosManos[0]!.orden[0] === 0) return semilla;
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

/** Una semilla en la que el asiento 0 tiene el 3 de oros y abre. */
function semillaQueAbre(): string {
  for (let i = 0; i < 100; i++) {
    const r = culo.crear({ jugadores: 4 }, `abre-${i}`);
    if (r.ok && r.valor.turno === 0) return `abre-${i}`;
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

// ── Abrir, superar, pasar e intercambio ──────────────────────────────────────

test('abrir con el 3 de oros', async ({ page }) => {
  await empezarCulo(page, `rapido&semilla=${semillaQueAbre()}`);
  await expect(page.locator('[data-testid="mano"] [data-carta]')).toHaveCount(10);
  await expect(page.getByTestId('info-mano')).toHaveText('Mano 1 de 5');
  await expect(page.getByTestId('pasar')).toHaveCount(0);
  await expect(page.getByTestId('jugar')).toBeDisabled();
  await page.screenshot({ path: `test-results/culo-mesa-${page.viewportSize()!.width}.png` });
  await page.getByTestId('mano-oros-3').click();
  await expect(page.getByTestId('jugar')).toBeEnabled();
  await page.getByTestId('jugar').click();
  await expect(page.locator('[data-testid="mano"] [data-carta]')).toHaveCount(9);
  await expect(page.getByTestId('mano-oros-3')).toHaveCount(0);
});

test('al superar, un toque marca las cartas que pide la ronda; también se puede pasar', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await empezarCulo(page, 'rapido&semilla=culo-superar');
  let supero = false;
  let paso = false;
  for (let i = 0; i < 60 && !(supero && paso); i++) {
    await esperar(page);
    if (await page.getByTestId('siguiente-mano').isVisible()) break;
    const mesa = await cartasDe(page, '[data-testid="mesa"]');
    const miMano = await cartasDe(page, '[data-testid="mano"]');
    if (mesa.length === 0) {
      await jugarComoLaBasica(page);
      continue;
    }
    const accion = jugadaCulo({ miMano, mesa: { asiento: 1, cartas: mesa } } as VistaCulo);
    if (!supero && accion.tipo === 'jugar') {
      await page.getByTestId(`mano-${accion.cartas[0]}`).click();
      await expect(page.locator('[data-testid="mano"] [aria-pressed="true"]')).toHaveCount(
        mesa.length,
      );
      await expect(page.getByTestId('jugar')).toBeEnabled();
      await page.getByTestId('jugar').click();
      supero = true;
    } else if (!paso && (await page.getByTestId('pasar').isVisible())) {
      await page.getByTestId('pasar').click();
      await expect(page.getByTestId('turno')).not.toHaveText(/^Tu turno/);
      paso = true;
    } else {
      await jugarComoLaBasica(page);
    }
  }
  expect(supero && paso).toBe(true);
});

test('el presidente devuelve 2 cartas en el intercambio tras ver el resumen', async ({ page }) => {
  test.setTimeout(120_000);
  await empezarCulo(page, `rapido&semilla=${semillaPresidente()}`);
  for (let i = 0; i < 80; i++) {
    await esperar(page);
    if (await page.getByTestId('siguiente-mano').isVisible()) break;
    await jugarComoLaBasica(page);
  }
  const panel = page.getByTestId('panel-mano');
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId('cargo-mano-0')).toHaveText('Presidente');
  await expect(panel.getByTestId('total-0')).toHaveText('3');
  await page.screenshot({ path: `test-results/culo-resumen-${page.viewportSize()!.width}.png` });
  await page.getByTestId('siguiente-mano').click();

  await expect(page.getByTestId('devolver')).toBeVisible();
  await expect(page.getByTestId('cargo-0')).toHaveText('Presidente');
  await expect(page.locator('[data-testid="mano"] [data-carta]')).toHaveCount(12);
  await expect(page.getByTestId('intercambio')).toContainText('Has recibido');
  const mano = await cartasDe(page, '[data-testid="mano"]');
  const devueltas = [...mano].sort(compararCulo).slice(0, 2);
  for (const c of devueltas) await page.getByTestId(`mano-${c}`).click();
  await page.getByTestId('devolver').click();
  await expect(page.locator('[data-testid="mano"] [data-carta]')).toHaveCount(10);
  for (const c of devueltas) await expect(page.getByTestId(`mano-${c}`)).toHaveCount(0);
});

test('partida de Culo completa contra la IA', async ({ page }) => {
  test.setTimeout(300_000);
  await empezarCulo(page, 'rapido&semilla=culo-completa');
  const fin = page.getByTestId('fin');
  for (let paso = 0; paso < 1_000; paso++) {
    await esperar(page);
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('devolver').isVisible()) {
      const mano = await cartasDe(page, '[data-testid="mano"]');
      const k = Number((await page.getByTestId('devolver').innerText()).match(/\d/)![0]);
      for (const c of mano.slice(0, k)) await page.getByTestId(`mano-${c}`).click();
      await page.getByTestId('devolver').click();
    } else {
      await jugarComoLaBasica(page);
    }
  }
  await expect(fin).toBeVisible();
  await expect(fin).toContainText('Clasificación');
  await expect(fin.getByTestId('posicion-0')).toBeVisible();
  await page.screenshot({ path: `test-results/culo-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Culo se continúa con la misma mano', async ({ page }) => {
  await empezarCulo(page, 'semilla=culo-retomar');
  const antes = await cartasDe(page, '[data-testid="mano"]');
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.getByTestId(`mano-${c}`)).toBeVisible();
});

test('el Culo de 6 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarCulo(page, 'rapido&semilla=pequena', 6);
  await esperar(page);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 5; a++) await expect(page.getByTestId(`puesto-${a}`)).toBeVisible();
  await page.screenshot({ path: 'test-results/culo6-360.png' });
});
