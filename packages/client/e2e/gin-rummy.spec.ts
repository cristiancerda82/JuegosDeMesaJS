import { expect, test, type Page } from '@playwright/test';
import {
  aplicar,
  cartaDeId,
  CONFIG_GIN_RUMMY_POR_DEFECTO,
  crearAzar,
  ginRummy,
  iaGinRummyBasica,
  mejorRepartoGin,
  type EstadoGinRummy,
  type IdCarta,
} from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarGin(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-ginRummy').click();
  await page.getByTestId('empezar').click();
}

/**
 * La carta que la UI descarta: la última de la mano ordenada por combinaciones (las sueltas van
 * al final, de menor a mayor valor), igual que hace `MesaGinRummy`.
 */
function ultimaOrdenada(mano: readonly IdCarta[]): IdCarta {
  const r = mejorRepartoGin(mano);
  const sueltas = [...r.sueltas].sort((a, b) => cartaDeId(a)!.valor - cartaDeId(b)!.valor);
  return [...r.combinaciones.flat(), ...sueltas].at(-1)!;
}

const paso = (e: EstadoGinRummy, a: Parameters<typeof ginRummy.transicion>[2]) =>
  (aplicar(ginRummy, e, e.turno, a) as { valor: EstadoGinRummy }).valor;

/**
 * Busca una semilla en la que, pasando la primera carta, robando siempre del mazo y descartando
 * como la UI, el humano pueda cerrar en la primera mano. Devuelve el turno y la carta.
 */
function semillaParaCerrar() {
  for (let i = 0; i < 500; i++) {
    const semilla = `cierre-${i}`;
    const r = ginRummy.crear(CONFIG_GIN_RUMMY_POR_DEFECTO, semilla);
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    for (let turnoHumano = 0, pasos = 0; pasos < 80; pasos++) {
      if (e.resultadosManos.length > 0) break;
      const legales = ginRummy.accionesLegales(e, e.turno);
      if (e.turno !== 0) {
        const d = iaGinRummyBasica.decidir(ginRummy.vistaDe(e, e.turno), legales, crearAzar('x'));
        e = paso(e, d.accion);
        continue;
      }
      if (e.fase === 'primera') e = paso(e, { tipo: 'pasar' });
      else if (e.fase === 'robar') e = paso(e, { tipo: 'robar', desde: 'mazo' });
      else {
        const cierre = legales.find((a) => a.tipo === 'cerrar');
        if (cierre && cierre.tipo === 'cerrar') {
          return { semilla, turno: turnoHumano, carta: cierre.carta };
        }
        e = paso(e, { tipo: 'descartar', carta: ultimaOrdenada(e.manos[0]!) });
        turnoHumano++;
      }
    }
  }
  throw new Error('Ninguna semilla de prueba permite cerrar pronto');
}

type Fase = 'primera' | 'robar' | 'descartar' | 'panel' | 'fin';

/** Espera a que sea el turno del humano (o termine la mano o la partida) y dice qué toca. */
async function esperarTurno(page: Page): Promise<Fase> {
  await page
    .locator(
      '[data-testid="pasar"], [data-testid="mazo"].robable, .carta-mano.jugable, [data-testid="panel-mano"], [data-testid="fin"]',
    )
    .first()
    .waitFor({ timeout: 30_000 });
  if (await page.getByTestId('fin').isVisible()) return 'fin';
  if (await page.getByTestId('panel-mano').isVisible()) return 'panel';
  if (await page.getByTestId('pasar').isVisible()) return 'primera';
  if ((await page.locator('[data-testid="mazo"].robable').count()) > 0) return 'robar';
  return 'descartar';
}

// ── Primera carta, robar, descartar y cerrar ────────────────────────────────

test('pasar la primera carta y robar del mazo', async ({ page }) => {
  await empezarGin(page, 'rapido&semilla=gin-pasar');
  await expect(page.locator('.carta-mano')).toHaveCount(10);
  await expect(page.getByTestId('turno')).toHaveText('Coge la carta del descarte o pasa');
  await page.screenshot({ path: 'test-results/gin-primera.png' });
  await page.getByTestId('pasar').click();
  // La IA se queda la carta o pasa; después le toca al humano robar.
  const fase = await esperarTurno(page);
  expect(['robar', 'descartar']).toContain(fase);
  if (fase === 'robar') {
    await page.getByTestId('mazo').click();
    await expect(page.locator('.carta-mano')).toHaveCount(11);
  }
});

test('quedarse la primera carta y descartar otra', async ({ page }) => {
  await empezarGin(page, 'semilla=gin-coger');
  const descarte = page.getByTestId('descarte');
  const arriba = await descarte.locator('[data-carta]').getAttribute('data-carta');
  await descarte.click();
  await expect(page.locator('.carta-mano')).toHaveCount(11);
  await expect(page.getByTestId(`mano-${arriba}`)).toBeVisible();
  // La cogida del descarte no se puede soltar en este turno.
  await expect(page.getByTestId(`mano-${arriba}`)).not.toHaveClass(/jugable/);
  const carta = page.locator('.carta-mano.jugable').last();
  const id = await carta.getAttribute('data-carta');
  await carta.click(ESQUINA);
  await page.getByTestId('descartar').click();
  await expect(page.locator('.carta-mano')).toHaveCount(10);
  await expect(descarte.locator(`[data-carta="${id}"]`)).toBeVisible();
});

test('cerrar desde la mesa', async ({ page }) => {
  const { semilla, turno, carta } = semillaParaCerrar();
  await empezarGin(page, `rapido&semilla=${semilla}`);
  for (let t = 0; t <= turno;) {
    const fase = await esperarTurno(page);
    if (fase === 'primera') {
      await page.getByTestId('pasar').click();
      await expect(page.getByTestId('pasar')).toHaveCount(0);
    } else if (fase === 'robar') {
      await page.getByTestId('mazo').click();
    } else if (fase === 'descartar') {
      if (t === turno) break;
      await page.locator('.carta-mano.jugable').last().click(ESQUINA);
      await page.getByTestId('descartar').click();
      t++;
    } else {
      throw new Error(`Fase inesperada: ${fase}`);
    }
  }
  await page.getByTestId(`mano-${carta}`).click(ESQUINA);
  const cerrar = page.getByTestId('cerrar');
  await expect(cerrar).toBeEnabled();
  await expect(cerrar).toHaveText(/Cerrar|¡Gin!/);
  await cerrar.click();
  const panel = page.getByTestId('panel-mano');
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId('tipo-cierre')).toContainText(/Cierras|¡Gin!|Undercut/);
  await expect(panel.getByTestId('resultado-1')).toBeVisible();
  await page.screenshot({ path: `test-results/gin-panel-${page.viewportSize()!.width}.png` });
});

test('partida de Gin Rummy completa contra la IA', async ({ page }) => {
  test.setTimeout(300_000);
  await empezarGin(page, 'rapido&semilla=gin-e2e');
  for (let pasos = 0; pasos < 3_000; pasos++) {
    const fase = await esperarTurno(page);
    if (fase === 'fin') break;
    if (fase === 'panel') {
      await expect(page.getByTestId('panel-mano').getByTestId('tipo-cierre')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
    } else if (fase === 'primera') {
      await page.getByTestId('pasar').click();
      await expect(page.getByTestId('pasar')).toHaveCount(0);
    } else if (fase === 'robar') {
      await page.getByTestId('mazo').click();
    } else {
      await page.locator('.carta-mano.jugable').last().click(ESQUINA);
      const cerrar = page.getByTestId('cerrar');
      if (await cerrar.isEnabled()) await cerrar.click();
      else await page.getByTestId('descartar').click();
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido/);
  await expect(fin).toContainText('Marcador final');
  await expect(fin.getByTestId('marcador-fin-0')).toBeVisible();
  // El marcador desglosado cabe en la pantalla, también en el móvil.
  const caja = (await fin.boundingBox())!;
  expect(caja.x).toBeGreaterThanOrEqual(0);
  expect(caja.x + caja.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.screenshot({ path: `test-results/gin-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Gin Rummy se continúa con la misma mano', async ({ page }) => {
  await empezarGin(page, 'semilla=gin-retomar');
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('.carta-mano')).toHaveCount(antes.length);
  for (const c of antes) await expect(page.getByTestId(`mano-${c}`)).toBeVisible();
});

test('la mesa del Gin Rummy entra en 360 × 640 con 11 cartas en la mano', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarGin(page, 'semilla=pequena');
  await page.getByTestId('descarte').click();
  await expect(page.locator('.carta-mano')).toHaveCount(11);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  const cartas = page.locator('.carta-mano');
  for (let i = 0; i < 11; i++) {
    const caja = (await cartas.nth(i).boundingBox())!;
    expect(caja.x + caja.width).toBeLessThanOrEqual(anchos.ventana);
  }
  await page.screenshot({ path: 'test-results/gin-360.png' });
});
