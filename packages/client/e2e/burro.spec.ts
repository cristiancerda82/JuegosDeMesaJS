import { expect, test, type Page } from '@playwright/test';
import { burro, sonCuatroIguales, type EstadoBurro } from '@juegos/engine';

async function empezar(page: Page, query: string, jugadores?: 3 | 5) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-burro').click();
  if (jugadores) await page.getByLabel(`${jugadores} jugadores`).check();
  await page.getByTestId('empezar').click();
}

/** Primera semilla cuyo reparto cumple la condición, con 4 jugadores. */
function semillaDonde(prefijo: string, cumple: (e: EstadoBurro) => boolean): string {
  for (let i = 0; i < 20_000; i++) {
    const semilla = `${prefijo}-${i}`;
    const r = burro.crear({ jugadores: 4 }, semilla);
    if (r.ok && cumple(r.valor)) return semilla;
  }
  throw new Error('Ninguna semilla cumple la condición');
}

const nadieTieneCuatro = (e: EstadoBurro) => e.manos.every((m) => !sonCuatroIguales(m));

const manoPropia = (page: Page) =>
  page
    .getByTestId('asiento-0')
    .locator('[data-carta]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')!).sort());

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Burro completa contra la IA', async ({ page }) => {
  await empezar(page, 'rapido&semilla=burro-e2e');
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  let resumenes = 0;
  for (let paso = 0; paso < 4000 && !(await fin.isVisible()); paso++) {
    if (await panel.isVisible()) {
      await expect(page.getByTestId('siguiente-mano')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
      resumenes++;
      continue;
    }
    // Plantarse sin poder no hace nada: se intenta siempre antes de pasar una carta.
    await page
      .getByTestId('me-planto')
      .click({ timeout: 2000 })
      .catch(() => {});
    await page
      .locator('[data-testid="asiento-0"] [data-carta]')
      .first()
      .click({ timeout: 2000 })
      .catch(() => {});
  }
  await expect(fin).toBeVisible();
  expect(resumenes).toBeGreaterThan(0);
  await expect(fin).toContainText(/¡Te has librado!|¡Eres el burro!/);
  await expect(fin.getByText('BURRO', { exact: true })).toHaveCount(1);
});

// ── Pase ─────────────────────────────────────────────────────────────────────

test('pasar una carta: sale de la mano y llega resaltada la del anterior', async ({ page }) => {
  const semilla = semillaDonde('pase', nadieTieneCuatro);
  await empezar(page, `rapido&semilla=${semilla}`);
  await expect(page.getByTestId('estado-burro')).toContainText('Rival 1');
  const antes = await manoPropia(page);
  expect(antes).toHaveLength(4);
  const pasada = antes[0]!;
  await page.getByTestId(`mano-${pasada}`).click();
  await expect(page.getByTestId(`mano-${pasada}`)).toHaveCount(0);
  await expect(page.locator('.carta.recibida')).toHaveCount(1);
  const despues = await manoPropia(page);
  expect(despues).toHaveLength(4);
  const recibida = despues.find((c) => !antes.includes(c));
  await expect(page.locator('.carta.recibida')).toHaveAttribute('data-carta', recibida!);
});

// ── Plantarse ────────────────────────────────────────────────────────────────

test('con cuatro iguales, plantarse el primero y no llevar letra', async ({ page }) => {
  const semilla = semillaDonde(
    'cuatro',
    (e) => sonCuatroIguales(e.manos[0]!) && e.manos.slice(1).every((m) => !sonCuatroIguales(m)),
  );
  await empezar(page, `rapido&semilla=${semilla}`);
  await page.getByTestId('me-planto').click();
  const panel = page.getByTestId('panel-mano');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Te plantaste el primero con:');
  await expect(panel.getByTestId('cuatro').locator('svg')).toHaveCount(4);
  await expect(panel.getByTestId('lleva-letra')).toContainText('Rival');
  await expect(page.getByTestId('letras-0')).toHaveText('·····');
  await page.getByTestId('siguiente-mano').click();
  await expect(panel).toBeHidden();
  await expect(page.getByTestId('mano-burro')).toHaveText('Mano 2');
});

test('pulsar «¡Me planto!» sin cuatro iguales no cambia nada', async ({ page }) => {
  const semilla = semillaDonde('farol', nadieTieneCuatro);
  await empezar(page, `rapido&semilla=${semilla}`);
  const antes = await manoPropia(page);
  const boton = page.getByTestId('me-planto');
  await expect(boton).toBeEnabled();
  await boton.click();
  await expect(page.getByTestId('asiento-0')).toHaveAttribute('data-plantado', 'false');
  await expect(page.getByTestId('estado-burro')).not.toContainText('Te has plantado');
  expect(await manoPropia(page)).toEqual(antes);
});

// ── Guardado y pantalla pequeña ──────────────────────────────────────────────

test('al recargar una partida de Burro se continúa en el mismo punto', async ({ page }) => {
  const semilla = semillaDonde('recarga', nadieTieneCuatro);
  await empezar(page, `rapido&semilla=${semilla}`);
  const inicial = await manoPropia(page);
  await page.getByTestId(`mano-${inicial[0]!}`).click();
  await expect(page.locator('.carta.recibida')).toHaveCount(1);
  const mano = await manoPropia(page);

  await page.reload();
  await expect(page.getByTestId('retomar')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByTestId('asiento-0').locator('[data-carta]')).toHaveCount(4);
  expect(await manoPropia(page)).toEqual(mano);
});

test('la mesa del Burro con 5 jugadores entra en 360 × 640', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'rapido&semilla=pequena-burro', 5);
  await expect(page.locator('[data-testid^="asiento-"]')).toHaveCount(5);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(page.getByTestId('me-planto')).toBeInViewport();
  await page.screenshot({ path: 'test-results/burro-360.png' });
});
