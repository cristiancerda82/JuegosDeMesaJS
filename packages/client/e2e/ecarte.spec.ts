import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';
import {
  bazasEsperadasEcarte,
  CONFIG_ECARTE_POR_DEFECTO,
  ecarte,
  paloEcarte,
} from '@juegos/engine';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'ecarte');
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };
const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

/** Toca la primera carta que se puede jugar o descartar. */
async function tocarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

/** Una semilla en la que la IA normal (el que reparte) acepta la propuesta. */
function semillaAcepta() {
  for (let i = 0; i < 500; i++) {
    const semilla = `ecarte-acepta-${i}`;
    const r = ecarte.crear(CONFIG_ECARTE_POR_DEFECTO, semilla);
    if (!r.ok) throw new Error(r.error);
    if (bazasEsperadasEcarte(r.valor.manos[1]!, paloEcarte(r.valor.vuelta)) < 3) return semilla;
  }
  throw new Error('Ninguna semilla de prueba cumple la condición');
}

// ── Cambio ───────────────────────────────────────────────────────────────────

test('proponer, que la IA acepte y cambiar dos cartas', async ({ page }) => {
  await empezar(page, `semilla=${semillaAcepta()}`);
  await expect(mano(page)).toHaveCount(5);
  await expect(page.getByTestId('cartas-mazo')).toBeVisible();
  await page.screenshot({ path: `test-results/ecarte-cambio-${page.viewportSize()!.width}.png` });
  const antes = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')!),
  );
  await page.getByTestId('proponer').click();
  // La IA acepta: toca descartarse.
  await expect(jugables(page)).toHaveCount(5, { timeout: 30_000 });
  for (let i = 0; i < 2; i++) await tocarPrimera(page);
  await expect(mano(page)).toHaveCount(3);
  await expect(page.getByTestId('robar')).toHaveText('Cambiar 2');
  await page.getByTestId('robar').click();
  await expect(mano(page)).toHaveCount(5);
  const despues = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')!),
  );
  expect(despues.filter((c) => !antes.includes(c))).toHaveLength(2);
});

test('jugar de autoridad', async ({ page }) => {
  await empezar(page, 'semilla=ecarte-autoridad');
  await page.getByTestId('jugar').click();
  await expect(page.getByTestId('autoridad')).toContainText('Juegas de autoridad');
  await expect(jugables(page).first()).toBeVisible();
  await tocarPrimera(page);
  await expect(mano(page)).toHaveCount(4);
  await page.screenshot({ path: `test-results/ecarte-mesa-${page.viewportSize()!.width}.png` });
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Écarté completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=ecarte-completa');
  const fin = page.getByTestId('fin');
  let manos = 0;
  for (let paso = 0; paso < 2_000; paso++) {
    await page
      .locator(
        '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="jugar"], [data-testid="rehusar"], [data-testid="robar"], [data-testid="mano"] .carta-mano.jugable',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await expect(page.getByTestId('resumen-ecarte')).toBeVisible();
      if (manos++ === 0)
        await page.screenshot({
          path: `test-results/ecarte-resumen-${page.viewportSize()!.width}.png`,
        });
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    // Alterna: unas veces juega y otras propone; si le proponen, rehúsa una vez de cada dos.
    for (const id of [paso % 2 ? 'jugar' : 'proponer', 'aceptar', 'rehusar', 'robar']) {
      const b = page.getByTestId(id);
      if (await b.isVisible().catch(() => false)) {
        if (id === 'robar' && (await b.textContent())?.includes('No cambiar') === false) {
          await b.click({ timeout: 5_000 }).catch(() => {});
          break;
        }
        if (id !== 'robar') {
          await b.click({ timeout: 5_000 }).catch(() => {});
          break;
        }
      }
    }
    if (
      await jugables(page)
        .first()
        .isVisible()
        .catch(() => false)
    )
      await tocarPrimera(page).catch(() => {});
  }
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  const puntos = await Promise.all(
    [0, 1].map((i) => fin.getByTestId(`puntos-fin-${i}`).innerText().then(Number)),
  );
  expect(Math.max(...puntos)).toBeGreaterThanOrEqual(5);
  await page.screenshot({ path: `test-results/ecarte-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Écarté se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=ecarte-retomar');
  await expect(mano(page)).toHaveCount(5);
  const antes = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')!),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes)
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
});

test('el Écarté entra en 360 × 640 sin scroll horizontal, con los botones del cambio', async ({
  page,
}) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena');
  await expect(page.getByTestId('proponer')).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(page.getByTestId('asiento-1')).toBeVisible();
  await expect(page.getByTestId('proponer')).toBeInViewport({ ratio: 0.9 });
  await expect(page.getByTestId('jugar')).toBeInViewport({ ratio: 0.9 });
  await expect(mano(page).first()).toBeInViewport({ ratio: 0.9 });
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/ecarte-360.png' });
});
