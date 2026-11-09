import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';
import type { IdJuego } from '../src/sesion/juegos';

// Modo asistido (spec modo-asistido).

const ESQUINA = { position: { x: 8, y: 8 } };
const resaltadas = (page: Page) => page.locator('.pista-resaltada');

/** Abre las opciones del juego, activa el modo asistido y empieza. */
async function empezarAsistido(page: Page, juego: IdJuego, query = '') {
  await page.goto(`./?rapido${query}`);
  await abrirJuego(page, juego);
  await page.getByTestId('modo-asistido').check();
  await page.getByTestId('empezar').click();
}

test('Brisca: la sugerencia resalta una carta y explica por qué', async ({ page }) => {
  await empezarAsistido(page, 'brisca', '&semilla=asistida');
  const sugerencia = page.getByTestId('sugerencia');
  await expect(sugerencia).toContainText(/Juega .+: /);
  // Lo resaltado es una carta de la mano que se puede jugar.
  await expect(resaltadas(page).first()).toBeVisible();
  const carta = await resaltadas(page).first().getAttribute('data-carta');
  await expect(page.locator(`.carta-mano.jugable[data-carta="${carta}"]`)).toBeVisible();
  await page.screenshot({ path: `test-results/asistente-${page.viewportSize()!.width}.png` });
  // Con los avisos del asistente la mesa sigue cabiendo en la pantalla, sin scroll.
  const alto = await page.evaluate(() => [
    document.documentElement.scrollHeight,
    window.innerHeight,
  ]);
  expect(alto[0]).toBeLessThanOrEqual(alto[1]! + 2);
});

test('Brisca: se puede jugar otra carta y, si cuesta algo, se comenta', async ({ page }) => {
  await empezarAsistido(page, 'brisca', '&semilla=asistida');
  const comentario = page.getByTestId('comentario');
  for (let turno = 0; turno < 20; turno++) {
    await expect(page.getByTestId('sugerencia')).toBeVisible({ timeout: 15_000 });
    const sugerida = await resaltadas(page).first().getAttribute('data-carta');
    const otras = page.locator(`.carta-mano.jugable:not([data-carta="${sugerida}"])`);
    if ((await otras.count()) === 0) {
      await page.locator('.carta-mano.jugable').first().click(ESQUINA);
    } else {
      // La jugada libre se hace con normalidad.
      const otra = await otras.first().getAttribute('data-carta');
      await otras.first().click(ESQUINA);
      await page.getByTestId('mesa').click(ESQUINA);
      await expect(page.locator(`.carta-mano[data-carta="${otra}"]`)).toHaveCount(0);
    }
    if (await comentario.isVisible()) break;
    await page
      .getByTestId('mesa')
      .click(ESQUINA)
      .catch(() => {});
  }
  await expect(comentario).toContainText(/Con |Has /);
  // Se cierra al tocarlo.
  await comentario.click();
  await expect(comentario).toBeHidden();
});

test('Brisca: explica por qué ha jugado el rival, sin frenar la mesa', async ({ page }) => {
  await empezarAsistido(page, 'brisca', '&semilla=asistida');
  await page.evaluate(() => {
    const w = window as unknown as { largas: number[] };
    w.largas = [];
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) w.largas.push(e.duration);
    }).observe({ type: 'longtask' });
  });
  // Tras jugar el jugador, el rival juega y su lectura aparece con su nombre.
  const lectura = page.getByTestId('lectura').last();
  for (let i = 0; i < 4 && !(await lectura.isVisible()); i++) {
    await expect(page.getByTestId('sugerencia')).toBeVisible({ timeout: 15_000 });
    await resaltadas(page).first().click(ESQUINA);
    await page.getByTestId('mesa').click(ESQUINA);
    await page.waitForTimeout(800);
  }
  await expect(lectura).toContainText(/^Rival .+\./);
  // El asistente calcula en un worker: nada bloquea la página más de un fotograma largo.
  const largas = await page.evaluate(() => (window as unknown as { largas: number[] }).largas);
  expect(Math.max(0, ...largas)).toBeLessThan(150);
});

test('Siete y media: cuando conviene plantarse se resalta el botón «Plantarse»', async ({
  page,
}) => {
  await empezarAsistido(page, 'sieteYMedia', '&semilla=asistida');
  const plantarse = page.getByTestId('plantarse');
  for (let i = 0; i < 60; i++) {
    await expect(page.getByTestId('sugerencia')).toBeVisible({ timeout: 15_000 });
    if (
      await plantarse.evaluate((el) => el.classList.contains('pista-resaltada')).catch(() => false)
    ) {
      await expect(page.getByTestId('sugerencia')).toContainText('Plántate');
      return;
    }
    // Sigue la sugerencia hasta que toque plantarse.
    const boton = page.locator('button.pista-resaltada').first();
    if (await boton.count()) await boton.click();
    else await page.getByTestId('siguiente-mano').click();
  }
  throw new Error('La sugerencia nunca fue plantarse');
});

test('Tute subastado: el consejo de la subasta sale la primera vez y no vuelve', async ({
  page,
}) => {
  await empezarAsistido(page, 'tuteSubastado', '&semilla=asistida');
  // El primer consejo es el de la fase a la que se llega antes: si es la subasta, se ve ya.
  const consejo = page.getByTestId('consejo');
  await expect(consejo).toBeVisible();
  for (let i = 0; i < 10 && !(await consejo.textContent())?.includes('Subasta'); i++) {
    await page.getByTestId('cerrar-consejo').click();
    await page.getByTestId('pasar').click();
  }
  await expect(consejo).toContainText('Subasta');
  await expect(consejo).toContainText('pujar');
  await page.getByTestId('cerrar-consejo').click();
  await expect(consejo).toBeHidden();
  // Pujar y seguir en la subasta no lo vuelve a sacar.
  await page.locator('[data-accion="pujar"], [data-testid="pasar"]').first().click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId('consejo').filter({ hasText: 'Subasta' })).toHaveCount(0);
});

test('la opción se recuerda y se puede apagar desde la mesa', async ({ page }) => {
  await empezarAsistido(page, 'mus');
  await page.getByTestId('volver-menu').click();
  await abrirJuego(page, 'mus');
  await expect(page.getByTestId('modo-asistido')).toBeChecked();
  await page.getByTestId('empezar').click();

  const interruptor = page.getByTestId('alternar-asistido');
  await expect(interruptor).toHaveAttribute('aria-pressed', 'true');
  await interruptor.click();
  await expect(interruptor).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('sugerencia')).toHaveCount(0);
  await expect(resaltadas(page)).toHaveCount(0);
});

test('sin modo asistido por defecto, en los solitarios ni en red', async ({ page }) => {
  await page.goto('./?rapido');
  await abrirJuego(page, 'brisca');
  await expect(page.getByTestId('modo-asistido')).not.toBeChecked();
  await page.getByTestId('empezar').click();
  await expect(page.getByTestId('alternar-asistido')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('sugerencia')).toHaveCount(0);

  await page.getByTestId('volver-menu').click();
  await abrirJuego(page, 'klondike');
  await expect(page.getByTestId('modo-asistido')).toHaveCount(0);

  await page.goto('./?rapido');
  await page.getByTestId('jugar-en-red').click();
  await page.getByTestId('nombre').fill('Ana');
  await page.getByTestId('crear-sala').click();
  await page.getByTestId('red-juego-brisca').click();
  await expect(page.getByTestId('nivel-ia')).toBeVisible();
  await expect(page.getByTestId('modo-asistido')).toHaveCount(0);
});
