import { expect, test, type Page } from '@playwright/test';
import { pistaTriPeaks, tripeaks, type AccionTriPeaks, type EstadoTriPeaks } from '@juegos/engine';

async function empezarTriPeaks(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-tripeaks').click();
  await page.getByTestId('empezar').click();
}

/** La misma partida en el motor, para saber qué cartas hay y seguir la pista sin adivinar. */
function enMotor(semilla: string): EstadoTriPeaks {
  const r = tripeaks.crear({}, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Hace en la UI una acción del motor tocando la carta o el mazo. */
async function hacerEnUI(page: Page, a: AccionTriPeaks) {
  if (a.tipo === 'quitar') await page.getByTestId(`p${a.posicion}`).click();
  else if (a.tipo === 'robar') await page.getByTestId('mazo').click();
  else throw new Error(`Acción no prevista: ${a.tipo}`);
}

const SEMILLA_GANABLE = 'tripeaks-2';

/** Estadísticas previas de TriPeaks con una mejor puntuación baja, para batirla. */
async function conRecordAnterior(page: Page, mejorPuntuacion: number) {
  await page.goto('./?rapido');
  await page.evaluate(
    (mejor) =>
      localStorage.setItem(
        'juegos-de-mesa/estadisticas',
        JSON.stringify({
          version: 1,
          juegos: {
            tripeaks: {
              jugadas: 1,
              ganadas: 1,
              empatadas: 0,
              perdidas: 0,
              racha: 1,
              mejorRacha: 1,
              mejorTiempoMs: 3_600_000,
              menosMovimientos: 999,
              mejorPuntuacion: mejor,
            },
          },
        }),
      ),
    mejorPuntuacion,
  );
}

// ── Quitar, robar y deshacer ─────────────────────────────────────────────────

test('quitar tocando suma puntos y racha; robar la corta; deshacer vuelve atrás', async ({
  page,
}) => {
  await empezarTriPeaks(page, `rapido&semilla=${SEMILLA_GANABLE}`);
  await expect(page.locator('[data-testid="picos"] .naipe')).toHaveCount(28);
  await expect(page.locator('[data-testid="picos"] .naipe[data-carta]')).toHaveCount(10);
  await expect(page.getByTestId('en-mazo')).toContainText('23 cartas');
  await page.screenshot({ path: 'test-results/tripeaks-mesa.png' });

  let e = enMotor(SEMILLA_GANABLE);
  // Se sigue la pista hasta quitar dos cartas seguidas.
  for (let i = 0; i < 30 && e.racha < 2; i++) {
    const a = pistaTriPeaks(tripeaks.vistaDe(e, 0), tripeaks.accionesLegales(e, 0))!;
    await hacerEnUI(page, a);
    e = tripeaks.transicion(e, 0, a);
    await expect(page.getByTestId('movimientos')).toHaveText(String(e.movimientos));
  }
  expect(e.racha).toBe(2);
  await expect(page.getByTestId('puntos')).toHaveText(String(e.puntos));
  await expect(page.getByTestId('racha')).toHaveText('Racha ×2');

  await page.getByTestId('deshacer').click();
  await expect(page.getByTestId('racha')).toHaveText('Racha ×1');
  await expect(page.getByTestId('puntos')).toHaveText(String(e.puntos - 2));

  await page.getByTestId('mazo').click();
  await expect(page.getByTestId('racha')).toHaveText('Sin racha');
});

test('tocar una carta que no se puede quitar no cambia nada', async ({ page }) => {
  await empezarTriPeaks(page, `rapido&semilla=${SEMILLA_GANABLE}`);
  const e = enMotor(SEMILLA_GANABLE);
  const quitables = new Set(
    tripeaks.accionesLegales(e, 0).flatMap((a) => (a.tipo === 'quitar' ? [a.posicion] : [])),
  );
  const quieta = [...Array(10).keys()].map((i) => 18 + i).find((p) => !quitables.has(p))!;
  await page.getByTestId(`p${quieta}`).click();
  // Una tapada tampoco: está desactivada.
  await expect(page.getByTestId('p0')).toBeDisabled();
  await expect(page.getByTestId('movimientos')).toHaveText('0');
  await expect(page.locator('[data-testid="picos"] .naipe')).toHaveCount(28);
});

// ── Victoria, abandono y récord ──────────────────────────────────────────────

test('ganar una partida siguiendo la pista, con récord de puntos', async ({ page }) => {
  test.setTimeout(120_000);
  await conRecordAnterior(page, 1);
  await empezarTriPeaks(page, `rapido&semilla=${SEMILLA_GANABLE}`);
  let e = enMotor(SEMILLA_GANABLE);
  for (let i = 0; i < 200 && tripeaks.resultado(e) === null; i++) {
    const a = pistaTriPeaks(tripeaks.vistaDe(e, 0), tripeaks.accionesLegales(e, 0));
    if (a === null) throw new Error('La pista se quedó sin jugadas');
    await hacerEnUI(page, a);
    e = tripeaks.transicion(e, 0, a);
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText('¡Solitario completado!');
  await expect(fin.getByTestId('puntos-tripeaks')).toHaveText(`${e.puntos} puntos`);
  await expect(fin.getByTestId('resumen-tripeaks')).toContainText(`${e.movimientos} movimientos`);
  await expect(fin.getByTestId('record-puntos')).toBeVisible();
  await page.screenshot({ path: 'test-results/tripeaks-victoria.png' });
});

test('abandonar TriPeaks guarda la puntuación', async ({ page }) => {
  await empezarTriPeaks(page, `rapido&semilla=${SEMILLA_GANABLE}`);
  let e = enMotor(SEMILLA_GANABLE);
  while (e.puntos === 0) {
    const a = pistaTriPeaks(tripeaks.vistaDe(e, 0), tripeaks.accionesLegales(e, 0))!;
    await hacerEnUI(page, a);
    e = tripeaks.transicion(e, 0, a);
  }
  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Abandonar' }).click();
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText('Partida abandonada');
  await expect(fin.getByTestId('puntos-tripeaks')).toHaveText(
    `${e.puntos} ${e.puntos === 1 ? 'punto' : 'puntos'}`,
  );
  await fin.getByRole('button', { name: /menú/i }).click();
  await page.getByTestId('ver-estadisticas').click();
  await expect(
    page.getByTestId('estadisticas-tripeaks').getByTestId('mejor-puntuacion'),
  ).toHaveText(String(e.puntos));
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de TriPeaks se continúa en el mismo punto', async ({ page }) => {
  await empezarTriPeaks(page, 'rapido&semilla=tripeaks-retomar');
  await page.getByTestId('mazo').click();
  const arriba = await page.getByTestId('descarte-arriba').getAttribute('data-carta');
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByTestId('descarte-arriba')).toHaveAttribute('data-carta', arriba!);
  await expect(page.getByTestId('movimientos')).toHaveText('1');
});

test('TriPeaks entra en 360 × 640 sin scroll', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarTriPeaks(page, 'semilla=pequena');
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const medidas = await page.evaluate(() => ({
    ancho: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
    altoVentana: window.innerHeight,
  }));
  expect(medidas.ancho).toBeLessThanOrEqual(medidas.ventana);
  const mazo = (await page.getByTestId('mazo').boundingBox())!;
  expect(mazo.y + mazo.height).toBeLessThanOrEqual(medidas.altoVentana);
  await page.screenshot({ path: 'test-results/tripeaks-360.png' });
});
