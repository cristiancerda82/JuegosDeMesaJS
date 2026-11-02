import { expect, test, type Page } from '@playwright/test';
import {
  CONFIG_SCHAFKOPF_POR_DEFECTO,
  crearAzar,
  iaSchafkopfBasica,
  schafkopf,
  type EstadoSchafkopf,
} from '@juegos/engine';

async function empezarSchafkopf(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-schafkopf').click();
  await page.getByTestId('empezar').click();
}

/** Las cartas de la mano se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };

const cartasMano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');
const ids = (loc: ReturnType<typeof cartasMano>) =>
  loc.evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')!));

/**
 * Busca una semilla en la que el jugador puede llamar a un As y, tras hacerlo, la IA normal de
 * los otros tres pasa: así juega él el Rufspiel.
 */
function semillaRufspiel() {
  for (let i = 0; i < 500; i++) {
    const semilla = `schafkopf-ruf-${i}`;
    const r = schafkopf.crear(CONFIG_SCHAFKOPF_POR_DEFECTO, semilla);
    if (!r.ok) throw new Error(r.error);
    let e: EstadoSchafkopf = r.valor;
    const ruf = schafkopf
      .accionesLegales(e, 0)
      .find((a) => a.tipo === 'anunciar' && a.contrato.tipo === 'rufspiel');
    if (!ruf || ruf.tipo !== 'anunciar' || ruf.contrato.tipo !== 'rufspiel') continue;
    e = schafkopf.transicion(e, 0, ruf);
    while (e.fase === 'anuncio') {
      const a = iaSchafkopfBasica.decidir(
        schafkopf.vistaDe(e, e.turno),
        schafkopf.accionesLegales(e, e.turno),
        crearAzar('x'),
      ).accion;
      e = schafkopf.transicion(e, e.turno, a);
    }
    if (e.jugador === 0) return { semilla, palo: ruf.contrato.palo };
  }
  throw new Error('Ninguna semilla de prueba cumple la condición');
}

// ── Anunciar y jugar ─────────────────────────────────────────────────────────

test('anunciar un Rufspiel llamando a un As y salir con una carta', async ({ page }) => {
  const caso = semillaRufspiel();
  await empezarSchafkopf(page, `rapido&semilla=${caso.semilla}`);
  await expect(cartasMano(page)).toHaveCount(8);
  await expect(page.getByTestId('panel-anuncio')).toBeVisible();
  // Solo se puede anunciar lo permitido: el Solo siempre, y el As elegido.
  await expect(page.getByTestId(`rufspiel-${caso.palo}`)).toBeEnabled();
  await expect(page.getByTestId('solo-corazones')).toBeEnabled();
  await page.screenshot({
    path: `test-results/schafkopf-anuncio-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId(`rufspiel-${caso.palo}`).click();
  await expect(page.getByTestId('tipo-juego')).toContainText('Rufspiel', { timeout: 30_000 });
  // Tras el anuncio sale el jugador 0: todas sus cartas legales se pueden jugar.
  await jugables(page).first().waitFor({ timeout: 30_000 });
  const carta = (await jugables(page).first().getAttribute('data-carta'))!;
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
  await expect(cartasMano(page)).toHaveCount(7);
  await expect(page.locator(`[data-testid="mesa"] [data-carta="${carta}"]`)).toBeVisible();
  await page.screenshot({ path: `test-results/schafkopf-mesa-${page.viewportSize()!.width}.png` });
});

test('partida de Schafkopf completa contra la IA, con el resumen de cada mano', async ({
  page,
}) => {
  test.setTimeout(600_000);
  await empezarSchafkopf(page, 'rapido&semilla=schafkopf-completa');
  const fin = page.getByTestId('fin');
  let manos = 0;
  for (let paso = 0; paso < 3_000; paso++) {
    const algo = page.locator(
      '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="panel-anuncio"], [data-testid="mano"] .carta-mano.jugable',
    );
    await algo.first().waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      const resumen = page.getByTestId('resumen-schafkopf');
      await expect(resumen).toBeVisible();
      await expect(page.getByTestId('resumen-contrato')).toBeVisible();
      // Las fichas de la mano de los cuatro suman siempre 0.
      const fichas = await Promise.all(
        [0, 1, 2, 3].map((i) => resumen.getByTestId(`mano-${i}`).innerText()),
      );
      expect(fichas.map(Number).reduce((a, b) => a + b)).toBe(0);
      if (manos === 0)
        await page.screenshot({
          path: `test-results/schafkopf-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    if (await page.getByTestId('panel-anuncio').isVisible()) {
      await page
        .getByTestId('pasar')
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
  expect(manos).toBe(11);
  await expect(fin.getByTestId('fichas-fin-0')).toBeVisible();
  await page.screenshot({ path: `test-results/schafkopf-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Schafkopf se continúa con la misma mano', async ({ page }) => {
  await empezarSchafkopf(page, 'semilla=schafkopf-retomar');
  await expect(cartasMano(page)).toHaveCount(8);
  const antes = await ids(cartasMano(page));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(cartasMano(page)).toHaveCount(8);
  for (const c of antes)
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
});

test('el Schafkopf entra en 360 × 640 sin scroll horizontal, con el panel de anuncio', async ({
  page,
}) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarSchafkopf(page, 'semilla=pequena');
  await expect(page.getByTestId('panel-anuncio')).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await expect(page.getByTestId('pasar')).toBeInViewport({ ratio: 0.9 });
  await expect(page.getByTestId('solo-diamantes')).toBeInViewport({ ratio: 0.9 });
  await expect(cartasMano(page).first()).toBeInViewport({ ratio: 0.9 });
  await expect(cartasMano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/schafkopf-360.png' });
});
