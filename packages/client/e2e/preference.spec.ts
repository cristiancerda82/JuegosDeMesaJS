import { expect, test, type Page } from '@playwright/test';
import {
  CONFIG_PREFERENCE_POR_DEFECTO,
  crearAzar,
  iaPreferenceBasica,
  preference,
  type EstadoPreference,
  type PujaPreference,
} from '@juegos/engine';

async function empezarPreference(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-preference').click();
  await page.getByTestId('empezar').click();
}

/** Las cartas de la mano se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };

const cartasMano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

async function jugarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

const SEIS_CORAZONES: PujaPreference = { tipo: 'bazas', bazas: 6, palo: 'corazones' };

/** Busca una semilla en la que, si el jugador puja 6 de corazones, la IA normal pasa dos veces. */
function semillaSubasta() {
  for (let i = 0; i < 500; i++) {
    const semilla = `preference-puja-${i}`;
    const r = preference.crear(CONFIG_PREFERENCE_POR_DEFECTO, semilla);
    if (!r.ok) throw new Error(r.error);
    let e: EstadoPreference = preference.transicion(r.valor, 0, {
      tipo: 'pujar',
      puja: SEIS_CORAZONES,
    });
    while (e.fase === 'subasta' && e.turno !== 0) {
      const a = iaPreferenceBasica.decidir(
        preference.vistaDe(e, e.turno),
        preference.accionesLegales(e, e.turno),
        crearAzar('x'),
      ).accion;
      e = preference.transicion(e, e.turno, a);
    }
    if (e.fase === 'descarte' && e.juega === 0) return semilla;
  }
  throw new Error('Ninguna semilla de prueba cumple la condición');
}

// ── Subasta, descarte y contrato ─────────────────────────────────────────────

test('pujar, quedarse la viuda, descartar y declarar el contrato', async ({ page }) => {
  await empezarPreference(page, `rapido&semilla=${semillaSubasta()}`);
  await expect(cartasMano(page)).toHaveCount(10);
  await expect(page.getByTestId('subasta')).toBeVisible();
  await page.screenshot({
    path: `test-results/preference-subasta-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId('nivel-6').click();
  await page.getByTestId('puja-6-corazones').click();
  // Los otros pasan: se ve la viuda y el jugador tiene 12 cartas.
  await expect(page.getByTestId('viuda')).toBeVisible();
  await expect(cartasMano(page)).toHaveCount(12);
  await jugarPrimera(page);
  await expect(cartasMano(page)).toHaveCount(11);
  await jugarPrimera(page);
  await expect(cartasMano(page)).toHaveCount(10);
  // Declara el contrato: no puede bajar de su puja.
  await expect(page.getByTestId('subasta')).toBeVisible();
  await expect(page.getByTestId('puja-6-diamantes')).toBeDisabled();
  await page.getByTestId('puja-6-corazones').click();
  await expect(page.getByTestId('contrato-preference')).toContainText('6 de ♥ corazones');
  await page.screenshot({ path: `test-results/preference-mesa-${page.viewportSize()!.width}.png` });
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Préférence completa contra la IA, con el resumen de cada mano', async ({
  page,
}) => {
  test.setTimeout(900_000);
  await empezarPreference(page, 'rapido&semilla=preference-completa');
  const fin = page.getByTestId('fin');
  let manos = 0;
  for (let paso = 0; paso < 6_000; paso++) {
    await page
      .locator(
        '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="subasta"], [data-testid="panel-whist"], [data-testid="mano"] .carta-mano.jugable',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await expect(page.getByTestId('resumen-preference')).toBeVisible();
      if (manos === 0)
        await page.screenshot({
          path: `test-results/preference-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    if (await page.getByTestId('panel-whist').isVisible()) {
      await page
        .getByTestId('pasar-whist')
        .click({ timeout: 5_000 })
        .catch(() => {});
      continue;
    }
    if (await page.getByTestId('subasta').isVisible()) {
      const pasar = page.getByTestId('pasar');
      // En la subasta pasa; al declarar, la primera puja permitida.
      if (await pasar.isVisible()) await pasar.click({ timeout: 5_000 }).catch(() => {});
      else
        await page
          .locator('[data-testid="subasta"] .puja:enabled')
          .first()
          .click({ timeout: 5_000 })
          .catch(() => {});
      continue;
    }
    await jugables(page)
      .first()
      .click({ ...ESQUINA, timeout: 5_000 })
      .then(() => page.getByTestId('mesa').click({ timeout: 5_000 }))
      .catch(() => {});
  }
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin.getByTestId('cierre-preference')).toBeVisible();
  const saldos = await Promise.all(
    [0, 1, 2].map((i) => fin.getByTestId(`saldo-${i}`).innerText().then(Number)),
  );
  // Los saldos de los tres suman 0 (con el redondeo a un decimal).
  expect(Math.abs(saldos.reduce((a, b) => a + b, 0))).toBeLessThan(0.2);
  await page.screenshot({ path: `test-results/preference-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Préférence se continúa con la misma mano', async ({ page }) => {
  await empezarPreference(page, 'semilla=preference-retomar');
  await expect(cartasMano(page)).toHaveCount(10);
  const antes = await cartasMano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')!),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(cartasMano(page)).toHaveCount(10);
  for (const c of antes)
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
});

test('el Préférence entra en 360 × 640 sin scroll horizontal, con la subasta', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarPreference(page, 'semilla=pequena');
  await expect(page.getByTestId('subasta')).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 2; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await expect(page.getByTestId('pasar')).toBeInViewport({ ratio: 0.9 });
  await expect(page.getByTestId('puja-6-sin')).toBeInViewport({ ratio: 0.9 });
  await expect(cartasMano(page).first()).toBeInViewport({ ratio: 0.9 });
  await expect(cartasMano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/preference-360.png' });
});
