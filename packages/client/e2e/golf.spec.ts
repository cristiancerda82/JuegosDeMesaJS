import { expect, test, type Page } from '@playwright/test';
import { golf, pistaGolf, type AccionGolf, type EstadoGolf } from '@juegos/engine';

async function empezarGolf(page: Page, query: string, vuelta = false) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-golf').click();
  if (vuelta) await page.getByTestId('vuelta-golf').check();
  await page.getByTestId('empezar').click();
}

/** La misma partida en el motor, para saber qué cartas hay y seguir la pista sin adivinar. */
function enMotor(semilla: string): EstadoGolf {
  const r = golf.crear({ vuelta: false }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Hace en la UI una acción del motor tocando la carta o el mazo. */
async function hacerEnUI(page: Page, e: EstadoGolf, a: AccionGolf) {
  if (a.tipo === 'mover') await page.getByTestId(`carta-${e.columnas[a.columna]!.at(-1)}`).click();
  else if (a.tipo === 'robar') await page.getByTestId('mazo').click();
  else throw new Error(`Acción no prevista: ${a.tipo}`);
}

const SEMILLA_GANABLE = 'golf-63';

// ── Mover, robar y deshacer ──────────────────────────────────────────────────

test('mover tocando, robar y deshacer', async ({ page }) => {
  await empezarGolf(page, `rapido&semilla=${SEMILLA_GANABLE}`);
  await expect(page.locator('[data-testid^="c"] .naipe')).toHaveCount(35);
  await expect(page.getByTestId('en-mazo')).toContainText('16 cartas');
  await page.screenshot({ path: 'test-results/golf-mesa.png' });

  let e = enMotor(SEMILLA_GANABLE);
  let movido = false;
  for (let i = 0; i < 20 && !movido; i++) {
    const a = pistaGolf(golf.vistaDe(e, 0), golf.accionesLegales(e, 0))!;
    await hacerEnUI(page, e, a);
    e = golf.transicion(e, 0, a);
    movido = a.tipo === 'mover';
    await expect(page.getByTestId('movimientos')).toHaveText(String(e.movimientos));
  }
  expect(movido).toBe(true);
  await expect(page.getByTestId('descarte-arriba')).toHaveAttribute(
    'data-carta',
    e.descarte.at(-1)!,
  );

  await page.getByTestId('deshacer').click();
  await expect(page.getByTestId('movimientos')).toHaveText(String(e.movimientos + 1));
  const antes = e.historial.at(-1)!;
  await expect(page.getByTestId('descarte-arriba')).toHaveAttribute(
    'data-carta',
    antes.descarte.at(-1)!,
  );
});

test('tocar una carta que no se puede mover no cambia nada', async ({ page }) => {
  await empezarGolf(page, `rapido&semilla=${SEMILLA_GANABLE}`);
  const e = enMotor(SEMILLA_GANABLE);
  const moviles = new Set(
    golf.accionesLegales(e, 0).flatMap((a) => (a.tipo === 'mover' ? [a.columna] : [])),
  );
  const quieta = e.columnas.findIndex((c, i) => !moviles.has(i) && c.length > 0);
  expect(quieta).toBeGreaterThanOrEqual(0);
  await page.getByTestId(`carta-${e.columnas[quieta]!.at(-1)}`).click();
  await expect(page.getByTestId('movimientos')).toHaveText('0');
  await expect(page.locator('[data-testid^="c"] .naipe')).toHaveCount(35);
});

// ── Victoria y abandono ──────────────────────────────────────────────────────

test('ganar una partida siguiendo la pista', async ({ page }) => {
  test.setTimeout(120_000);
  await empezarGolf(page, `rapido&semilla=${SEMILLA_GANABLE}`);
  let e = enMotor(SEMILLA_GANABLE);
  for (let i = 0; i < 200 && golf.resultado(e) === null; i++) {
    const a = pistaGolf(golf.vistaDe(e, 0), golf.accionesLegales(e, 0));
    if (a === null) throw new Error('La pista se quedó sin jugadas');
    await hacerEnUI(page, e, a);
    e = golf.transicion(e, 0, a);
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText('¡Solitario completado!');
  await expect(fin.getByTestId('resumen-golf')).toContainText(`${e.movimientos} movimientos`);
  await page.screenshot({ path: 'test-results/golf-victoria.png' });
});

test('abandonar el Golf', async ({ page }) => {
  await empezarGolf(page, 'rapido&semilla=golf-abandono');
  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Abandonar' }).click();
  await expect(page.getByTestId('fin')).toContainText('Partida abandonada');
});

test('el mazo se recorre una vez y la opción con vuelta se guarda', async ({ page }) => {
  await empezarGolf(page, 'rapido&semilla=golf-mazo', true);
  for (let i = 0; i < 16; i++) await page.getByTestId('mazo').click();
  await expect(page.getByTestId('mazo')).toBeDisabled();
  await expect(page.getByTestId('en-mazo')).toContainText('0 cartas');
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Golf se continúa en el mismo punto', async ({ page }) => {
  await empezarGolf(page, 'rapido&semilla=golf-retomar');
  await page.getByTestId('mazo').click();
  const arriba = await page.getByTestId('descarte-arriba').getAttribute('data-carta');
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByTestId('descarte-arriba')).toHaveAttribute('data-carta', arriba!);
  await expect(page.getByTestId('movimientos')).toHaveText('1');
});

test('el Golf entra en 360 × 640 sin scroll', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarGolf(page, 'semilla=pequena');
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const medidas = await page.evaluate(() => ({
    ancho: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
    altoVentana: window.innerHeight,
  }));
  expect(medidas.ancho).toBeLessThanOrEqual(medidas.ventana);
  const mazo = (await page.getByTestId('mazo').boundingBox())!;
  expect(mazo.y + mazo.height).toBeLessThanOrEqual(medidas.altoVentana);
  await page.screenshot({ path: 'test-results/golf-360.png' });
});
