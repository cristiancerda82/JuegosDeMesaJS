import { expect, test, type Page } from '@playwright/test';
import type { AccionKlondike } from '@juegos/engine';
import { jugarKlondike, solucionarKlondike } from './klondike-solucion';

const CLAVE = 'juegos-de-mesa/estadisticas';

/** Estadísticas de un juego con valores por defecto. */
const juego = (parcial: Record<string, number | null> = {}) => ({
  jugadas: 1,
  ganadas: 1,
  empatadas: 0,
  perdidas: 0,
  racha: 1,
  mejorRacha: 1,
  mejorTiempoMs: null,
  menosMovimientos: null,
  ...parcial,
});

/** Deja guardadas unas estadísticas antes de empezar. */
async function sembrar(page: Page, juegos: Record<string, unknown>) {
  await page.goto('./?rapido');
  await page.evaluate(
    ([clave, datos]) => localStorage.setItem(clave as string, JSON.stringify(datos)),
    [CLAVE, { version: 1, juegos }] as const,
  );
}

async function abrirEstadisticas(page: Page) {
  await page.goto('./?rapido');
  await page.getByTestId('ver-estadisticas').click();
}

// ── Ganar un solitario ───────────────────────────────────────────────────────

test('ganar un Klondike registra la partida y sus récords, una sola vez', async ({ page }) => {
  let semilla = '';
  let solucion: AccionKlondike[] | null = null;
  for (let i = 1; solucion === null && i <= 30; i++) {
    semilla = `e2e-${i}`;
    solucion = solucionarKlondike(semilla, undefined, 60_000);
  }
  expect(solucion, 'ninguna semilla de prueba tiene solución').not.toBeNull();

  // Una victoria anterior, más lenta y con más movimientos.
  await sembrar(page, {
    klondike: juego({ mejorTiempoMs: 99_000_000, menosMovimientos: 9_999 }),
  });
  await page.goto(`./?rapido&semilla=${semilla}`);
  await page.getByTestId('juego-klondike').click();
  await page.getByTestId('empezar').click();
  await jugarKlondike(page, semilla, solucion!);

  const fin = page.getByTestId('fin');
  await expect(fin).toContainText('¡Solitario completado!');
  await expect(fin.getByTestId('racha-en-curso')).toHaveText('Llevas 2 victorias seguidas');
  await expect(fin.getByTestId('record-tiempo')).toBeVisible();
  await expect(fin.getByTestId('record-movimientos')).toBeVisible();
  const movimientos = await page.getByTestId('movimientos').textContent();

  // Recargar la página no vuelve a registrar la partida.
  await page.reload();
  await abrirEstadisticas(page);
  const tarjeta = page.getByTestId('estadisticas-klondike');
  await expect(tarjeta.getByTestId('jugadas')).toHaveText('2');
  await expect(tarjeta.getByTestId('ganadas')).toHaveText('2');
  await expect(tarjeta.getByTestId('porcentaje')).toHaveText('100 %');
  await expect(tarjeta.getByTestId('racha')).toHaveText('2');
  await expect(tarjeta.getByTestId('menos-movimientos')).toHaveText(movimientos!);
  await expect(tarjeta.getByTestId('mejor-tiempo')).toBeVisible();
});

// ── Abandonar y borrar ───────────────────────────────────────────────────────

test('abandonar un solitario cuenta como perdida y corta la racha; borrar lo vacía todo', async ({
  page,
}) => {
  await sembrar(page, { spider: juego({ jugadas: 3, ganadas: 3, racha: 3, mejorRacha: 3 }) });
  await page.goto('./?rapido&semilla=abandono');
  await page.getByTestId('juego-spider').click();
  await page.getByTestId('empezar').click();
  page.on('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Abandonar' }).click();
  await expect(page.getByTestId('fin')).toContainText('Partida abandonada');
  await expect(page.getByTestId('novedades')).toHaveCount(0);

  await page.getByRole('button', { name: 'Volver al menú' }).click();
  await page.getByTestId('ver-estadisticas').click();
  const tarjeta = page.getByTestId('estadisticas-spider');
  await expect(tarjeta.getByTestId('jugadas')).toHaveText('4');
  await expect(tarjeta.getByTestId('perdidas')).toHaveText('1');
  await expect(tarjeta.getByTestId('racha')).toHaveText('0');
  await expect(tarjeta.getByTestId('mejor-racha')).toHaveText('3');
  await expect(page.getByTestId('total')).toContainText('4 partidas terminadas, 3 ganadas (75 %)');

  await page.getByTestId('borrar-estadisticas').click();
  await expect(page.getByTestId('sin-estadisticas')).toBeVisible();
  await page.getByTestId('volver').click();
  await expect(page.getByTestId('ver-estadisticas')).toBeVisible();
});

test('datos dañados: la pantalla se abre vacía', async ({ page }) => {
  await page.goto('./?rapido');
  await page.evaluate((clave) => localStorage.setItem(clave, '{roto'), CLAVE);
  await abrirEstadisticas(page);
  await expect(page.getByTestId('sin-estadisticas')).toBeVisible();
});

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test('la pantalla de estadísticas entra en 360 × 640', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await sembrar(page, {
    klondike: juego({ mejorTiempoMs: 245_000, menosMovimientos: 131 }),
    mus: juego({ jugadas: 12, ganadas: 7, perdidas: 5, racha: 2, mejorRacha: 4 }),
    corazones: juego({ jugadas: 5, ganadas: 1, empatadas: 1, perdidas: 3, racha: 0 }),
  });
  await abrirEstadisticas(page);
  await expect(page.locator('[data-testid^="estadisticas-"]')).toHaveCount(3);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await page.screenshot({ path: 'test-results/estadisticas-360.png', fullPage: true });
});
