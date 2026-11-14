import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezar(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'pokerCinco');
  if (jugadores) await page.getByTestId(`poker-cinco-jugadores-${jugadores}`).check();
  await page.getByTestId('empezar').click();
}

const mano = (page: Page) => page.locator('[data-testid="mano"] [data-carta]');

/** Espera a que le toque al jugador, termine la mano o la partida. */
async function esperar(page: Page) {
  await page
    .locator(
      '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="retirarse"], [data-testid="cambiar"]',
    )
    .first()
    .waitFor({ timeout: 30_000 });
}

/** Con 2 jugadores, el humano (botón) iguala, la IA pasa o sube, y se llega al descarte. */
async function hastaElDescarte(page: Page) {
  for (let i = 0; i < 20 && !(await page.getByTestId('cambiar').isVisible()); i++) {
    await esperar(page);
    if (await page.getByTestId('cambiar').isVisible()) break;
    if (await page.getByTestId('igualar').isVisible()) await page.getByTestId('igualar').click();
    else if (await page.getByTestId('pasar').isVisible()) await page.getByTestId('pasar').click();
  }
  await expect(page.getByTestId('cambiar')).toBeVisible();
}

// ── Apuestas y descarte ──────────────────────────────────────────────────────

test('igualar la ciega grande y cambiar dos cartas', async ({ page }) => {
  await empezar(page, 'rapido&semilla=poker-cambiar', 2);
  await expect(mano(page)).toHaveCount(5);
  await expect(page.getByTestId('igualar')).toHaveText('Igualar 1');
  await page.screenshot({
    path: `test-results/poker-cinco-mesa-${page.viewportSize()!.width}.png`,
  });
  await hastaElDescarte(page);
  await expect(page.getByTestId('fase')).toHaveText('Descarte');
  await expect(page.getByTestId('cambiar')).toHaveText('Servido');
  const cartas = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')!),
  );
  await page.getByTestId(`carta-${cartas[0]}`).click();
  await page.getByTestId(`carta-${cartas[1]}`).click();
  await expect(page.getByTestId('cambiar')).toHaveText('Cambiar 2 cartas');
  await page.screenshot({
    path: `test-results/poker-cinco-descarte-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId('cambiar').click();
  await expect(page.getByTestId('cambio-0')).toHaveText('Cambia 2');
  await expect(mano(page)).toHaveCount(5);
  for (const c of cartas.slice(0, 2))
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toHaveCount(0);
});

test('la cuarta carta solo se puede marcar si queda un As', async ({ page }) => {
  await empezar(page, 'rapido&semilla=poker-cuatro', 2);
  await hastaElDescarte(page);
  const cartas = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')!),
  );
  // Se marcan tres que no son As: la cuarta solo si la que queda es un As.
  const otras = cartas.filter((c) => !c.endsWith('-1'));
  for (const c of otras.slice(0, 3)) await page.getByTestId(`carta-${c}`).click();
  await expect(page.getByTestId('cambiar')).toHaveText('Cambiar 3 cartas');
  const resto = cartas.filter((c) => !otras.slice(0, 3).includes(c));
  for (const c of resto) {
    const queda = resto.find((x) => x !== c)!;
    if (queda.endsWith('-1')) await expect(page.getByTestId(`carta-${c}`)).toBeEnabled();
    else await expect(page.getByTestId(`carta-${c}`)).toBeDisabled();
  }
});

test('partida de Póker de cinco cartas completa contra la IA', async ({ page }) => {
  test.setTimeout(300_000);
  await empezar(page, 'rapido&semilla=poker-completa', 2);
  const fin = page.getByTestId('fin');
  for (let paso = 0; paso < 2_000; paso++) {
    await esperar(page);
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await expect(page.getByTestId('resumen-holdem')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('cambiar').isVisible()) {
      await page.getByTestId('cambiar').click();
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
  // La última mano se ve en la pantalla de fin; las anteriores, en su resumen.
  await expect(fin.getByTestId('resumen-holdem')).toBeVisible();
  await expect(fin.getByTestId('clasificacion-poker-cinco')).toBeVisible();
  await expect(fin.getByTestId('posicion-0')).toBeVisible();
  await page.screenshot({ path: `test-results/poker-cinco-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Póker de cinco cartas se continúa con la misma mano', async ({
  page,
}) => {
  await empezar(page, 'semilla=poker-retomar', 2);
  await expect(mano(page)).toHaveCount(5);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) {
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
  }
});

test('el Póker de cinco cartas de 6 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'rapido&semilla=poker-pequena', 6);
  await esperar(page);
  const sinScroll = async () => {
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  };
  await sinScroll();
  for (let a = 1; a <= 5; a++) await expect(page.getByTestId(`puesto-${a}`)).toBeVisible();
  await expect(mano(page).last()).toBeInViewport();
  await page.screenshot({ path: 'test-results/poker-cinco6-360.png' });
  // En el descarte, las cartas y el botón de cambiar también caben.
  for (let i = 0; i < 20 && !(await page.getByTestId('cambiar').isVisible()); i++) {
    await esperar(page);
    if (await page.getByTestId('siguiente-mano').isVisible())
      await page.getByTestId('siguiente-mano').click();
    else if (await page.getByTestId('igualar').isVisible())
      await page.getByTestId('igualar').click();
    else if (await page.getByTestId('pasar').isVisible()) await page.getByTestId('pasar').click();
  }
  await expect(page.getByTestId('cambiar')).toBeVisible();
  await sinScroll();
  await expect(page.getByTestId('cambiar')).toBeInViewport();
  await page.screenshot({ path: 'test-results/poker-cinco6-360-descarte.png' });
});
