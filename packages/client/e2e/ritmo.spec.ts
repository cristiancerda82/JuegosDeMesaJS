import { expect, test, type Page } from '@playwright/test';
import { brisca, CONFIG_BRISCA_POR_DEFECTO } from '@juegos/engine';
import { abrirJuego } from './menu';

// Velocidad de las jugadas (spec mesa-cliente, «Velocidad de las jugadas»).

/** Una semilla de Brisca en la que sale el jugador: así la IA responde a su primera carta. */
function semillaSaleElJugador(): string {
  for (let i = 0; i < 50; i++) {
    const semilla = `ritmo-${i}`;
    const r = brisca.crear(CONFIG_BRISCA_POR_DEFECTO, semilla);
    if (r.ok && brisca.vistaDe(r.valor, 0).turno === 0) return semilla;
  }
  throw new Error('Ninguna semilla de prueba deja salir al jugador');
}

const SEMILLA = semillaSaleElJugador();
const cartasEnMesa = (page: Page) => page.locator('[data-testid="mesa"] .jugada');

async function elegirVelocidad(page: Page, velocidad: string) {
  await page.getByTestId('velocidad').selectOption(velocidad);
}

/** Milisegundos desde que el jugador tira hasta que la IA responde, sin `?rapido`. */
async function esperaDeLaIA(page: Page, velocidad: string): Promise<number> {
  await page.goto(`./?semilla=${SEMILLA}`);
  await elegirVelocidad(page, velocidad);
  await abrirJuego(page, 'brisca');
  await page.getByTestId('empezar').click();
  await page.locator('.carta-mano.jugable').first().click();
  const desde = Date.now();
  await page.getByTestId('mesa').click();
  await expect(cartasEnMesa(page)).toHaveCount(2, { timeout: 10_000 });
  return Date.now() - desde;
}

test('con Normal la IA espera más antes de tirar que con Rápida', async ({ page }) => {
  const rapida = await esperaDeLaIA(page, 'rapida');
  const normal = await esperaDeLaIA(page, 'normal');
  // Rápida espera 750 ms y Normal el doble; se deja margen para la animación y la máquina.
  expect(normal).toBeGreaterThan(rapida + 450);
});

test('por defecto la velocidad es Normal y se recuerda al recargar', async ({ page }) => {
  await page.goto('./?rapido');
  await expect(page.getByTestId('velocidad')).toHaveValue('normal');
  await elegirVelocidad(page, 'pausada');
  await page.reload();
  await expect(page.getByTestId('velocidad')).toHaveValue('pausada');
});

test('con Pausada la baza se queda en la mesa hasta tocarla', async ({ page }) => {
  await page.goto(`./?rapido&semilla=${SEMILLA}`);
  await elegirVelocidad(page, 'pausada');
  await abrirJuego(page, 'brisca');
  await page.getByTestId('empezar').click();
  await page.locator('.carta-mano.jugable').first().click();
  await page.getByTestId('mesa').click();

  // La IA responde y la baza completa espera, aunque con ?rapido las pausas son mínimas.
  await expect(page.getByTestId('seguir')).toBeVisible();
  await expect(cartasEnMesa(page)).toHaveCount(2);
  await page.waitForTimeout(1500);
  await expect(cartasEnMesa(page)).toHaveCount(2);
  await expect(page.locator('.carta-mano.jugable')).toHaveCount(0);

  await page.getByTestId('mesa').click();
  await expect(page.getByTestId('seguir')).toBeHidden();
  await expect(cartasEnMesa(page)).not.toHaveCount(2);
});

test('la carta que acaba de tirar el rival queda marcada con su nombre', async ({ page }) => {
  await page.goto(`./?rapido&semilla=${SEMILLA}`);
  await elegirVelocidad(page, 'pausada');
  await abrirJuego(page, 'brisca');
  await page.getByTestId('empezar').click();
  await page.locator('.carta-mano.jugable').first().click();
  await page.getByTestId('mesa').click();
  await expect(page.getByTestId('ultima-jugada')).toHaveText('Rival');
});

test('se puede repasar la última baza hasta la primera carta de la siguiente', async ({ page }) => {
  await page.goto(`./?rapido&semilla=${SEMILLA}`);
  await abrirJuego(page, 'brisca');
  await page.getByTestId('empezar').click();
  await page.locator('.carta-mano.jugable').first().click();
  await page.getByTestId('mesa').click();

  // Recogida la baza, si sale el jugador la mesa queda vacía y se puede repasar.
  const repasar = page.getByTestId('ver-ultima-baza');
  await expect(repasar).toBeVisible();
  await repasar.click();
  await expect(cartasEnMesa(page)).toHaveCount(2);
  await expect(page.getByTestId('aviso')).toContainText('baza');
  await repasar.click();
  await expect(cartasEnMesa(page)).toHaveCount(0);
});
