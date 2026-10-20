import { expect, test, type Page } from '@playwright/test';
import {
  piramide,
  pistaPiramide,
  type AccionPiramide,
  type EstadoPiramide,
  type IdCarta,
} from '@juegos/engine';

async function empezarPiramide(page: Page, query: string, pasadas?: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-piramide').click();
  if (pasadas) await page.getByLabel(pasadas, { exact: true }).check();
  await page.getByTestId('empezar').click();
}

/** La misma partida en el motor, para saber qué cartas hay y seguir la pista sin adivinar. */
function enMotor(semilla: string): EstadoPiramide {
  const r = piramide.crear({ pasadas: 3 }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Hace en la UI una acción del motor tocando las cartas o el mazo. */
async function hacerEnUI(page: Page, e: EstadoPiramide, a: AccionPiramide) {
  if (a.tipo === 'quitar') {
    for (const sitio of a.cartas) {
      if ('descarte' in sitio) await page.getByTestId('descarte-arriba').click();
      else await page.getByTestId(`carta-${e.piramide[sitio.piramide]}`).click();
    }
  } else if (a.tipo === 'robar' || a.tipo === 'reciclar') {
    await page.getByTestId('mazo').click();
  } else {
    throw new Error(`Acción no prevista: ${a.tipo}`);
  }
}

const valor = (c: IdCarta) => Number(c.split('-')[1]);

// ── Quitar, robar, deshacer ──────────────────────────────────────────────────

test('quitar una pareja, robar y deshacer', async ({ page }) => {
  const semilla = 'piramide-0';
  await empezarPiramide(page, `rapido&semilla=${semilla}`);
  await expect(page.locator('[data-testid="piramide"] .naipe')).toHaveCount(28);
  await expect(page.locator('[data-testid="piramide"] .naipe:not(.tapada)')).toHaveCount(7);
  await page.screenshot({ path: 'test-results/piramide-mesa.png' });

  // Roba hasta que haya algo que quitar, siguiendo la pista del motor.
  let e = enMotor(semilla);
  let quitado = false;
  for (let i = 0; i < 30 && !quitado; i++) {
    const a = pistaPiramide(piramide.vistaDe(e, 0), piramide.accionesLegales(e, 0))!;
    await hacerEnUI(page, e, a);
    e = piramide.transicion(e, 0, a);
    quitado = a.tipo === 'quitar';
    await expect(page.getByTestId('movimientos')).toHaveText(String(e.movimientos));
  }
  expect(quitado).toBe(true);
  const quedan = e.piramide.filter((c) => c !== null).length;
  await expect(page.locator('[data-testid="piramide"] .naipe')).toHaveCount(quedan);

  // Deshacer devuelve las cartas y suma un movimiento.
  const antes = e.historial.at(-1)!.piramide.filter((c) => c !== null).length;
  await page.getByTestId('deshacer').click();
  await expect(page.getByTestId('movimientos')).toHaveText(String(e.movimientos + 1));
  await expect(page.locator('[data-testid="piramide"] .naipe')).toHaveCount(antes);
});

test('dos cartas que no suman 13 no se quitan y queda elegida la segunda', async ({ page }) => {
  await empezarPiramide(page, 'rapido&semilla=piramide-0');
  const libres = (await page
    .locator('[data-testid="piramide"] .naipe:not(.tapada)')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')!))) as IdCarta[];
  // Dos libres que no suman 13 y ninguna es una K.
  let par: [IdCarta, IdCarta] | null = null;
  for (const x of libres) {
    for (const y of libres) {
      if (x !== y && valor(x) + valor(y) !== 13 && valor(x) !== 13 && valor(y) !== 13) par = [x, y];
    }
  }
  expect(par).not.toBeNull();
  await page.getByTestId(`carta-${par![0]}`).click();
  await expect(page.getByTestId(`carta-${par![0]}`)).toHaveClass(/seleccionada/);
  await page.getByTestId(`carta-${par![1]}`).click();
  await expect(page.getByTestId(`carta-${par![1]}`)).toHaveClass(/seleccionada/);
  await expect(page.getByTestId(`carta-${par![0]}`)).not.toHaveClass(/seleccionada/);
  await expect(page.getByTestId('movimientos')).toHaveText('0');
});

// ── Victoria, abandono y opciones ────────────────────────────────────────────

test('ganar una partida siguiendo la pista, con récord en el fin', async ({ page }) => {
  test.setTimeout(120_000);
  const semilla = 'piramide-0';
  // Un récord anterior peor: la primera victoria no cuenta como récord.
  await page.goto('./?rapido');
  await page.evaluate(() =>
    localStorage.setItem(
      'juegos-de-mesa/estadisticas',
      JSON.stringify({
        version: 1,
        juegos: {
          piramide: {
            jugadas: 1,
            ganadas: 1,
            empatadas: 0,
            perdidas: 0,
            racha: 1,
            mejorRacha: 1,
            mejorTiempoMs: 3_600_000,
            menosMovimientos: 999,
          },
        },
      }),
    ),
  );
  await empezarPiramide(page, `rapido&semilla=${semilla}`);
  let e = enMotor(semilla);
  for (let i = 0; i < 300 && piramide.resultado(e) === null; i++) {
    const a = pistaPiramide(piramide.vistaDe(e, 0), piramide.accionesLegales(e, 0));
    if (a === null) throw new Error('La pista se quedó sin jugadas');
    await hacerEnUI(page, e, a);
    e = piramide.transicion(e, 0, a);
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText('¡Solitario completado!');
  await expect(fin.getByTestId('resumen-piramide')).toContainText(`${e.movimientos} movimientos`);
  await expect(fin.getByTestId('record-movimientos')).toBeVisible();
  await page.screenshot({ path: 'test-results/piramide-victoria.png' });
});

test('abandonar la Pirámide', async ({ page }) => {
  await empezarPiramide(page, 'rapido&semilla=piramide-abandono');
  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Abandonar' }).click();
  await expect(page.getByTestId('fin')).toContainText('Partida abandonada');
});

test('con una pasada, el mazo vacío no se vuelve a usar', async ({ page }) => {
  await empezarPiramide(page, 'rapido&semilla=piramide-pasada', '1 pasada');
  for (let i = 0; i < 24; i++) await page.getByTestId('mazo').click();
  await expect(page.getByTestId('mazo')).toBeDisabled();
  await expect(page.getByTestId('vueltas')).toContainText('Quedan 0 vueltas');
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Pirámide se continúa en el mismo punto', async ({ page }) => {
  await empezarPiramide(page, 'rapido&semilla=piramide-retomar');
  await page.getByTestId('mazo').click();
  await page.getByTestId('mazo').click();
  const arriba = await page.getByTestId('descarte-arriba').getAttribute('data-carta');
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByTestId('descarte-arriba')).toHaveAttribute('data-carta', arriba!);
  await expect(page.getByTestId('movimientos')).toHaveText('2');
});

test('la Pirámide entra en 360 × 640 sin scroll', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarPiramide(page, 'semilla=pequena');
  await page.getByTestId('mazo').click();
  await page.getByTestId('mazo').click();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const medidas = await page.evaluate(() => ({
    ancho: document.documentElement.scrollWidth,
    alto: document.documentElement.scrollHeight,
    ventana: window.innerWidth,
    altoVentana: window.innerHeight,
  }));
  expect(medidas.ancho).toBeLessThanOrEqual(medidas.ventana);
  const mazo = (await page.getByTestId('mazo').boundingBox())!;
  expect(mazo.y + mazo.height).toBeLessThanOrEqual(medidas.altoVentana);
  await page.screenshot({ path: 'test-results/piramide-360.png' });
});
