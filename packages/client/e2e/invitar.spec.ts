import { expect, test, type Browser, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

// Change invitar-enlace: el botón «Invitar» de la sala de espera y entrar en la sala al abrir
// el enlace (spec partidas-en-red).

/** Un jugador en su propio navegador; con `nombre`, ya jugó en red y lo tiene guardado. */
async function jugador(browser: Browser, nombre?: string): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  if (nombre)
    await page.addInitScript((n) => localStorage.setItem('juegos-de-mesa/red/nombre', n), nombre);
  return page;
}

/** Ana crea una sala de Escoba desde las opciones y devuelve su código. */
async function crearSala(page: Page): Promise<string> {
  await page.goto('./?rapido');
  await abrirJuego(page, 'escoba');
  await page.getByTestId('nombre-red').fill('Ana');
  await page.getByTestId('empezar-en-red').click();
  const codigo = page.getByTestId('codigo-sala');
  await expect(codigo).toHaveText(/^[A-Z]{5}$/);
  return (await codigo.textContent())!;
}

/** El enlace de la sala, tal como lo comparte el panel. */
async function enlaceDelPanel(page: Page): Promise<string> {
  return (await page.getByTestId('enlace-sala').textContent())!.trim();
}

test('«Invitar» comparte el mensaje con el enlace de la sala', async ({ browser }) => {
  const ana = await jugador(browser);
  await ana.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (datos: ShareData) => {
        (window as unknown as { compartido: ShareData }).compartido = datos;
      },
    });
  });
  const codigo = await crearSala(ana);
  await ana.getByTestId('invitar').click();
  const compartido = await ana.waitForFunction(
    () => (window as unknown as { compartido?: ShareData }).compartido,
  );
  const { text } = (await compartido.jsonValue()) as ShareData;
  expect(text).toContain('Escoba');
  expect(text).toContain(`?sala=${codigo}`);
  expect(text).not.toContain('rapido');
  await expect(ana.getByTestId('panel-invitar')).toHaveCount(0);
});

test('sin hoja de compartir, «Invitar» ofrece WhatsApp y copiar el enlace', async ({ browser }) => {
  const ana = await jugador(browser);
  await ana.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  });
  const codigo = await crearSala(ana);
  await ana.getByTestId('invitar').click();
  await expect(ana.getByTestId('panel-invitar')).toBeVisible();
  const enlace = await enlaceDelPanel(ana);
  expect(new URL(enlace).searchParams.get('sala')).toBe(codigo);
  const whatsapp = await ana.getByTestId('invitar-whatsapp').getAttribute('href');
  expect(whatsapp).toMatch(/^https:\/\/wa\.me\/\?text=/);
  expect(decodeURIComponent(whatsapp!.split('text=')[1]!)).toContain(enlace);
  await expect(ana.getByTestId('copiar-enlace')).toBeVisible();
});

test('con el nombre guardado, el enlace lleva directamente a la sala', async ({ browser }) => {
  const ana = await jugador(browser);
  await ana.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  });
  await crearSala(ana);
  await ana.getByTestId('invitar').click();
  const enlace = await enlaceDelPanel(ana);

  const luis = await jugador(browser, 'Luis');
  await luis.goto(`${enlace}&rapido`);
  await expect(luis.getByTestId('sala-espera')).toBeVisible();
  await expect(luis.getByTestId('asiento-sala-1')).toContainText('Luis');
  await expect(ana.getByTestId('asiento-sala-1')).toContainText('Luis');
  expect(luis.url()).not.toContain('sala=');

  // Abrir otra vez el enlace de la sala lo deja en ella una sola vez (antes de empezar, el
  // servidor libera el asiento al recargar y la invitación vuelve a entrar).
  await luis.goto(`${enlace}&rapido`);
  await expect(luis.getByTestId('codigo-sala')).toBeVisible();
  await expect(ana.locator('[data-testid^="asiento-sala-"]', { hasText: 'Luis' })).toHaveCount(1);
  await expect(luis.getByTestId('aviso-red')).toHaveCount(0);
});

test('sin nombre, el enlace deja el código escrito y solo pide el nombre', async ({ browser }) => {
  const ana = await jugador(browser);
  await ana.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  });
  const codigo = await crearSala(ana);
  await ana.getByTestId('invitar').click();
  const enlace = await enlaceDelPanel(ana);

  const eva = await jugador(browser);
  await eva.goto(`${enlace}&rapido`);
  await expect(eva.getByTestId('codigo')).toHaveValue(codigo);
  await expect(eva.getByTestId('nombre')).toBeFocused();
  await eva.getByTestId('nombre').fill('Eva');
  await eva.getByTestId('unirse').click();
  await expect(eva.getByTestId('sala-espera')).toBeVisible();
  await expect(ana.getByTestId('asiento-sala-1')).toContainText('Eva');
});

test('el enlace de una sala que no existe da el error habitual', async ({ browser }) => {
  const luis = await jugador(browser, 'Luis');
  await luis.goto('./?rapido&sala=ZZZZZ');
  await expect(luis.getByTestId('aviso-red')).toHaveText('No hay ninguna sala con ese código');
});

test('un enlace con un código mal formado se ignora', async ({ browser }) => {
  const luis = await jugador(browser, 'Luis');
  await luis.goto('./?rapido&sala=OIA');
  await expect(luis.getByTestId('jugar-en-red')).toBeVisible();
  await expect(luis.getByTestId('sala-espera')).toHaveCount(0);
});
