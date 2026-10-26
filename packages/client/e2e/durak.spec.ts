import { expect, test, type Page } from '@playwright/test';
import {
  CONFIG_DURAK_POR_DEFECTO,
  crearAzar,
  durak,
  iaDurakBasica,
  type EstadoDurak,
  type IdCarta,
} from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 8 } };

async function empezar(page: Page, query: string, jugadores = 2) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-durak').click();
  await page.getByLabel(`${jugadores} jugadores`, { exact: true }).check();
  await page.getByTestId('empezar').click();
}

function crear(semilla: string): EstadoDurak {
  const r = durak.crear(CONFIG_DURAK_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Lo que hace el rival (la IA normal, que es la básica y determinista) en su turno. */
function jugaRival(e: EstadoDurak): EstadoDurak {
  const v = durak.vistaDe(e, 1);
  const { accion } = iaDurakBasica.decidir(v, durak.accionesLegales(e, 1), crearAzar('x'));
  return durak.transicion(e, 1, accion);
}

/** Una semilla en la que ataca el rival y el jugador puede ganar su carta. */
function semillaDefensa(): string {
  for (let i = 0; i < 200; i++) {
    const e = crear(`defensa-${i}`);
    if (e.atacante !== 1) continue;
    const tras = jugaRival(e);
    if (durak.accionesLegales(tras, 0).some((a) => a.tipo === 'defender')) return `defensa-${i}`;
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

/** Una semilla y la carta con la que, atacando el jugador, podrá echar otra tras la defensa. */
function semillaEchar(): { semilla: string; carta: IdCarta } {
  for (let i = 0; i < 300; i++) {
    const semilla = `echar-${i}`;
    const e = crear(semilla);
    if (e.atacante !== 0) continue;
    for (const carta of e.manos[0]!) {
      const tras = jugaRival(durak.transicion(e, 0, { tipo: 'atacar', carta }));
      if (tras.turno === 0 && durak.accionesLegales(tras, 0).some((a) => a.tipo === 'pasar')) {
        return { semilla, carta };
      }
    }
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

async function jugarCarta(page: Page, carta: string) {
  await page.locator(`.carta-mano[data-carta="${carta}"]`).click(ESQUINA);
  await page.getByTestId('mesa').click();
}

// ── Atacar, defender, llevarse y pasar ───────────────────────────────────────

test('atacar, ver la defensa y pasar: la ronda va al descarte', async ({ page }) => {
  const { semilla, carta } = semillaEchar();
  await empezar(page, `semilla=${semilla}`);
  await expect(page.locator('.carta-mano')).toHaveCount(6);
  await expect(page.getByTestId('cartas-mazo')).toHaveText('24');
  await expect(page.getByTestId('triunfo')).toContainText('Triunfo');
  await expect(page.getByTestId('turno')).toHaveText('Atacas: juega una carta');
  await page.screenshot({ path: `test-results/durak-mesa-${page.viewportSize()!.width}.png` });

  await jugarCarta(page, carta);
  await expect(page.getByTestId('par-0').locator(`[data-carta="${carta}"]`)).toBeVisible();
  // El rival la gana y al jugador le toca echar o pasar.
  await expect(page.getByTestId('paso')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('par-0').locator('[data-carta]')).toHaveCount(2);
  await page.screenshot({ path: `test-results/durak-echar-${page.viewportSize()!.width}.png` });
  await page.getByTestId('paso').click();
  await expect(page.getByTestId('descarte')).toHaveText('Descarte: 2');
  await expect(page.locator('.carta-mano')).toHaveCount(6);
});

test('defender ganando la carta del rival', async ({ page }) => {
  await empezar(page, `semilla=${semillaDefensa()}`);
  await expect(page.getByTestId('tomar')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('turno')).toHaveText('Defiendes: gana la carta o llévatelas');
  const carta = (await page.locator('.carta-mano.jugable').first().getAttribute('data-carta'))!;
  await jugarCarta(page, carta);
  await expect(
    page
      .locator(`[data-testid="mesa"] [data-carta="${carta}"]`)
      .or(page.getByTestId('descarte').filter({ hasText: 'Descarte: 2' })),
  ).toBeVisible();
  await expect(page.locator(`.carta-mano[data-carta="${carta}"]`)).toHaveCount(0);
});

test('llevarse las cartas de la mesa', async ({ page }) => {
  await empezar(page, `semilla=${semillaDefensa()}`);
  await expect(page.getByTestId('tomar')).toBeVisible({ timeout: 15_000 });
  const ataque = (await page
    .getByTestId('par-0')
    .locator('[data-carta]')
    .getAttribute('data-carta'))!;
  await page.getByTestId('tomar').click();
  await expect(page.locator(`.carta-mano[data-carta="${ataque}"]`)).toBeVisible();
  await expect(page.locator('.carta-mano')).toHaveCount(7);
  await expect(page.getByTestId('par-0')).toHaveCount(0);
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Durak completa contra la IA', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=durak-completa', 3);
  for (let pasos = 0; pasos < 2_000; pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="tomar"], [data-testid="paso"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 60_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    const jugable = page.locator('.carta-mano.jugable').first();
    if (await jugable.isVisible()) {
      await jugable.click(ESQUINA).catch(() => {});
      await page
        .getByTestId('mesa')
        .click({ timeout: 2_000 })
        .catch(() => {});
    } else if (await page.getByTestId('paso').isVisible()) {
      await page
        .getByTestId('paso')
        .click({ timeout: 2_000 })
        .catch(() => {});
    } else {
      await page
        .getByTestId('tomar')
        .click({ timeout: 2_000 })
        .catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('quien-durak')).toHaveText(/durak/);
  await expect(fin).toContainText('Orden de salida');
  await page.screenshot({ path: `test-results/durak-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Durak se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=durak-retomar');
  await expect(page.locator('.carta-mano')).not.toHaveCount(0);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Durak de 6 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'rapido&semilla=pequena', 6);
  await page
    .locator('.carta-mano.jugable, [data-testid="tomar"], [data-testid="paso"]')
    .first()
    .waitFor({ timeout: 30_000 });
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 5; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await page.screenshot({ path: 'test-results/durak6-360.png' });
});
