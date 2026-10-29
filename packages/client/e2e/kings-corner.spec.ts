import { expect, test, type Page } from '@playwright/test';
import {
  CONFIG_KINGS_CORNER_POR_DEFECTO,
  kingsCorner,
  type EstadoKingsCorner,
} from '@juegos/engine';

async function empezar(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-kingsCorner').click();
  if (jugadores !== undefined) {
    await page.getByRole('radio', { name: `${jugadores} jugadores` }).check();
  }
  await page.getByTestId('empezar').click();
}

function crear(semilla: string): EstadoKingsCorner {
  const r = kingsCorner.crear(CONFIG_KINGS_CORNER_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** La primera semilla con una acción del tipo dado al empezar (juega primero el jugador). */
function semillaCon(prefijo: string, tipo: 'jugar-pila' | 'esquina' | 'mover'): string {
  for (let i = 0; i < 500; i++) {
    const e = crear(`${prefijo}-${i}`);
    const ok = kingsCorner
      .accionesLegales(e, 0)
      .some((a) =>
        tipo === 'mover'
          ? a.tipo === 'mover'
          : a.tipo === 'jugar' &&
            (tipo === 'esquina' ? a.pila >= 4 : a.pila < 4 && e.pilas[a.pila]!.length > 0),
      );
    if (ok) return `${prefijo}-${i}`;
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');

// ── Jugar, esquina, mover y pasar ────────────────────────────────────────────

test('jugar una carta sobre una pila', async ({ page }) => {
  const semilla = semillaCon('pila', 'jugar-pila');
  const e = crear(semilla);
  const accion = kingsCorner
    .accionesLegales(e, 0)
    .find((a) => a.tipo === 'jugar' && a.pila < 4 && e.pilas[a.pila]!.length > 0)!;
  if (accion.tipo !== 'jugar') throw new Error('no es jugar');
  await empezar(page, `semilla=${semilla}`);
  await expect(mano(page)).toHaveCount(8);
  await page.screenshot({ path: `test-results/kings-mesa-${page.viewportSize()!.width}.png` });
  await page.getByTestId(`mano-${accion.carta}`).first().click();
  const pila = page.getByTestId(`pila-${accion.pila}`);
  await expect(pila).toHaveClass(/destino/);
  await pila.click();
  await expect(mano(page)).toHaveCount(7);
  await expect(pila).toHaveAttribute('data-cartas', '2');
});

test('poner un K en una esquina', async ({ page }) => {
  const semilla = semillaCon('esquina', 'esquina');
  const e = crear(semilla);
  const rey = e.manos[0]!.find((c) => c.endsWith('-13'))!;
  await empezar(page, `semilla=${semilla}`);
  await page.getByTestId(`mano-${rey}`).first().click();
  await page.getByTestId('pila-4').click();
  await expect(page.getByTestId('pila-4')).toHaveAttribute('data-cartas', '1');
});

test('mover una pila deja un hueco', async ({ page }) => {
  const semilla = semillaCon('mover', 'mover');
  const accion = kingsCorner.accionesLegales(crear(semilla), 0).find((a) => a.tipo === 'mover')!;
  if (accion.tipo !== 'mover') throw new Error('no es mover');
  await empezar(page, `semilla=${semilla}`);
  await page.getByTestId(`pila-${accion.desde}`).click();
  await page.getByTestId(`pila-${accion.a}`).click();
  await expect(page.getByTestId(`pila-${accion.desde}`)).toHaveAttribute('data-cartas', '0');
});

test('pasar: juega el rival y vuelve a tocarle al jugador', async ({ page }) => {
  await empezar(page, 'semilla=kings-pasar');
  await expect(mano(page)).toHaveCount(8);
  await page.getByTestId('pasar').click();
  await expect(page.getByTestId('turno')).toContainText('Tu turno', { timeout: 30_000 });
  await expect(mano(page)).toHaveCount(9);
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Kings in the Corner completa contra la IA', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=kings-completa');
  const fin = page.getByTestId('fin');
  for (let paso = 0; paso < 2_000; paso++) {
    await page
      .locator('[data-testid="fin"], [data-testid="pasar"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    // Juega la primera carta jugable en su primer destino; si no hay, pasa.
    const jugable = mano(page).and(page.locator('.jugable')).first();
    if ((await jugable.count()) > 0) {
      await jugable.click().catch(() => {});
      const destino = page.locator('.pila.destino').first();
      if ((await destino.count()) > 0) {
        await destino.click().catch(() => {});
        continue;
      }
    }
    await page
      .getByTestId('pasar')
      .click({ timeout: 2_000 })
      .catch(() => {});
  }
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('cartas-fin')).toBeVisible();
  await page.screenshot({ path: `test-results/kings-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Kings in the Corner se continúa igual', async ({ page }) => {
  await empezar(page, 'semilla=kings-retomar');
  await expect(mano(page)).toHaveCount(8);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(8);
  const despues = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')),
  );
  expect(despues).toEqual(antes);
});

test('Kings in the Corner con 4 jugadores entra en 360 × 640 sin scroll horizontal', async ({
  page,
}) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena', 4);
  await expect(page.locator('.rival')).toHaveCount(3);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await page.screenshot({ path: 'test-results/kings-360.png' });
  await expect(mano(page).last()).toBeInViewport();
});
