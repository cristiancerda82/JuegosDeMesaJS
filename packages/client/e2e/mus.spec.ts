import { expect, test, type Page } from '@playwright/test';
import {
  aplicar,
  CONFIG_MUS_POR_DEFECTO,
  crearAzar,
  iaMusBasica,
  mus,
  type AccionMus,
  type EstadoMus,
} from '@juegos/engine';

async function empezar(page: Page, query: string, corta = false) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-mus').click();
  if (corta) {
    await page.getByLabel('A un juego').check();
    await page.getByLabel('A 30 piedras').check();
  }
  await page.getByTestId('empezar').click();
}

const SIGUIENTE =
  '[data-testid^="accion-"], [data-testid="descartar"], [data-testid="panel-mano"], [data-testid="fin"]';

/**
 * Juega la partida desde la UI: pide mus una vez por mano y luego corta, descarta la primera
 * carta, envida de vez en cuando, quiere o no quiere alternando, y cierra cada conteo.
 */
async function jugar(page: Page): Promise<number> {
  let conteos = 0;
  let musPedido = false;
  for (let paso = 0; paso < 800; paso++) {
    await page.locator(SIGUIENTE).first().waitFor();
    if (await page.getByTestId('fin').isVisible()) return conteos;
    const visible = (id: string) => page.getByTestId(id).isVisible();
    if (await visible('panel-mano')) {
      await expect(page.getByTestId('conteo-mus')).toBeVisible();
      await expect(page.getByTestId('cartas-0')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
      conteos++;
      musPedido = false;
    } else if (await visible('descartar')) {
      await page.locator('.carta-mus').first().click();
      await page.getByTestId('descartar').click();
    } else if (await visible('accion-mus')) {
      await page.getByTestId(musPedido ? 'accion-cortar' : 'accion-mus').click();
      musPedido = true;
    } else if (await visible('accion-quiero')) {
      await page.getByTestId(paso % 2 === 0 ? 'accion-quiero' : 'accion-no-quiero').click();
    } else if ((await visible('accion-envidar-2')) && paso % 3 === 0) {
      await page.getByTestId('accion-envidar-2').click();
    } else {
      await page.getByTestId('accion-paso').click();
    }
  }
  throw new Error('La partida de Mus no terminó');
}

/** Decisión de la IA en una simulación con el motor. */
const decideIa = (e: EstadoMus): AccionMus =>
  iaMusBasica.decidir(mus.vistaDe(e, e.turno), mus.accionesLegales(e, e.turno), crearAzar('x'))
    .accion;
const avanzar = (e: EstadoMus, accion: AccionMus) =>
  (aplicar(mus, e, e.turno, accion) as { valor: EstadoMus }).valor;

/** Semilla en la que, si el humano pide mus, los tres de la IA también lo piden. */
function semillaConDescarte(): string {
  for (let i = 0; i < 500; i++) {
    const semilla = `descarte-${i}`;
    const r = mus.crear(CONFIG_MUS_POR_DEFECTO, semilla);
    if (!r.ok) throw new Error(r.error);
    let e = avanzar(r.valor, { tipo: 'mus' });
    while (e.fase === 'mus' && e.turno !== 0) e = avanzar(e, decideIa(e));
    if (e.fase === 'descarte') return semilla;
  }
  throw new Error('Ninguna semilla de prueba llega al descarte');
}

/**
 * Semilla en la que el humano, cortando el mus y pasando siempre, tiene que contestar un envite
 * (no un órdago) en la primera mano.
 */
function semillaConEnvite(): string {
  for (let i = 0; i < 500; i++) {
    const semilla = `envite-${i}`;
    const r = mus.crear(CONFIG_MUS_POR_DEFECTO, semilla);
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    while (e.resultadosManos.length === 0) {
      if (e.turno === 0) {
        if (e.envite !== null) {
          if (!e.envite.ordago) return semilla;
          break;
        }
        e = avanzar(e, { tipo: e.fase === 'mus' ? 'cortar' : 'paso' });
      } else {
        e = avanzar(e, decideIa(e));
      }
    }
  }
  throw new Error('Ninguna semilla de prueba lleva a contestar un envite');
}

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Mus completa contra la IA, a un juego de 30', async ({ page }) => {
  await empezar(page, 'rapido&semilla=mus-e2e', true);
  await expect(page.locator('.carta-mus')).toHaveCount(4);
  await expect(page.getByTestId('fase-mus')).toBeVisible();
  const conteos = await jugar(page);
  expect(conteos).toBeGreaterThan(0);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido/);
  await expect(fin).toContainText('Juegos ganados');
  await expect(fin.getByTestId('conteo-mus')).toBeVisible();
});

// ── Descarte ─────────────────────────────────────────────────────────────────

test('descartar dos cartas las cambia por otras dos', async ({ page }) => {
  await empezar(page, `rapido&semilla=${semillaConDescarte()}`);
  await page.getByTestId('accion-mus').click();
  const descartar = page.getByTestId('descartar');
  await expect(descartar).toBeVisible();
  await expect(descartar).toBeDisabled();
  const cartas = page.locator('.carta-mus');
  const fuera = [
    (await cartas.nth(0).getAttribute('data-carta'))!,
    (await cartas.nth(2).getAttribute('data-carta'))!,
  ];
  await cartas.nth(0).click();
  await cartas.nth(2).click();
  await expect(descartar).toHaveText('Descartar 2');
  await descartar.click();
  await expect(descartar).toBeHidden();
  await expect(cartas).toHaveCount(4);
  for (const id of fuera) await expect(page.getByTestId(`mano-${id}`)).toHaveCount(0);
});

// ── Contestar un envite ──────────────────────────────────────────────────────

test('ante un envite se puede querer, no querer o subir, pero no pasar', async ({ page }) => {
  await empezar(page, `rapido&semilla=${semillaConEnvite()}`);
  for (let paso = 0; paso < 40; paso++) {
    await page.locator('[data-testid^="accion-"]').first().waitFor();
    if (await page.getByTestId('accion-quiero').isVisible()) break;
    if (await page.getByTestId('accion-cortar').isVisible()) {
      await page.getByTestId('accion-cortar').click();
    } else {
      await page.getByTestId('accion-paso').click();
    }
  }
  await expect(page.getByTestId('accion-quiero')).toBeVisible();
  await expect(page.getByTestId('accion-no-quiero')).toBeVisible();
  await expect(page.getByTestId('accion-subir-2')).toBeVisible();
  await expect(page.getByTestId('accion-ordago')).toBeVisible();
  await expect(page.getByTestId('accion-paso')).toBeHidden();
  await expect(page.getByTestId('lances').locator('.actual')).toContainText(/Envite de/);
  await page.getByTestId('accion-quiero').click();
  await expect(page.getByTestId('lances')).toContainText('queridas');
});

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test('la mesa del Mus entra en 360 × 640', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena');
  await expect(page.getByTestId('accion-mus')).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
    alto: document.documentElement.scrollHeight,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (const a of [1, 2, 3]) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await page.screenshot({ path: 'test-results/mus-360.png' });
});
