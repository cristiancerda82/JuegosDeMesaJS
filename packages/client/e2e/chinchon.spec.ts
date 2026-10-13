import { expect, test, type Page } from '@playwright/test';
import {
  aplicar,
  cartaDeId,
  chinchon,
  CONFIG_CHINCHON_POR_DEFECTO,
  crearAzar,
  esComodin,
  iaChinchonBasica,
  mejorReparto,
  type ConfigChinchon,
  type IdCarta,
} from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };
const CONFIG: ConfigChinchon = { ...CONFIG_CHINCHON_POR_DEFECTO, limite: 50 };

async function empezarChinchon(page: Page, query: string, jugadores = 2) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-chinchon').click();
  await page.getByLabel(`${jugadores} jugadores`).check();
  await page.getByLabel('Al pasar de 50 puntos').check();
  await page.getByTestId('empezar').click();
}

/**
 * La carta que la UI descarta: la última de la mano ordenada por combinaciones (las sueltas van
 * al final, de menor a mayor valor), igual que hace `MesaChinchon`.
 */
function ultimaOrdenada(mano: readonly IdCarta[]): IdCarta {
  const valor = (c: IdCarta) => (esComodin(c) ? 99 : cartaDeId(c)!.valor);
  const r = mejorReparto(mano, CONFIG.baraja);
  const sueltas = [...r.sueltas].sort((a, b) => valor(a) - valor(b));
  return [...r.combinaciones.flat(), ...sueltas].at(-1)!;
}

/**
 * Busca una semilla en la que, robando siempre del mazo y descartando como la UI, el humano
 * pueda cerrar en sus primeros turnos. Devuelve el turno y la carta con la que cierra.
 */
function semillaParaCerrar() {
  for (let i = 0; i < 500; i++) {
    const semilla = `cierre-${i}`;
    const r = chinchon.crear(CONFIG, semilla);
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    for (let turnoHumano = 0, pasos = 0; pasos < 60 && chinchon.resultado(e) === null; pasos++) {
      const legales = chinchon.accionesLegales(e, e.turno);
      if (e.turno !== 0) {
        const d = iaChinchonBasica.decidir(chinchon.vistaDe(e, e.turno), legales, crearAzar('x'));
        e = (aplicar(chinchon, e, e.turno, d.accion) as { valor: typeof e }).valor;
        if (e.resultadosManos.length > 0) break;
        continue;
      }
      if (e.fase === 'robar') {
        e = (aplicar(chinchon, e, 0, { tipo: 'robar', desde: 'mazo' }) as { valor: typeof e })
          .valor;
        continue;
      }
      const cierre = legales.find((a) => a.tipo === 'cerrar');
      if (cierre && cierre.tipo === 'cerrar')
        return { semilla, turno: turnoHumano, carta: cierre.carta };
      const carta = ultimaOrdenada(e.manos[0]!);
      e = (aplicar(chinchon, e, 0, { tipo: 'descartar', carta }) as { valor: typeof e }).valor;
      turnoHumano++;
    }
  }
  throw new Error('Ninguna semilla de prueba permite cerrar pronto');
}

/** Espera a que sea el turno del humano (o termine la mano o la partida) y dice qué toca. */
async function esperarTurno(page: Page): Promise<'robar' | 'descartar' | 'panel' | 'fin'> {
  await page
    .locator(
      '[data-testid="mazo"].robable, .carta-mano.jugable, [data-testid="panel-mano"], [data-testid="fin"]',
    )
    .first()
    .waitFor();
  if (await page.getByTestId('fin').isVisible()) return 'fin';
  if (await page.getByTestId('panel-mano').isVisible()) return 'panel';
  if ((await page.locator('[data-testid="mazo"].robable').count()) > 0) return 'robar';
  return 'descartar';
}

/** Juega la partida entera: roba del mazo, cierra si puede con la última carta o la descarta. */
async function jugarChinchon(page: Page) {
  for (let pasos = 0; pasos < 1_500; pasos++) {
    const fase = await esperarTurno(page);
    if (fase === 'fin') return;
    if (fase === 'panel') {
      await expect(page.getByTestId('panel-mano').getByTestId('quien-cierra')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
    } else if (fase === 'robar') {
      await page.getByTestId('mazo').click();
    } else {
      await page.locator('.carta-mano.jugable').last().click(ESQUINA);
      const cerrar = page.getByTestId('cerrar');
      if (await cerrar.isEnabled()) await cerrar.click();
      else await page.getByTestId('descartar').click();
    }
  }
  throw new Error('La partida de Chinchón no terminó');
}

// ── Partidas completas ───────────────────────────────────────────────────────

test('partida de Chinchón completa contra la IA con 2 jugadores', async ({ page }) => {
  await empezarChinchon(page, 'rapido&semilla=chinchon-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(7);
  await jugarChinchon(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido|Empate/);
  await expect(fin).toContainText('Clasificación');
});

test('partida de Chinchón completa con 4 jugadores', async ({ page }) => {
  await empezarChinchon(page, 'rapido&semilla=chinchon4-e2e', 4);
  await expect(page.locator('.carta-mano')).toHaveCount(7);
  await jugarChinchon(page);
  await expect(page.getByTestId('fin')).toContainText('Clasificación');
});

// ── Robar, descartar y cerrar desde la mesa ──────────────────────────────────

test('robar del descarte arrastrando y descartar arrastrando', async ({ page }) => {
  // A velocidad normal, para que la IA no se lleve la carta descartada antes de comprobarla.
  await empezarChinchon(page, 'semilla=arrastres');
  const descarte = page.getByTestId('descarte');
  const arriba = await descarte.locator('[data-carta]').getAttribute('data-carta');

  // Arrastrar la carta del descarte a la mano.
  const desde = (await descarte.boundingBox())!;
  const mano = (await page.getByTestId('mano').boundingBox())!;
  await page.mouse.move(desde.x + desde.width / 2, desde.y + desde.height / 2);
  await page.mouse.down();
  await page.mouse.move(mano.x + mano.width / 2, mano.y + mano.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect(page.locator('.carta-mano')).toHaveCount(8);
  await expect(page.getByTestId(`mano-${arriba}`)).toBeVisible();
  await expect(page.getByTestId('turno')).toHaveText('Descarta una carta o cierra');
  // La robada del descarte no se puede devolver.
  await expect(page.getByTestId(`mano-${arriba}`)).not.toHaveClass(/jugable/);

  // Arrastrar otra carta al descarte.
  const carta = page.locator('.carta-mano.jugable').first();
  const id = await carta.getAttribute('data-carta');
  const caja = (await carta.boundingBox())!;
  const destino = (await descarte.boundingBox())!;
  await page.mouse.move(caja.x + 8, caja.y + 8);
  await page.mouse.down();
  await page.mouse.move(destino.x + destino.width / 2, destino.y + destino.height / 2, {
    steps: 10,
  });
  await page.mouse.up();
  await expect(page.locator('.carta-mano')).toHaveCount(7);
  await expect(descarte.locator(`[data-carta="${id}"]`)).toBeVisible();
});

test('cerrar desde la mesa', async ({ page }) => {
  const { semilla, turno, carta } = semillaParaCerrar();
  await empezarChinchon(page, `rapido&semilla=${semilla}`);
  for (let t = 0; t <= turno;) {
    const fase = await esperarTurno(page);
    if (fase === 'robar') {
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
  await cerrar.click();
  const panel = page.getByTestId('panel-mano');
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId('quien-cierra')).toContainText(/Has cerrado tú|¡Chinchón!/);
  await page.screenshot({ path: `test-results/chinchon-panel-${page.viewportSize()!.width}.png` });
});

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test('la mesa del Chinchón entra en 360 × 640 con 8 cartas en la mano', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  for (const jugadores of [2, 4]) {
    await empezarChinchon(page, 'semilla=pequena', jugadores);
    await page.getByTestId('mazo').click();
    await expect(page.locator('.carta-mano')).toHaveCount(8);
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    const cartas = page.locator('.carta-mano');
    for (let i = 0; i < 8; i++) {
      const caja = (await cartas.nth(i).boundingBox())!;
      expect(caja.width).toBeGreaterThanOrEqual(40);
      expect(caja.x + caja.width).toBeLessThanOrEqual(anchos.ventana);
      await expect(cartas.nth(i).getByRole('img')).toHaveAttribute('aria-label', /\S/);
    }
    await page.screenshot({ path: `test-results/chinchon${jugadores}-360.png` });
  }
});
