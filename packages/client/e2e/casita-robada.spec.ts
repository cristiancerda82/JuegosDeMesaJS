import { expect, test, type Page } from '@playwright/test';
import {
  casitaRobada,
  crearAzar,
  iaCasitaRobadaBasica,
  numeroCasita,
  type EstadoCasitaRobada,
  type IdCarta,
} from '@juegos/engine';
import { abrirJuego } from './menu';

async function empezar(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'casitaRobada');
  if (jugadores) await page.getByTestId(`casita-jugadores-${jugadores}`).check();
  await page.getByTestId('empezar').click();
}

const mano = (page: Page) => page.locator('[data-testid="mano"] [data-carta]');

/** La primera carta de la mano del 0 que se lleva algo de la mesa, si la hay. */
function captura(e: EstadoCasitaRobada): IdCarta | null {
  return e.manos[0]!.find((c) => e.mesa.some((m) => numeroCasita(m) === numeroCasita(c))) ?? null;
}

/**
 * Una semilla de 2 jugadores en la que el humano se lleva cartas con su primera jugada, la IA
 * normal contesta, y en su segunda jugada el humano puede robar la casita de la IA.
 */
function semillaConRobo(): { semilla: string; primera: IdCarta; segunda: IdCarta } {
  for (let i = 0; i < 2_000; i++) {
    const semilla = `robo-${i}`;
    const r = casitaRobada.crear({ jugadores: 2 }, semilla);
    if (!r.ok) throw new Error(r.error);
    const primera = captura(r.valor);
    if (primera === null) continue;
    let e = casitaRobada.transicion(r.valor, 0, { tipo: 'jugar', carta: primera, robar: null });
    const ia = iaCasitaRobadaBasica.decidir(
      casitaRobada.vistaDe(e, 1),
      casitaRobada.accionesLegales(e, 1),
      crearAzar('x'),
    ).accion;
    e = casitaRobada.transicion(e, 1, ia);
    if (e.casitas[1]!.length === 0) continue;
    const robo = casitaRobada.accionesLegales(e, 0).find((a) => a.robar === 1);
    if (robo) return { semilla, primera, segunda: robo.carta };
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

// ── Llevarse y robar ─────────────────────────────────────────────────────────

test('llevarse las cartas de la mesa y robar la casita del rival', async ({ page }) => {
  const { semilla, primera, segunda } = semillaConRobo();
  await empezar(page, `rapido&semilla=${semilla}`, 2);
  await expect(mano(page)).toHaveCount(3);
  await expect(page.getByTestId('mesa').locator('[data-carta]')).toHaveCount(4);
  await page.screenshot({ path: `test-results/casita-mesa-${page.viewportSize()!.width}.png` });

  await page.getByTestId(`carta-${primera}`).click();
  await expect(page.getByTestId('cuenta-casita-0')).not.toHaveText('Vacía');
  await expect(page.getByTestId('casita-0').locator(`[data-carta="${primera}"]`)).toBeVisible();

  // Le toca otra vez cuando la IA ha jugado.
  await expect(page.getByTestId('turno')).toHaveText('Tu turno: juega una carta', {
    timeout: 15_000,
  });
  const suyas = await page.getByTestId('cuenta-casita-1').textContent();
  await page.getByTestId(`carta-${segunda}`).click();
  await expect(page.getByTestId('panel-robo')).toBeVisible();
  await expect(page.getByTestId('no-robar')).toBeVisible();
  await page.screenshot({ path: `test-results/casita-robo-${page.viewportSize()!.width}.png` });
  await page.getByTestId('robar-1').click();
  await expect(page.getByTestId('cuenta-casita-1')).toHaveText('Vacía');
  await expect(page.getByTestId('aviso')).toContainText('Robas la casita');
  expect(suyas).not.toBe('Vacía');
});

test('partida de Casita robada completa contra la IA', async ({ page }) => {
  test.setTimeout(300_000);
  await empezar(page, 'rapido&semilla=casita-completa', 3);
  const fin = page.getByTestId('fin');
  for (let paso = 0; paso < 500 && !(await fin.isVisible()); paso++) {
    await page
      .locator(
        '[data-testid="fin"], [data-testid="panel-robo"], [data-testid="mano"] button:enabled',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('panel-robo').isVisible()) {
      await page.locator('[data-testid^="robar-"]').first().click();
    } else {
      await page
        .locator('[data-testid="mano"] button:enabled')
        .first()
        .click()
        .catch(() => {});
    }
  }
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('cartas-casita')).toBeVisible();
  await expect(fin.locator('[data-testid^="cartas-fin-"]')).toHaveCount(3);
  await page.screenshot({ path: `test-results/casita-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Casita robada se continúa en el mismo punto', async ({ page }) => {
  await empezar(page, 'semilla=casita-retomar', 2);
  await expect(mano(page)).toHaveCount(3);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes)
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
});

test('la Casita robada de 4 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=casita-pequena', 4);
  await expect(mano(page)).toHaveCount(3);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (const a of [1, 2, 3]) await expect(page.getByTestId(`puesto-${a}`)).toBeInViewport();
  await expect(mano(page).last()).toBeInViewport();
  await page.screenshot({ path: 'test-results/casita4-360.png' });
});
