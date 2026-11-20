import { expect, test, type Page } from '@playwright/test';
import {
  crearAzar,
  CONFIG_SIETE_Y_MEDIA_POR_DEFECTO,
  iaSieteYMediaBasica,
  sieteYMedia,
  type EstadoSieteYMedia,
} from '@juegos/engine';
import { abrirJuego } from './menu';

async function empezar(page: Page, query: string, jugadores = 2) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'sieteYMedia');
  await page.getByLabel(`${jugadores} jugadores`).check();
  await page.getByLabel('5 manos').check();
  await page.getByTestId('empezar').click();
}

/** Valor de la jugada propia que muestra la mesa («5,5» → 5,5). */
async function miValor(page: Page): Promise<number> {
  const texto = await page.getByTestId('mi-valor').innerText();
  return Number(texto.replace(',', '.'));
}

/** Juega la partida: apuesta lo que propone la mesa, pide con menos de 5 y se planta con 5. */
async function jugar(page: Page) {
  for (let pasos = 0; pasos < 500; pasos++) {
    await page
      .locator(
        '[data-testid="apostar"], [data-testid="plantarse"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor();
    if (await page.getByTestId('fin').isVisible()) return;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resultado-0')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('apostar').isVisible()) {
      await page.getByTestId('apostar').click();
    } else {
      const pedir = page.getByTestId('pedir');
      if ((await miValor(page)) < 5 && (await pedir.isEnabled())) await pedir.click();
      else await page.getByTestId('plantarse').click();
    }
  }
  throw new Error('La partida de Siete y media no terminó');
}

// ── Partidas completas ───────────────────────────────────────────────────────

test('partida de Siete y media completa contra la IA con 2 jugadores', async ({ page }) => {
  await empezar(page, 'rapido&semilla=syd-e2e');
  await expect(page.getByTestId('banca')).toHaveText('Tú');
  await jugar(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido|Empate/);
  await expect(fin).toContainText('Fichas finales');
});

test('partida de Siete y media completa con 4 jugadores', async ({ page }) => {
  await empezar(page, 'rapido&semilla=syd4-e2e', 4);
  await jugar(page);
  await expect(page.getByTestId('fin')).toContainText('Fichas finales');
});

// ── Apostar, pedir y plantarse ───────────────────────────────────────────────

test('apostar, pedir y plantarse desde la mesa', async ({ page }) => {
  await empezar(page, 'rapido&semilla=turno');
  // En la primera mano el humano es la banca: espera a la segunda, en la que apuesta.
  await jugarHastaApostar(page);
  await expect(page.getByTestId('apuesta')).toHaveText('5');
  await page.getByTestId('apuesta-mas').click();
  await page.getByTestId('apuesta-mas').click();
  await page.getByTestId('apuesta-menos').click();
  await expect(page.getByTestId('apuesta')).toHaveText('6');
  await page.getByTestId('apostar').click();
  await expect(page.getByTestId('mis-fichas')).toContainText('apuesta 6');

  await expect(page.getByTestId('plantarse')).toBeVisible();
  const cartas = page.locator('[data-testid^="mia-"]');
  await expect(cartas).toHaveCount(1);
  if (await page.getByTestId('pedir').isEnabled()) {
    await page.getByTestId('pedir').click();
    await expect(cartas).toHaveCount(2);
  }
  if (await page.getByTestId('plantarse').isVisible()) await page.getByTestId('plantarse').click();
  await expect(page.getByTestId('panel-mano')).toBeVisible();
  await expect(page.getByTestId('variacion-0')).toHaveText(/^[+-]?\d+$/);
});

async function jugarHastaApostar(page: Page) {
  for (let pasos = 0; pasos < 50; pasos++) {
    await page
      .locator('[data-testid="apostar"], [data-testid="plantarse"], [data-testid="panel-mano"]')
      .first()
      .waitFor();
    if (await page.getByTestId('panel-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('apostar').isVisible()) {
      return;
    } else {
      await page.getByTestId('plantarse').click();
    }
  }
  throw new Error('No llegó el turno de apostar');
}

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test('la mesa de la Siete y media entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  for (const jugadores of [2, 4]) {
    await empezar(page, 'rapido&semilla=pequena', jugadores);
    await jugarHastaApostar(page);
    await page.getByTestId('apostar').click();
    await expect(page.getByTestId('mi-valor')).toBeVisible();
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    await page.screenshot({ path: `test-results/siete-y-media${jugadores}-360.png` });
  }
});

// ── Pedir tapada ─────────────────────────────────────────────────────────────

/**
 * Una semilla de 2 jugadores, a 5 manos y con cartas tapadas, en la que el humano (banca en la
 * primera mano, que se planta) llega a la segunda como punto, apuesta 5 y pide tapada sin pasarse.
 */
function semillaTapada(): string {
  const config = { ...CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, manos: 5, tapadas: true };
  for (let i = 0; i < 500; i++) {
    const semilla = `tapada-${i}`;
    const r = sieteYMedia.crear(config, semilla);
    if (!r.ok) throw new Error(r.error);
    let e: EstadoSieteYMedia = r.valor;
    for (let pasos = 0; pasos < 50 && e.resultadosManos.length === 0; pasos++) {
      const accion =
        e.turno === 0
          ? ({ tipo: 'plantarse' } as const)
          : iaSieteYMediaBasica.decidir(
              sieteYMedia.vistaDe(e, 1),
              sieteYMedia.accionesLegales(e, 1),
              crearAzar('x'),
            ).accion;
      e = sieteYMedia.transicion(e, e.turno, accion);
    }
    if (e.banca !== 1 || e.turno !== 0) continue;
    e = sieteYMedia.transicion(e, 0, { tipo: 'apostar', fichas: Math.min(5, e.fichas[0]!) });
    const tras = sieteYMedia.transicion(e, 0, { tipo: 'pedirTapada' });
    if (tras.estados[0] === 'jugando') return semilla;
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

/** Le toca al jugador como punto (no como banca), con el botón de pedir tapada. */
async function esPuntoConTurno(page: Page) {
  return (
    (await page.getByTestId('pedir-tapada').isVisible()) &&
    (await page.getByTestId('banca').textContent())?.trim() !== 'Tú'
  );
}

async function empezarConTapadas(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'sieteYMedia');
  await page.getByLabel('2 jugadores').check();
  await page.getByLabel('5 manos').check();
  await page.getByTestId('opcion-tapadas').check();
  await page.getByTestId('empezar').click();
}

test('con cartas tapadas: pedir tapada deja la carta marcada y boca abajo para los demás', async ({
  page,
}) => {
  await empezarConTapadas(page, `rapido&semilla=${semillaTapada()}`);
  // En la primera mano el jugador es la banca: se planta cuando le toca.
  for (let i = 0; i < 30 && !(await esPuntoConTurno(page)); i++) {
    await page
      .locator('[data-testid="plantarse"], [data-testid="siguiente-mano"], [data-testid="apostar"]')
      .first()
      .waitFor({ timeout: 15_000 });
    if (await page.getByTestId('siguiente-mano').isVisible())
      await page.getByTestId('siguiente-mano').click();
    else if (await page.getByTestId('apostar').isVisible())
      await page.getByTestId('apostar').click();
    else if (!(await esPuntoConTurno(page))) await page.getByTestId('plantarse').click();
  }
  await expect(page.getByTestId('pedir')).toHaveText('Pedir destapada');
  await expect(page.locator('[data-testid^="tapada-"]')).toHaveCount(1);
  await page.getByTestId('pedir-tapada').click();
  await expect(page.locator('[data-testid^="tapada-"]')).toHaveCount(2);
  await expect(page.getByTestId('aviso')).toHaveText('Pides una carta tapada');
  await page.screenshot({ path: `test-results/siete-tapada-${page.viewportSize()!.width}.png` });
});

test('con cartas tapadas: partida completa contra la IA', async ({ page }) => {
  test.setTimeout(300_000);
  await empezarConTapadas(page, 'rapido&semilla=siete-tapadas-completa');
  for (let pasos = 0; pasos < 500; pasos++) {
    await page
      .locator(
        '[data-testid="apostar"], [data-testid="plantarse"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor();
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('apostar').isVisible()) {
      await page.getByTestId('apostar').click();
    } else {
      const tapada = page.getByTestId('pedir-tapada');
      if ((await miValor(page)) < 5 && (await tapada.isVisible()) && (await tapada.isEnabled())) {
        await tapada.click();
      } else await page.getByTestId('plantarse').click();
    }
  }
  await expect(page.getByTestId('fin')).toBeVisible();
});

test('con cartas tapadas, la mesa entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarConTapadas(page, `rapido&semilla=${semillaTapada()}`);
  for (let i = 0; i < 30 && !(await esPuntoConTurno(page)); i++) {
    await page
      .locator('[data-testid="plantarse"], [data-testid="siguiente-mano"], [data-testid="apostar"]')
      .first()
      .waitFor({ timeout: 15_000 });
    if (await page.getByTestId('siguiente-mano').isVisible())
      await page.getByTestId('siguiente-mano').click();
    else if (await page.getByTestId('apostar').isVisible())
      await page.getByTestId('apostar').click();
    else if (!(await esPuntoConTurno(page))) await page.getByTestId('plantarse').click();
  }
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (const id of ['pedir', 'pedir-tapada', 'plantarse'])
    await expect(page.getByTestId(id)).toBeInViewport();
  await page.screenshot({ path: 'test-results/siete-tapada-360-botones.png' });
});

// ── Doble con cualquier siete y media ────────────────────────────────────────

test('la casilla del doble con cualquier siete y media depende del pago doble y se juega la partida', async ({
  page,
}) => {
  await page.goto('./?rapido&semilla=doble-cualquiera');
  await abrirJuego(page, 'sieteYMedia');
  const cualquiera = page.getByTestId('opcion-doble-cualquiera');
  await expect(cualquiera).not.toBeChecked();
  await expect(cualquiera).toBeEnabled();
  await page.getByTestId('opcion-pago-doble').uncheck();
  await expect(cualquiera).toBeDisabled();
  await page.getByTestId('opcion-pago-doble').check();
  await cualquiera.check();
  await page.getByLabel('2 jugadores').check();
  await page.getByLabel('5 manos').check();
  await page.getByTestId('empezar').click();
  await jugar(page);
  await expect(page.getByTestId('fin')).toContainText('Fichas finales');
});
