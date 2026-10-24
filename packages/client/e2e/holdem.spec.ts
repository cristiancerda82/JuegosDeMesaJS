import { expect, test, type Page } from '@playwright/test';
import { crearAzar, holdem, iaHoldemBasica } from '@juegos/engine';

async function empezarHoldem(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-holdem').click();
  if (jugadores) await page.getByLabel(`${jugadores} jugadores`, { exact: true }).check();
  await page.getByTestId('empezar').click();
}

/** Espera a que le toque al jugador, termine la mano o la partida. */
async function esperar(page: Page) {
  await page
    .locator('[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="retirarse"]')
    .first()
    .waitFor({ timeout: 30_000 });
}

/** Una semilla de 2 jugadores en la que la IA normal iguala un all-in del humano antes del flop. */
function semillaConShowdown(): string {
  for (let i = 0; i < 300; i++) {
    const semilla = `showdown-${i}`;
    const r = holdem.crear({ jugadores: 2 }, semilla);
    if (!r.ok) throw new Error(r.error);
    const e = holdem.transicion(r.valor, 0, { tipo: 'subir', hasta: 100 });
    const d = iaHoldemBasica.decidir(
      holdem.vistaDe(e, 1),
      holdem.accionesLegales(e, 1),
      crearAzar('x'),
    );
    if (d.accion.tipo === 'igualar') return semilla;
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

// ── Igualar, subir, retirarse y showdown ─────────────────────────────────────

test('igualar la ciega grande', async ({ page }) => {
  await empezarHoldem(page, 'rapido&semilla=holdem-igualar', 2);
  await expect(page.locator('[data-testid="mano"] [data-carta]')).toHaveCount(2);
  await expect(page.getByTestId('igualar')).toHaveText('Igualar 1');
  await page.screenshot({ path: `test-results/holdem-mesa-${page.viewportSize()!.width}.png` });
  await page.getByTestId('igualar').click();
  await expect(page.getByTestId('apuesta-0')).toHaveText('apuesta 2');
  await expect(page.getByTestId('fichas-0')).toHaveText('98 fichas');
});

test('subir con el atajo del bote', async ({ page }) => {
  await empezarHoldem(page, 'rapido&semilla=holdem-bote', 2);
  await page.getByTestId('atajo-bote').click();
  // Antes del flop, con 1/2: igualar 1 y subir lo que hay en el bote (4) deja la apuesta en 6.
  await expect(page.getByTestId('subir')).toHaveText('Subir a 6');
  await page.getByTestId('subir').click();
  // La IA contesta enseguida: si sigue en la mano, le quedan 94 fichas; si se retira, gana el bote.
  await expect(async () => {
    const fichas = await page.getByTestId('fichas-0').textContent();
    const panel = await page.getByTestId('panel-mano').isVisible();
    expect(fichas === '94 fichas' || panel).toBe(true);
  }).toPass({ timeout: 10_000 });
});

test('retirarse da el bote al rival sin enseñar', async ({ page }) => {
  await empezarHoldem(page, 'rapido&semilla=holdem-retirarse', 2);
  await page.getByTestId('retirarse').click();
  const panel = page.getByTestId('panel-mano');
  await expect(panel).toBeVisible({ timeout: 30_000 });
  await expect(panel.getByTestId('sin-showdown')).toContainText('sin enseñar');
});

test('un all-in igualado acaba en showdown con las jugadas', async ({ page }) => {
  const semilla = semillaConShowdown();
  await empezarHoldem(page, `rapido&semilla=${semilla}`, 2);
  await page.getByTestId('atajo-allin').click();
  await expect(page.getByTestId('subir')).toHaveText('Subir a 100');
  await page.getByTestId('subir').click();
  const resumen = page.locator('[data-testid="panel-mano"], [data-testid="fin"]').first();
  await expect(resumen).toBeVisible({ timeout: 30_000 });
  await expect(resumen.getByTestId('jugada-0')).toBeVisible();
  await expect(resumen.getByTestId('jugada-1')).toBeVisible();
  await expect(page.getByTestId('comunes').locator('[data-carta]')).toHaveCount(5);
  await page.screenshot({ path: `test-results/holdem-showdown-${page.viewportSize()!.width}.png` });
});

test('partida de Texas Hold’em completa contra la IA', async ({ page }) => {
  test.setTimeout(300_000);
  await empezarHoldem(page, 'rapido&semilla=holdem-completa', 2);
  const fin = page.getByTestId('fin');
  for (let paso = 0; paso < 2_000; paso++) {
    await esperar(page);
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('subir').isVisible()) {
      await page.getByTestId('atajo-allin').click();
      await page.getByTestId('subir').click();
    } else if (await page.getByTestId('igualar').isVisible()) {
      await page.getByTestId('igualar').click();
    } else {
      await page.getByTestId('pasar').click();
    }
  }
  await expect(fin).toBeVisible();
  await expect(fin).toContainText('Clasificación');
  await expect(fin.getByTestId('posicion-0')).toBeVisible();
  await page.screenshot({ path: `test-results/holdem-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Texas Hold’em se continúa con la misma mano', async ({ page }) => {
  await empezarHoldem(page, 'semilla=holdem-retomar', 2);
  const antes = await page
    .locator('[data-testid="mano"] [data-carta]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) {
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
  }
});

test('el Texas Hold’em de 6 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarHoldem(page, 'rapido&semilla=pequena', 6);
  await esperar(page);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 5; a++) await expect(page.getByTestId(`puesto-${a}`)).toBeVisible();
  await page.screenshot({ path: 'test-results/holdem6-360.png' });
});
