import { expect, test, type Page } from '@playwright/test';

async function empezarMentiroso(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-mentiroso').click();
  if (jugadores) await page.getByLabel(`${jugadores} jugadores`, { exact: true }).check();
  await page.getByTestId('empezar').click();
}

const cartasMano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');

/** Marca las `n` primeras cartas de la mano y las baja. */
async function bajar(page: Page, n: number) {
  // Mientras dura la pausa tras la jugada anterior, la mesa ignora los toques: se repite el
  // toque de cada carta hasta que queda marcada.
  for (let i = 0; i < n; i++) {
    await expect(async () => {
      if ((await page.getByTestId('bajar').textContent())?.trim() !== `Bajar ${i + 1}`) {
        await cartasMano(page)
          .nth(i)
          .click({ position: { x: 6, y: 6 } });
      }
      await expect(page.getByTestId('bajar')).toHaveText(`Bajar ${i + 1}`, { timeout: 1_000 });
    }).toPass();
  }
  await page.getByTestId('bajar').click();
}

/** Espera a que le toque al jugador (o a que termine la partida). */
async function esperarTurno(page: Page) {
  await page
    .locator('[data-testid="bajar"], [data-testid="creer"], [data-testid="fin"]')
    .first()
    .waitFor({ timeout: 30_000 });
}

// ── Bajar y desconfiar ───────────────────────────────────────────────────────

test('bajar dos cartas y después desconfiar de un rival', async ({ page }) => {
  await empezarMentiroso(page, 'rapido&semilla=mentiroso-e2e');
  await expect(cartasMano(page)).toHaveCount(13);
  await expect(page.getByTestId('valor')).toHaveText('Toca: Ases');
  await page.screenshot({ path: 'test-results/mentiroso-mesa.png' });

  await bajar(page, 2);
  await expect(cartasMano(page)).toHaveCount(11);
  // En modo rápido el rival de la izquierda puede bajar enseguida: la última bajada que se ve es
  // la nuestra o ya la suya.
  await expect(page.getByTestId('ultima-bajada')).toHaveText(/^(Tú: 2 Ases|Rival \d+: .+)$/);

  // Cuando vuelve a tocar, el rival de la izquierda acaba de bajar: se le desconfía.
  await esperarTurno(page);
  const desconfiar = page.getByTestId('desconfiar');
  await expect(desconfiar).toBeVisible();
  await desconfiar.click();
  const revelacion = page.getByTestId('revelacion');
  await expect(revelacion).toBeVisible();
  await expect(revelacion.locator('[data-carta]').first()).toBeVisible();
  await expect(page.getByTestId('se-lleva')).toContainText('montón');
  await page.screenshot({ path: 'test-results/mentiroso-revelacion.png' });
  // Tras desconfiar le toca bajar al jugador, y ya no puede desconfiar.
  await expect(page.getByTestId('bajar')).toBeVisible();
  await expect(desconfiar).toBeHidden();
});

test('partida de Mentiroso completa contra la IA', async ({ page }) => {
  test.setTimeout(240_000);
  await empezarMentiroso(page, 'rapido&semilla=mentiroso-completa', 3);
  const fin = page.getByTestId('fin');
  for (let turno = 0; turno < 400; turno++) {
    await esperarTurno(page);
    if (await fin.isVisible()) break;
    if (await page.getByTestId('creer').isVisible()) {
      await page.getByTestId('creer').click();
      continue;
    }
    await bajar(page, 1);
  }
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('sin-cartas')).toBeVisible();
  await expect(fin.getByTestId('quedan-0')).toBeVisible();
  await page.screenshot({ path: 'test-results/mentiroso-fin.png' });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Mentiroso se continúa con las cartas marcadas', async ({
  page,
}) => {
  await empezarMentiroso(page, 'rapido&semilla=mentiroso-retomar');
  const primera = await cartasMano(page).first().getAttribute('data-carta');
  await cartasMano(page)
    .first()
    .click({ position: { x: 6, y: 6 } });
  await expect(page.getByTestId('bajar')).toHaveText('Bajar 1');
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByTestId(`mano-${primera}`)).toHaveClass(/seleccionada/);
  await expect(page.getByTestId('bajar')).toHaveText('Bajar 1');
});

test('el Mentiroso de 6 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarMentiroso(page, 'semilla=pequena', 6);
  await expect(cartasMano(page)).toHaveCount(9);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 5; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await page.screenshot({ path: 'test-results/mentiroso6-360.png' });
});
