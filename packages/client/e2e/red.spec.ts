import { expect, test, type Browser, type Page } from '@playwright/test';
import { T } from '../src/textos';
import type { IdJuego } from '../src/sesion/juegos';
import { elegirJuegoDeSala } from './menu';

/** Un jugador en su propio navegador (contexto aislado, con su almacenamiento). */
async function jugador(browser: Browser): Promise<Page> {
  const contexto = await browser.newContext();
  return contexto.newPage();
}

async function abrirRed(page: Page, nombre: string) {
  await page.goto('./?rapido');
  await page.getByTestId('jugar-en-red').click();
  await page.getByTestId('nombre').fill(nombre);
}

/** El anfitrión crea una sala del juego y devuelve su código. */
async function crearSala(page: Page, juego: string, opciones?: (p: Page) => Promise<void>) {
  await abrirRed(page, 'Ana');
  await page.getByTestId('crear-sala').click();
  await elegirJuegoDeSala(page, juego as IdJuego);
  await opciones?.(page);
  await page.getByTestId('empezar').click();
  const codigo = page.getByTestId('codigo-sala');
  await expect(codigo).toHaveText(/^[A-Z]{5}$/);
  return (await codigo.textContent())!;
}

async function unirse(page: Page, codigo: string, nombre: string) {
  await abrirRed(page, nombre);
  await page.getByTestId('codigo').fill(codigo.toLowerCase());
  await page.getByTestId('unirse').click();
  await expect(page.getByTestId('sala-espera')).toBeVisible();
}

/** Juega la Brisca en dos navegadores hasta el fin (o hasta `parar` jugadas). */
async function jugarBriscaEnRed(paginas: Page[], parar = Infinity) {
  for (let jugadas = 0; jugadas < Math.min(parar, 200); jugadas++) {
    const turno = paginas.map((p) => p.locator('.carta-mano.jugable, [data-testid="fin"]').first());
    // Espera a que a alguno le toque jugar o termine la partida.
    await expect
      .poll(async () => (await Promise.all(turno.map((t) => t.isVisible()))).some(Boolean), {
        timeout: 20_000,
      })
      .toBe(true);
    if (await paginas[0]!.getByTestId('fin').isVisible()) return;
    const p = (await turno[0]!.isVisible()) ? paginas[0]! : paginas[1]!;
    await p.locator('.carta-mano.jugable').first().click();
    await p.getByTestId('mesa').click();
  }
}

test('Brisca entre dos navegadores, con una recarga a mitad de partida', async ({ browser }) => {
  test.setTimeout(240_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'brisca');
  await unirse(luis, codigo, 'Luis');

  await expect(ana.getByTestId('asiento-sala-1')).toContainText('Luis');
  await expect(luis.getByTestId('esperando-anfitrion')).toBeVisible();
  await ana.getByTestId('empezar-red').click();

  // Cada uno ve su mano abajo y el nombre del otro.
  for (const [p, otro] of [
    [ana, 'Luis'],
    [luis, 'Ana'],
  ] as const) {
    await expect(p.locator('.carta-mano')).toHaveCount(3);
    await expect(p.getByTestId('franja-red')).toContainText(otro);
    await expect(p.getByTestId('asiento-' + (p === ana ? 1 : 0))).toContainText(otro);
  }
  await ana.screenshot({ path: `test-results/red-brisca-ana.png` });

  await jugarBriscaEnRed([ana, luis], 6);

  // Luis recarga: vuelve a su asiento desde el menú.
  const manoAntes = await luis.locator('.carta-mano').count();
  await luis.reload();
  await luis.getByRole('button', { name: 'Volver a la sala' }).first().click();
  await expect(luis.locator('.carta-mano')).toHaveCount(manoAntes);
  await expect(ana.getByTestId('jugador-1')).toContainText('Luis');

  await jugarBriscaEnRed([ana, luis]);
  for (const p of [ana, luis]) {
    await expect(p.getByTestId('fin')).toBeVisible();
    const a = Number(await p.getByTestId('fin').getByTestId('puntos-0').textContent());
    const b = Number(await p.getByTestId('fin').getByTestId('puntos-1').textContent());
    expect(a + b).toBe(120);
  }
  // Solo el anfitrión pide la revancha.
  await expect(luis.getByTestId('espera-revancha')).toBeVisible();
  await ana.getByTestId('revancha').click();
  for (const p of [ana, luis]) {
    await expect(p.getByTestId('fin')).toBeHidden();
    await expect(p.locator('.carta-mano')).toHaveCount(3);
  }
});

test('Mus de 2 humanos y 2 IAs, jugando desde los asientos 0 y 2', async ({ browser }) => {
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'mus');
  await unirse(luis, codigo, 'Luis');
  // Luis se cambia al asiento 2: es la pareja de Ana.
  await luis.getByTestId('sentarse-2').click();
  await expect(ana.getByTestId('asiento-sala-2')).toContainText('Luis');
  await expect(ana.getByTestId('asiento-sala-1')).toContainText('IA');
  await ana.getByTestId('empezar-red').click();

  // Desde el asiento 2, Ana (asiento 0) está enfrente y es su pareja.
  await expect(luis.getByTestId('asiento-0')).toHaveClass(/arriba/);
  await expect(luis.getByTestId('asiento-0')).toContainText('Ana');
  await expect(luis.getByTestId('asiento-1')).toHaveClass(/izquierda/);
  await expect(luis.getByTestId('asiento-3')).toHaveClass(/derecha/);
  await expect(ana.getByTestId('asiento-2')).toHaveClass(/arriba/);
  await expect(luis.locator('[data-testid="propio"], .propio').first()).toBeVisible();
  for (const p of [ana, luis]) {
    await expect(p.getByTestId('franja-red')).toContainText('IA');
    await expect(p.getByTestId('jugador-1')).toContainText('IA');
  }
  await luis.screenshot({ path: `test-results/red-mus-asiento-2.png` });
});

test('la sala de espera muestra las parejas en los juegos de 4 por parejas', async ({
  browser,
}) => {
  // Muestra de juegos por parejas añadidos después de la sala de espera.
  for (const juego of ['sueca', 'tressette', 'bridge']) {
    const ana = await jugador(browser);
    await crearSala(ana, juego);
    await expect(ana.getByTestId('asiento-sala-0')).toContainText('Pareja 1');
    await expect(ana.getByTestId('asiento-sala-1')).toContainText('Pareja 2');
    await expect(ana.getByTestId('asiento-sala-2')).toContainText('Pareja 1');
    await ana.context().close();
  }
  // Un juego de 4 sin parejas no las muestra.
  const ana = await jugador(browser);
  await crearSala(ana, 'barbu');
  await expect(ana.getByTestId('asiento-sala-0')).not.toContainText('Pareja');
});

test('Butifarra en red: dos humanos rivales juegan una baza', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'butifarra');
  await unirse(luis, codigo, 'Luis');
  await expect(ana.getByTestId('asiento-sala-1')).toContainText('Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.locator('.carta-mano')).toHaveCount(12);

  // Cada uno decide lo que le toque (pasar, elegir oros) y juega una carta, hasta que los dos
  // han jugado en la primera baza.
  const paginas = [ana, luis];
  const cartasEnMano = () => Promise.all(paginas.map((p) => p.locator('.carta-mano').count()));
  for (let paso = 0; paso < 20 && (await cartasEnMano()).some((n) => n === 12); paso++) {
    const accion = paginas.map((p) =>
      p.locator('[data-testid="pasar"], [data-testid="elegir-oros"], .carta-mano.jugable').first(),
    );
    await expect
      .poll(async () => (await Promise.all(accion.map((a) => a.isVisible()))).some(Boolean), {
        timeout: 20_000,
      })
      .toBe(true);
    const p = (await accion[0]!.isVisible()) ? ana : luis;
    const boton = p.locator('[data-testid="pasar"], [data-testid="elegir-oros"]').first();
    if (await boton.isVisible()) {
      const id = await boton.getAttribute('data-testid');
      await boton.click();
      await expect(p.getByTestId(id!)).toBeHidden();
    } else {
      const antes = await p.locator('.carta-mano').count();
      // La esquina de la carta queda a la vista aunque las cartas se solapen.
      await p
        .locator('.carta-mano.jugable')
        .first()
        .click({ position: { x: 8, y: 8 } });
      await p.getByTestId('mesa').click();
      await expect(p.locator('.carta-mano')).toHaveCount(antes - 1);
    }
  }
  for (const p of [ana, luis]) {
    await expect(p.getByTestId('triunfo-butifarra')).toBeVisible();
    await expect(p.locator('.carta-mano')).toHaveCount(11);
  }
  await luis.screenshot({ path: `test-results/red-butifarra-luis.png` });
});

test('Truc en red: dos humanos juegan una mano completa', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'truc');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.locator('.carta-mano')).toHaveCount(3);
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');

  // Ana truca y Luis quiere; luego cada uno juega su carta cuando le toca.
  await ana.getByTestId('truc-trucar').click();
  await luis.getByTestId('truc-vull').click();
  for (const p of [ana, luis])
    await expect(p.getByTestId('valor-mano')).toHaveText('La mano vale 2');
  const paneles = [ana, luis].map((p) => p.getByTestId('panel-mano'));
  // La mano ha terminado en cuanto cambian las piedras de la came.
  const terminada = async () =>
    (await Promise.all(paneles.map((x) => x.isVisible()))).some(Boolean) ||
    !(await ana.getByTestId('marcador').innerText()).includes('0 – 0 (a 12)');
  for (let paso = 0; paso < 12 && !(await terminada()); paso++) {
    const cartas = [ana, luis].map((p) => p.locator('.carta-mano.jugable').first());
    await expect
      .poll(
        async () =>
          (await Promise.all([...cartas, ...paneles].map((x) => x.isVisible()))).some(Boolean),
        { timeout: 20_000 },
      )
      .toBe(true);
    for (const [i, p] of [ana, luis].entries()) {
      if (!(await terminada()) && (await cartas[i]!.isVisible())) {
        const antes = await p.locator('.carta-mano').count();
        await cartas[i]!.click({ position: { x: 8, y: 8 } });
        await p.getByTestId('mesa').click();
        await expect(p.locator('.carta-mano')).not.toHaveCount(antes);
      }
    }
  }
  for (const p of paneles) {
    await expect(p).toBeVisible();
    await expect(p.getByTestId('resumen-truc')).toContainText('Truc');
  }
});

test('Julepe con bailarla y la defensa del bote en red: los dos ven lo que decide quien reparte', async ({
  browser,
}) => {
  test.setTimeout(150_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'julepe', async (p) => {
    await p.getByTestId('julepe-bailarla').check();
    await p.getByTestId('julepe-defensa').check();
  });
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.locator('.carta-mano')).toHaveCount(5);

  // Reparte una IA: decide si la baila antes que nadie, y después le toca a Ana, que es mano.
  await expect(ana.getByTestId('julepe-jugar')).toBeVisible({ timeout: 30_000 });
  const bailada = await ana.getByTestId('marca-julepe').count();
  await expect(luis.getByTestId('marca-julepe')).toHaveCount(bailada);
  if (bailada > 0) await expect(luis.getByTestId('marca-julepe')).toContainText('la baila');
  await ana.getByTestId('julepe-pasar').click();
  await expect(luis.getByTestId('asiento-0')).toContainText('pasa');
});

test('Julepe en red: dos humanos y dos IAs juegan una mano', async ({ browser }) => {
  test.setTimeout(150_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'julepe');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.locator('.carta-mano')).toHaveCount(5);

  // Los dos juegan la mano, no cambian cartas y juegan su carta menor hasta el resumen.
  const paginas = [ana, luis];
  const paneles = paginas.map((p) => p.getByTestId('panel-mano'));
  const terminada = async () =>
    (await Promise.all(paneles.map((x) => x.isVisible()))).some(Boolean);
  for (let paso = 0; paso < 40 && !(await terminada()); paso++) {
    const accion = paginas.map((p) =>
      p
        .locator('[data-testid="julepe-jugar"], [data-testid="descartar"], .carta-mano.jugable')
        .first(),
    );
    await expect
      .poll(
        async () =>
          (await terminada()) ||
          (await Promise.all(accion.map((a) => a.isVisible()))).some(Boolean),
        {
          timeout: 30_000,
        },
      )
      .toBe(true);
    if (await terminada()) break;
    const i = (await accion[0]!.isVisible()) ? 0 : 1;
    const p = paginas[i]!;
    const boton = p.locator('[data-testid="julepe-jugar"], [data-testid="descartar"]').first();
    if (await boton.isVisible()) {
      const id = await boton.getAttribute('data-testid');
      await boton.click();
      await expect(p.getByTestId(id!)).toBeHidden();
    } else {
      const antes = await p.locator('.carta-mano').count();
      await p
        .locator('.carta-mano.jugable')
        .first()
        .click({ position: { x: 8, y: 8 } });
      await p.getByTestId('mesa').click();
      await expect(p.locator('.carta-mano')).not.toHaveCount(antes);
    }
  }
  // Cada uno se ve como «Tú» y ve al otro por su nombre.
  for (const [panel, otro] of [
    [paneles[0]!, 'Luis'],
    [paneles[1]!, 'Ana'],
  ] as const) {
    await expect(panel).toBeVisible({ timeout: 30_000 });
    await expect(panel.getByTestId('resumen-julepe')).toContainText(otro);
    await expect(panel.getByTestId('resumen-julepe')).toContainText('Tú');
  }
});

test('Tute subastado en red: dos humanos y dos IAs juegan una mano', async ({ browser }) => {
  test.setTimeout(150_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'tuteSubastado');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.locator('.carta-mano')).toHaveCount(10);

  // Los dos pasan en la subasta, eligen el primer palo si la ganan y juegan su carta menor.
  const paginas = [ana, luis];
  const paneles = paginas.map((p) => p.getByTestId('panel-mano'));
  const terminada = async () =>
    (await Promise.all(paneles.map((x) => x.isVisible()))).some(Boolean);
  const BOTONES = '[data-testid="pasar"], [data-testid^="triunfo-"]';
  for (let paso = 0; paso < 80 && !(await terminada()); paso++) {
    const accion = paginas.map((p) => p.locator(`${BOTONES}, .carta-mano.jugable`).first());
    await expect
      .poll(
        async () =>
          (await terminada()) ||
          (await Promise.all(accion.map((a) => a.isVisible()))).some(Boolean),
        { timeout: 30_000 },
      )
      .toBe(true);
    if (await terminada()) break;
    const i = (await accion[0]!.isVisible()) ? 0 : 1;
    const p = paginas[i]!;
    const boton = p.locator(BOTONES).first();
    if (await boton.isVisible()) {
      const id = await boton.getAttribute('data-testid');
      await boton.click();
      await expect(p.getByTestId(id!)).toBeHidden();
    } else {
      const antes = await p.locator('.carta-mano').count();
      await p
        .locator('.carta-mano.jugable')
        .first()
        .click({ position: { x: 8, y: 8 } });
      await p.getByTestId('mesa').click();
      await expect(p.locator('.carta-mano')).not.toHaveCount(antes);
    }
  }
  // Cada uno se ve como «Tú» y ve al otro por su nombre.
  for (const [panel, otro] of [
    [paneles[0]!, 'Luis'],
    [paneles[1]!, 'Ana'],
  ] as const) {
    await expect(panel).toBeVisible({ timeout: 30_000 });
    await expect(panel.getByTestId('resumen-tute-subastado')).toContainText(otro);
    await expect(panel.getByTestId('resumen-tute-subastado')).toContainText('Tú');
  }
});

test('Tute subastado de 3 en red: dos humanos y una IA, con 12 cartas y la subasta desde 70', async ({
  browser,
}) => {
  test.setTimeout(150_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'tuteSubastado', async (p) => {
    await p.getByTestId('subastado-jugadores-3').check();
  });
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.locator('.carta-mano')).toHaveCount(12);

  // Ana es mano: puja 70, la mínima con 3, y Luis, que habla después, lo ve en su subasta.
  const subasta = ana.getByTestId('panel-subasta');
  await expect(subasta).toBeVisible({ timeout: 30_000 });
  await expect(subasta.getByTestId('puja-60')).toHaveCount(0);
  await ana.getByTestId('puja-70').click();
  const deLuis = luis.getByTestId('panel-subasta');
  await expect(deLuis).toContainText('puja 70', { timeout: 30_000 });
  await expect(deLuis.getByTestId('puja-70')).toHaveCount(0);
  await expect(deLuis.getByTestId('puja-80')).toBeVisible();
});

test('Cuatrola en red: dos humanos y dos IAs juegan una mano', async ({ browser }) => {
  test.setTimeout(150_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'cuatrola');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.locator('.carta-mano')).toHaveCount(10);

  // Los dos pasan en la subasta, eligen el primer palo y la primera carta si la ganan, y
  // juegan su carta menor.
  const paginas = [ana, luis];
  const paneles = paginas.map((p) => p.getByTestId('panel-mano'));
  const terminada = async () =>
    (await Promise.all(paneles.map((x) => x.isVisible()))).some(Boolean);
  const BOTONES = '[data-testid="pasar"], [data-testid^="triunfo-"], [data-testid^="llamar-"]';
  for (let paso = 0; paso < 80 && !(await terminada()); paso++) {
    const accion = paginas.map((p) => p.locator(`${BOTONES}, .carta-mano.jugable`).first());
    await expect
      .poll(
        async () =>
          (await terminada()) ||
          (await Promise.all(accion.map((a) => a.isVisible()))).some(Boolean),
        { timeout: 30_000 },
      )
      .toBe(true);
    if (await terminada()) break;
    const i = (await accion[0]!.isVisible()) ? 0 : 1;
    const p = paginas[i]!;
    const boton = p.locator(BOTONES).first();
    if (await boton.isVisible()) {
      const id = await boton.getAttribute('data-testid');
      await boton.click();
      await expect(p.getByTestId(id!)).toBeHidden();
    } else {
      const antes = await p.locator('.carta-mano').count();
      await p
        .locator('.carta-mano.jugable')
        .first()
        .click({ position: { x: 8, y: 8 } });
      await p.getByTestId('mesa').click();
      await expect(p.locator('.carta-mano')).not.toHaveCount(antes);
    }
  }
  // Cada uno se ve como «Tú» y ve al otro por su nombre.
  for (const [panel, otro] of [
    [paneles[0]!, 'Luis'],
    [paneles[1]!, 'Ana'],
  ] as const) {
    await expect(panel).toBeVisible({ timeout: 30_000 });
    await expect(panel.getByTestId('resumen-cuatrola')).toContainText(otro);
    await expect(panel.getByTestId('resumen-cuatrola')).toContainText('Tú');
  }
});

test('Mentiroso en red: dos humanos bajan y cada uno ve la bajada del otro', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'mentiroso');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(13);

  // Ana es mano: baja una carta como As; Luis la ve y baja la suya como dos.
  const bajarUna = async (p: Page) => {
    await p.getByTestId('bajar').waitFor({ timeout: 30_000 });
    await p
      .locator('[data-testid="mano"] .carta-mano')
      .first()
      .click({ position: { x: 6, y: 6 } });
    await p.getByTestId('bajar').click();
  };
  await bajarUna(ana);
  await expect(luis.getByTestId('ultima-bajada')).toHaveText('Ana: 1 As');
  await bajarUna(luis);
  await expect(ana.getByTestId('ultima-bajada')).toHaveText('Luis: 1 dos', { timeout: 30_000 });
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Ocho loco en red: dos humanos juegan y cada uno ve lo que hizo el otro', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'ochoLoco');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(5);

  // Juega una carta que case (eligiendo corazones con un 8), o roba y pasa.
  const turno = async (p: Page) => {
    await p
      .locator('[data-testid="mano"] .carta-mano.jugable, [data-testid="robar"]')
      .first()
      .waitFor({ timeout: 30_000 });
    const jugable = p.locator('[data-testid="mano"] .carta-mano.jugable').first();
    if (await jugable.isVisible()) {
      const id = (await jugable.getAttribute('data-carta'))!;
      await jugable.click({ position: { x: 6, y: 6 } });
      if (id.endsWith('-8')) await p.getByTestId('palo-corazones').click();
      return id;
    }
    await p.getByTestId('robar').click();
    await p.getByTestId('pasar').click();
    return null;
  };
  // Ana es mano; Luis ve lo que hizo y juega él.
  const deAna = await turno(ana);
  if (deAna) await expect(luis.getByTestId('descarte')).toHaveAttribute('data-carta', deAna);
  else await expect(luis.getByTestId('asiento-0')).toContainText('Pasa');
  await expect(luis.getByTestId('asiento-0')).toContainText('Ana');
  const deLuis = await turno(luis);
  if (deLuis) {
    await expect(ana.getByTestId('asiento-1')).toContainText(/de /, { timeout: 30_000 });
  } else {
    await expect(ana.getByTestId('asiento-1')).toContainText(/Pasa|de /, { timeout: 30_000 });
  }
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Picas en red: dos humanos apuestan y ven la apuesta del otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'picas');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(13);

  // Ana apuesta primero; Luis ve su apuesta y apuesta él.
  await ana.getByTestId('apostar-4').click();
  await expect(luis.getByTestId('asiento-0')).toContainText('Ana');
  await expect(luis.getByTestId('asiento-0')).toContainText('4 / 0');
  await luis.getByTestId('apostar-0').click();
  await expect(ana.getByTestId('asiento-1')).toContainText('Nil', { timeout: 30_000 });
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Blackjack en red: dos humanos apuestan y ven las cartas del otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'blackjack');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();

  // Ana apuesta primero; Luis ve su apuesta y apuesta él.
  await ana.getByTestId('apostar-10').click();
  await expect(luis.getByTestId('apuesta-0')).toHaveText('apuesta 10');
  await expect(luis.getByTestId('puesto-0')).toContainText('Ana');
  await luis.getByTestId('apostar-4').click();
  // Repartido: cada uno ve las dos cartas del otro.
  await expect(ana.locator('[data-testid="mano-1-0"] .naipe')).toHaveCount(2, { timeout: 30_000 });
  await expect(luis.locator('[data-testid="mano-0-0"] .naipe')).toHaveCount(2);
  await expect(ana.getByTestId('puesto-1')).toContainText('Luis');
});

test('Gin Rummy en red: dos humanos pasan la primera carta, roban y descartan', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'ginRummy');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(10);

  // Los dos pasan la primera carta; Ana roba del mazo y descarta.
  await ana.getByTestId('pasar').click();
  await expect(luis.getByTestId('pasar')).toBeVisible();
  await luis.getByTestId('pasar').click();
  await expect(ana.getByTestId('mazo')).toHaveClass(/robable/);
  await ana.getByTestId('mazo').click();
  const primera = ana.locator('[data-testid="mano"] .carta-mano').first();
  const carta = await primera.getAttribute('data-carta');
  await primera.click({ position: { x: 6, y: 6 } });
  await ana.getByTestId('descartar').click();
  await expect(luis.getByTestId('descarte').locator(`[data-carta="${carta}"]`)).toBeVisible();
  await expect(luis.getByTestId('mazo')).toHaveClass(/robable/);
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Rummy 500 en red: dos humanos roban y descartan', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'rummy500');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(13);

  // Cada uno roba del mazo y descarta su primera carta.
  for (const [p, otro] of [
    [ana, luis],
    [luis, ana],
  ] as const) {
    await expect(p.getByTestId('mazo')).toHaveClass(/robable/);
    await p.getByTestId('mazo').click();
    // Se espera a la carta robada: al llegar, la mano se reordena y la primera puede cambiar.
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(14);
    const primera = p.locator('[data-testid="mano"] .carta-mano').first();
    const carta = await primera.getAttribute('data-carta');
    await primera.click({ position: { x: 6, y: 6 } });
    await p.getByTestId('descartar').click();
    await expect(otro.getByTestId('descarte').locator(`[data-carta="${carta}"]`)).toBeVisible();
  }
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Sevens en red: dos humanos ven las mismas escaleras', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'sevens', (p) =>
    p.getByLabel('3 jugadores', { exact: true }).check(),
  );
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).not.toHaveCount(0);
  // Si uno de los dos humanos tiene el 7 de diamantes, abre con él; si no, abre la IA. Al final,
  // los dos lo ven en la mesa.
  const siete = (p: Page) =>
    p.locator('[data-testid="mano"] .carta-mano.jugable[data-carta="diamantes-7"]');
  const enMesa = (p: Page) => p.getByTestId('fila-diamantes').locator('[data-carta="diamantes-7"]');
  await expect
    .poll(
      async () =>
        (await siete(ana).isVisible()) ||
        (await siete(luis).isVisible()) ||
        (await enMesa(ana).isVisible()),
      { timeout: 30_000 },
    )
    .toBe(true);
  for (const p of [ana, luis]) {
    if (await siete(p).isVisible()) {
      await siete(p).click({ position: { x: 8, y: 8 } });
      await p.getByTestId('mesa').click();
    }
  }
  for (const p of [ana, luis]) await expect(enMesa(p)).toBeVisible({ timeout: 30_000 });
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Casino en red: dos humanos ven la misma mesa', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'casino');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(4);
  const mesa = (p: Page) =>
    p
      .getByTestId('mesa')
      .locator('[data-carta]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')).sort());

  // Juega Ana (asiento 0) y después Luis (asiento 1): la primera jugada de su primera carta.
  for (const [p, otro] of [
    [ana, luis],
    [luis, ana],
  ] as const) {
    const carta = p.locator('[data-testid="mano"] .carta-mano.jugable').first();
    await carta.waitFor({ timeout: 30_000 });
    await carta.click({ position: { x: 6, y: 8 } });
    await p.getByTestId('jugada-0').click();
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(3);
    await expect.poll(() => mesa(otro)).toEqual(await mesa(p));
  }
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Durak en red: el ataque de uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'durak');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(6);
  await expect(luis.getByTestId('triunfo')).toHaveText(
    await ana.getByTestId('triunfo').innerText(),
  );

  // Ataca quien tiene el triunfo más bajo; el otro ve su carta en la mesa.
  const ataca = (await ana.locator('.carta-mano.jugable').first().isVisible()) ? ana : luis;
  const otro = ataca === ana ? luis : ana;
  const carta = ataca.locator('[data-testid="mano"] .carta-mano.jugable').first();
  await carta.waitFor({ timeout: 30_000 });
  const id = await carta.getAttribute('data-carta');
  await carta.click({ position: { x: 6, y: 8 } });
  await ataca.getByTestId('mesa').click();
  await expect(otro.getByTestId('par-0').locator(`[data-carta="${id}"]`)).toBeVisible();
  await expect(otro.getByTestId('tomar')).toBeVisible();
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Euchre en red: los dos ven el triunfo que pide uno', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'euchre');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(5);

  // Habla primero Ana (a la izquierda del repartidor): pide la carta vuelta.
  await ana.getByTestId('pedir').click();
  const triunfo = ana.getByTestId('triunfo');
  await expect(triunfo).toContainText('Triunfo');
  await expect(luis.getByTestId('triunfo')).toHaveText(await triunfo.innerText());
  await expect(luis.getByTestId('elige')).toContainText('Ana');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Big Two en red: lo que juega uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'bigTwo');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(13);

  // El primero de los dos al que le toca juega su carta jugable más baja si puede, o pasa; el
  // otro ve que le queda una carta menos.
  const jugar = (p: Page) => p.getByTestId('jugar');
  await expect
    .poll(async () => (await jugar(ana).isVisible()) || (await jugar(luis).isVisible()), {
      timeout: 30_000,
    })
    .toBe(true);
  for (let i = 0; i < 30; i++) {
    const p = (await jugar(ana).isVisible()) ? ana : (await jugar(luis).isVisible()) ? luis : null;
    if (p === null) {
      await ana.waitForTimeout(300);
      continue;
    }
    const otro = p === ana ? luis : ana;
    const asiento = p === ana ? 0 : 1;
    const jugable = p.locator('.carta-mano.jugable').first();
    if ((await p.getByTestId('paso').isVisible()) || !(await jugable.isVisible())) {
      await p.getByTestId('paso').click();
      continue;
    }
    await jugable.click();
    if (!(await jugar(p).isEnabled())) {
      await p.getByTestId('paso').click();
      continue;
    }
    await jugar(p).click();
    await expect(otro.getByTestId(`cartas-${asiento}`)).toHaveText('12 cartas');
    break;
  }
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Cribbage en red: los dos echan al crib y ven la misma mesa', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'cribbage');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(6);

  // Echa primero Ana (no reparte) y después Luis; los dos ven el mismo starter.
  for (const p of [ana, luis]) {
    await p.getByTestId('al-crib').waitFor({ timeout: 30_000 });
    const cartas = p.locator('[data-testid="mano"] .carta-mano');
    await cartas.nth(0).click();
    await cartas.nth(1).click();
    await p.getByTestId('al-crib').click();
    await expect(cartas).toHaveCount(4);
  }
  const starter = ana.getByTestId('starter');
  await expect(starter).toBeVisible();
  await expect(luis.getByTestId('starter')).toHaveAttribute(
    'data-carta',
    (await starter.getAttribute('data-carta'))!,
  );
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Belote en red: los dos ven el triunfo que toma uno', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'belote');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(5);

  // Habla primero Ana (a la izquierda del repartidor): toma la carta vuelta.
  await ana.getByTestId('tomar').click();
  const triunfo = ana.getByTestId('triunfo');
  await expect(triunfo).toContainText('Triunfo');
  await expect(luis.getByTestId('triunfo')).toHaveText(await triunfo.innerText());
  await expect(luis.getByTestId('elige')).toContainText('Ana');
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(8);
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Schnapsen en red: lo que juega uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'schnapsen');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(5);
  const triunfo = ana.getByTestId('triunfo');
  await expect(luis.getByTestId('triunfo')).toHaveText(await triunfo.innerText());

  // Sale Ana (no reparte): juega una carta y Luis la ve en la mesa.
  const carta = ana.locator('[data-testid="mano"] .carta-mano.jugable').first();
  const id = (await carta.getAttribute('data-carta'))!;
  await carta.click({ position: { x: 6, y: 8 } });
  await ana.getByTestId('mesa').click();
  await expect(luis.getByTestId('mesa').locator(`[data-carta="${id}"]`)).toBeVisible();
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Sixty-six en red: lo que juega uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'sixtySix');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(6);

  // Sale Ana (no reparte): juega una carta y Luis la ve en la mesa.
  const carta = ana.locator('[data-testid="mano"] .carta-mano.jugable').first();
  const id = (await carta.getAttribute('data-carta'))!;
  await carta.click({ position: { x: 6, y: 8 } });
  await ana.getByTestId('mesa').click();
  await expect(luis.getByTestId('mesa').locator(`[data-carta="${id}"]`)).toBeVisible();
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Skat en red: los dos ven la misma subasta', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'skat');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(10);

  // Puja primero Mittelhand, que es Luis: pasa, y los dos lo ven.
  await luis.getByTestId('paso').click();
  await expect(ana.getByTestId('aviso')).toContainText('Luis pasa');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Oh Hell en red: la apuesta de uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'ohHell');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(12);

  // Apuesta primero Ana (a la izquierda del repartidor) y Luis lo ve junto a su nombre.
  await ana.getByTestId('apostar-1').click();
  await expect(luis.getByTestId('asiento-0')).toContainText('apuesta 1');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Oh Hell empezando con 1 carta en red: los dos empiezan con 1 carta', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'ohHell', (p) => p.getByTestId('opcion-subiendo').check());
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) {
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(1);
    await expect(p.getByTestId('mano-oh-hell')).toHaveText('Mano 1 de 12 · 1 carta');
  }
  await ana.getByTestId('apostar-1').click();
  await expect(luis.getByTestId('asiento-0')).toContainText('apuesta 1');
});

test('Spite and Malice en red: el descarte de uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'spiteMalice');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(5);

  // Empieza Ana: descarta la primera carta de su mano en su primer descarte.
  const carta = (await ana.getByTestId('mano-0').getAttribute('data-carta'))!;
  await ana.getByTestId('mano-0').click();
  await ana.getByTestId('descarte-propio-0').click();
  await expect(luis.getByTestId('descarte-rival-0').locator(`[aria-label]`).first()).toBeVisible();
  await expect(luis.getByTestId('aviso')).toContainText('descarta');
  expect(carta).not.toBe('');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Scopa en red: la carta de uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'scopa');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(3);

  // Juega Ana (asiento 0) y Luis ve que tiene una carta menos.
  const carta = ana.locator('[data-testid="mano"] .carta-mano.jugable').first();
  await carta.click({ position: { x: 8, y: 8 } });
  await ana.getByTestId('mesa').click();
  const opcion = ana.getByTestId('opcion-0');
  if (await opcion.isVisible().catch(() => false)) await opcion.click();
  await expect(luis.getByTestId('asiento-0')).toBeVisible();
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
  await expect(ana.locator('[data-testid="mano"] .carta-mano')).toHaveCount(2);
});

test('Five Hundred en red: la puja de uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'fiveHundred');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(10);

  // Puja Ana (asiento 0) y Luis ve su puja.
  await ana.getByTestId('puja-6-picas').click();
  await expect(luis.getByTestId('contrato-500')).toContainText('6 ♠');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Barbu en red: el contrato que elige uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'barbu');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(13);

  // Reparte Ana (asiento 0): elige el contrato y Luis lo ve.
  await ana.getByTestId('contrato-damas').click();
  await expect(luis.getByTestId('contrato-barbu')).toContainText('Sin damas');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Barbu con el número del dominó elegido en red: el número que elige uno lo ve el otro', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'barbu', (p) =>
    p.getByTestId('barbu-domino-elegido').check(),
  );
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(13);

  // Reparte Ana (asiento 0): elige el dominó y el 7, y Luis lo ve.
  await ana.getByTestId('contrato-domino').click();
  await expect(luis.getByTestId('aviso')).toContainText('elige');
  await ana.getByTestId('inicio-7').click();
  await expect(luis.getByTestId('contrato-barbu')).toHaveText('Dominó · número de salida: 7');
});

test('Klaverjas en red: lo que dice uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'klaverjas');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(8);

  // Dice Ana (asiento 0): juega con el palo propuesto y Luis ve el triunfo.
  await ana.getByTestId('jugar').click();
  await expect(luis.getByTestId('triunfo-klaverjas')).toBeVisible();
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Jass en red: el modo que elige uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'jass');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(9);

  // Elige Ana (asiento 0) y Luis ve el modo.
  await ana.getByTestId('modo-obenabe').click();
  await expect(luis.getByTestId('modo-jass')).toContainText('Obenabe');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Piquet en red: el cambio de uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'piquet');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(12);

  // Ana es mayor: descarta una carta y roba; a Luis le queda un montón de 7.
  await ana
    .locator('[data-testid="mano"] .carta-mano.jugable')
    .first()
    .click({ position: { x: 8, y: 8 } });
  await ana.getByTestId('mesa').click();
  await ana.getByTestId('robar').click();
  await expect(luis.getByTestId('cartas-mazo')).toContainText('7');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Sueca en red: la carta de uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'sueca');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(10);

  // Sale Ana (asiento 0) y Luis ve su carta en la mesa.
  const carta = ana.locator('[data-testid="mano"] .carta-mano.jugable').first();
  const id = await carta.getAttribute('data-carta');
  await carta.click({ position: { x: 8, y: 8 } });
  await ana.getByTestId('mesa').click();
  await expect(luis.getByTestId('mesa').locator(`[data-carta="${id}"]`)).toBeVisible();
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Tressette en red: la carta de uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'tressette');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(10);

  // Sale Ana (asiento 0) y Luis ve su carta en la mesa.
  const carta = ana.locator('[data-testid="mano"] .carta-mano.jugable').first();
  const id = await carta.getAttribute('data-carta');
  await carta.click({ position: { x: 8, y: 8 } });
  await ana.getByTestId('mesa').click();
  await expect(luis.getByTestId('mesa').locator(`[data-carta="${id}"]`)).toBeVisible();
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Schafkopf en red: lo que anuncia uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'schafkopf');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(8);

  // Anuncia primero Ana (asiento 0): pasa, y Luis lo ve junto a su asiento.
  await ana.getByTestId('pasar').click();
  await expect(luis.getByTestId('asiento-0')).toContainText('Paso');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Truco en red: la carta de uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'truco');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(3);

  // Sale Ana (asiento 0, mano) y Luis ve su carta en la mesa.
  const carta = ana.locator('[data-testid="mano"] .carta-mano.jugable').first();
  const id = await carta.getAttribute('data-carta');
  await carta.click({ position: { x: 8, y: 8 } });
  await ana.getByTestId('mesa').click();
  await expect(luis.getByTestId('mesa').locator(`[data-carta="${id}"]`)).toBeVisible();
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Écarté en red: lo que decide uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'ecarte');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(5);

  // Ana (asiento 0, mano) propone y Luis tiene que aceptar o rehusar.
  await ana.getByTestId('proponer').click();
  await expect(luis.getByTestId('aceptar')).toBeVisible();
  await luis.getByTestId('rehusar').click();
  await expect(ana.getByTestId('autoridad')).toContainText('Luis');
  await expect(luis.getByTestId('autoridad')).toBeVisible();
});

test('Pishti en red: la carta de uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'pishti');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(4);

  // Ana (asiento 0) echa su primera carta y Luis ve el montón cambiar.
  const carta = ana.locator('[data-testid="mano"] .carta-mano.jugable').first();
  const id = await carta.getAttribute('data-carta');
  await carta.click({ position: { x: 8, y: 8 } });
  await ana.getByTestId('mesa').click();
  await expect(ana.locator('[data-testid="mano"] .carta-mano')).toHaveCount(3);
  await expect(luis.getByTestId('ultima-jugada')).toHaveAttribute('data-ultima', id!);
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Cuarenta en red: la carta de uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'cuarenta');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(5);

  // Ana (asiento 0) deja su primera carta en la mesa y Luis la ve.
  const carta = ana.locator('[data-testid="mano"] .carta-mano.jugable').first();
  const id = await carta.getAttribute('data-carta');
  await carta.click({ position: { x: 8, y: 8 } });
  await ana.getByTestId('mesa').click();
  const dejar = ana.getByTestId('opcion-dejar');
  if (await dejar.isVisible().catch(() => false)) await dejar.click();
  await expect(luis.getByTestId(`mesa-${id}`)).toBeVisible();
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
  await expect(ana.locator('[data-testid="mano"] .carta-mano')).toHaveCount(4);
});

test('Préférence en red: lo que puja uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'preference');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(10);

  // Puja primero Ana (asiento 0): pasa, y Luis lo ve junto a su asiento.
  await ana.getByTestId('pasar').click();
  await expect(luis.getByTestId('asiento-0')).toContainText('Paso');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Corazones de 3 en red: los dos ven la mesa de tres', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'corazones', (p) =>
    p.getByTestId('corazones-jugadores-3').check(),
  );
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(17);
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
  await expect(ana.getByTestId('asiento-3')).toHaveCount(0);
});

test('Bourré en red: lo que decide uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'bourre');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(5);

  // Decide primero Ana (asiento 0): pasa, y Luis lo ve junto a su asiento.
  await ana.getByTestId('pasar').click();
  await expect(luis.getByTestId('asiento-0')).toContainText('Pasa');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Rentz en red: el contrato que elige uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'rentz');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(8);

  // Elige primero Ana (asiento 0, que reparte): sin damas, y Luis lo ve.
  await ana.getByTestId('contrato-damas').click();
  await expect(luis.getByTestId('contrato-rentz')).toContainText('Sin damas');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Polignac en red: el general que pasa uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'polignac');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(8);

  // Reparte Ana (asiento 0): decide primero Luis. Pasa, pasan las IA y le toca a Ana.
  await luis.getByTestId('pasar-general').click();
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
  await ana.getByTestId('pasar-general').click();
  // Todos han pasado: sale Luis, el siguiente al que reparte.
  await expect(luis.locator('[data-testid="mano"] .carta-mano.jugable')).toHaveCount(8);
});

test('Polignac con el orden antiguo en red: los dos juegan con la opción', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'polignac', (p) =>
    p.getByTestId('polignac-orden-antiguo').check(),
  );
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(8);
  // La mano de Luis va ordenada con el orden antiguo: la J antes que el As del mismo palo.
  const cartas = await luis
    .locator('[data-testid="mano"] .carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')!));
  for (const palo of ['picas', 'corazones', 'diamantes', 'treboles']) {
    const j = cartas.indexOf(`${palo}-11`);
    const as = cartas.indexOf(`${palo}-1`);
    if (j >= 0 && as >= 0) expect(j).toBeLessThan(as);
  }
  await luis.getByTestId('pasar-general').click();
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Sheepshead en red: lo que decide uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'sheepshead');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(6);

  // Decide primero Ana (asiento 0): pasa, y Luis lo ve junto a su asiento.
  await ana.getByTestId('pasar').click();
  await expect(luis.getByTestId('asiento-0')).toContainText('Pasa');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Tysiącha en red: lo que puja uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'tysiacha');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(7);

  // Ana (asiento 0) abre con 100 y puja primero Luis: pasa, y Ana lo ve junto a su asiento.
  await expect(luis.getByTestId('pasar')).toBeVisible();
  await luis.getByTestId('pasar').click();
  await expect(ana.getByTestId('asiento-1')).toContainText('Paso');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Tarot en red: lo que dice uno en la subasta lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'tarot');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(18);

  // Habla primero Ana (asiento 0): pasa, y Luis lo ve junto a su nombre.
  await ana.getByTestId('pasar').click();
  await expect(luis.getByTestId('asiento-0')).toContainText('Pasa');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Doppelkopf en red: la reserva de uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'doppelkopf');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(12);

  // Sale Ana (asiento 0) y dice su reserva; Luis la ve junto a su nombre.
  const boton = ana.locator('[data-testid^="reserva-"]').first();
  const texto = (await boton.textContent())!.trim();
  await boton.click();
  await expect(luis.getByTestId('asiento-0')).toContainText(texto);
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Bezique en red: la carta de uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'bezique');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(8);

  // Sale Ana (asiento 0) y Luis ve su carta en la mesa.
  const carta = ana.locator('[data-testid="mano"] .carta-mano.jugable').first();
  const id = await carta.getAttribute('data-carta');
  await carta.click({ position: { x: 8, y: 8 } });
  await ana.getByTestId('mesa').click();
  await expect(luis.getByTestId('mesa').locator(`[data-carta="${id}"]`)).toBeVisible();
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Kings in the Corner en red: el pase de uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'kingsCorner');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.getByTestId('mazo')).toBeVisible();

  // Empieza Ana (asiento 0) con 8 cartas tras robar; pasa y Luis roba la suya.
  await expect(ana.locator('[data-testid="mano"] .carta-mano')).toHaveCount(8);
  await ana.getByTestId('pasar').click();
  await expect(luis.getByTestId('aviso')).toContainText('Ana pasa');
  await expect(luis.locator('[data-testid="mano"] .carta-mano')).toHaveCount(8);
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Pesca en red: la petición de uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'pesca');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.getByTestId('mar')).toBeVisible();

  // Empieza Ana (asiento 0): pide su primer valor a Luis y Luis ve la petición.
  await ana.locator('[data-testid^="valor-"]').first().click();
  await ana.getByTestId('asiento-1').click();
  await expect(luis.getByTestId('aviso')).toContainText('Ana te pide');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Bridge en red: la puja de uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'bridge');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(13);

  // Puja primero Ana (reparte el asiento 0) y Luis ve su puja en la subasta.
  await ana.getByTestId('puja-1-treboles').click();
  await expect(luis.getByTestId('subasta')).toContainText('1 ♣');
  await luis.getByTestId('puja-1-corazones').click();
  await expect(ana.getByTestId('subasta')).toContainText('1 ♥');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Whist en red: dos humanos juegan en la misma baza', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'whist');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(13);
  await expect(luis.getByTestId('triunfo')).toHaveText(
    await ana.getByTestId('triunfo').innerText(),
  );

  // Sale Ana (asiento 0) y después juega Luis (asiento 1); cada uno ve la carta del otro.
  for (const [p, otro] of [
    [ana, luis],
    [luis, ana],
  ] as const) {
    const carta = p.locator('[data-testid="mano"] .carta-mano.jugable').first();
    await carta.waitFor({ timeout: 30_000 });
    const id = await carta.getAttribute('data-carta');
    // La esquina de la carta queda a la vista aunque las cartas se solapen.
    await carta.click({ position: { x: 8, y: 8 } });
    await p.getByTestId('mesa').click();
    await expect(otro.getByTestId('mesa').locator(`[data-carta="${id}"]`)).toBeVisible();
  }
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Canasta en red: dos humanos roban y descartan', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'canasta');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(11);

  // Empieza Ana (asiento 0) y después Luis (asiento 1): cada uno roba y descarta su primera carta.
  for (const [p, otro] of [
    [ana, luis],
    [luis, ana],
  ] as const) {
    await p.getByTestId('robar').click({ timeout: 30_000 });
    const primera = p.locator('[data-testid="mano"] .carta-mano').first();
    const carta = await primera.getAttribute('data-carta');
    await primera.click({ position: { x: 6, y: 6 } });
    await p.getByTestId('descartar').click();
    // La IA del asiento siguiente puede jugar enseguida: la carta queda arriba o justo debajo, o
    // la IA se lleva el pozo.
    await expect(
      otro
        .getByTestId('pozo')
        .locator(`[data-carta="${carta}"]`)
        .or(otro.getByTestId('aviso').filter({ hasText: 'se lleva el pozo' }))
        .first(),
    ).toBeVisible();
  }
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Culo en red: dos humanos y una IA juegan una ronda', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'culo', (p) =>
    p.getByLabel('3 jugadores', { exact: true }).check(),
  );
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) {
    await expect(p.locator('[data-testid="mano"] [data-carta]')).not.toHaveCount(0);
  }
  // Los dos ven los mismos cargos y el mismo número de cartas de cada uno.
  await expect(ana.getByTestId('puesto-1')).toContainText('Luis');
  await expect(luis.getByTestId('info-mano')).toHaveText(
    await ana.getByTestId('info-mano').innerText(),
  );
  // Al primero de los dos al que le toque: si abre, juega su carta más baja y el otro la ve en la
  // mesa; si tiene que superar, pasa y el otro lo ve en el aviso.
  await expect(async () => {
    expect(
      (await ana.getByTestId('jugar').isVisible()) || (await luis.getByTestId('jugar').isVisible()),
    ).toBe(true);
  }).toPass({ timeout: 30_000 });
  const [p, otro, nombreP] = (await ana.getByTestId('jugar').isVisible())
    ? ([ana, luis, 'Ana'] as const)
    : ([luis, ana, 'Luis'] as const);
  if (await p.getByTestId('pasar').isVisible()) {
    await p.getByTestId('pasar').click();
    await expect(otro.getByTestId('aviso')).toContainText(`${nombreP} pasa`);
  } else {
    const carta = await p
      .locator('[data-testid="mano"] [data-carta]')
      .first()
      .getAttribute('data-carta');
    await p.locator('[data-testid="mano"] [data-carta]').first().click();
    await p.getByTestId('jugar').click();
    await expect(otro.getByTestId('mesa').locator(`[data-carta="${carta}"]`)).toBeVisible();
  }
});

test('Texas Hold’em en red: dos humanos igualan y ven el flop', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'holdem', (p) =>
    p.getByLabel('2 jugadores', { exact: true }).check(),
  );
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] [data-carta]')).toHaveCount(2);

  // Con 2 jugadores, Ana tiene el botón y habla primero: iguala la ciega grande.
  await ana.getByTestId('igualar').click();
  await expect(luis.getByTestId('apuesta-0')).toHaveText('apuesta 2');
  await luis.getByTestId('pasar').click();
  // Se descubre el flop para los dos.
  for (const p of [ana, luis]) {
    await expect(p.getByTestId('comunes').locator('[data-carta]')).toHaveCount(3);
  }
  await expect(ana.getByTestId('puesto-1')).toContainText('Luis');
});

test('Póker de cinco cartas en red: lo que cambia uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'pokerCinco', (p) =>
    p.getByTestId('poker-cinco-jugadores-2').check(),
  );
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] [data-carta]')).toHaveCount(5);

  // Con 2 jugadores, Ana tiene el botón y habla primero: iguala, y Luis pasa.
  await ana.getByTestId('igualar').click();
  await luis.getByTestId('pasar').click();
  // Cambia primero Luis, el siguiente al botón: dos cartas, y Ana lo ve.
  const cartas = await luis
    .locator('[data-testid="mano"] [data-carta]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')!));
  await luis.getByTestId(`carta-${cartas[0]}`).click();
  await luis.getByTestId(`carta-${cartas[1]}`).click();
  await luis.getByTestId('cambiar').click();
  await expect(ana.getByTestId('cambio-1')).toHaveText('Cambia 2');
  await expect(ana.getByTestId('cambiar')).toBeVisible();
  await expect(ana.getByTestId('puesto-1')).toContainText('Luis');
});

test('Casita robada en red: la carta que juega uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'casitaRobada');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] [data-carta]')).toHaveCount(3);

  // Empieza Ana (asiento 0): juega una carta, y Luis ve lo que hizo.
  const carta = await ana
    .locator('[data-testid="mano"] [data-carta]')
    .first()
    .getAttribute('data-carta');
  await ana.getByTestId(`carta-${carta}`).click();
  if (await ana.getByTestId('panel-robo').isVisible()) await ana.getByTestId('no-robar').click();
  await expect(luis.getByTestId('aviso')).toContainText('Ana');
  await expect(luis.getByTestId('turno')).toHaveText('Tu turno: juega una carta');
  await expect(ana.getByTestId('puesto-1')).toContainText('Luis');
});

test('Burro de bazas en red: la carta con la que sale uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'burroBazas');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(4);

  // Reparte Ana (asiento 0): sale Luis, que puede echar cualquiera de sus 4 cartas.
  const jugables = luis.locator('[data-testid="mano"] .carta-mano.jugable');
  await expect(jugables).toHaveCount(4);
  const carta = await jugables.first().getAttribute('data-carta');
  await jugables.first().click({ position: { x: 6, y: 6 } });
  await luis.getByTestId('mesa').click();
  await expect(ana.locator(`[data-testid="mesa"] [data-carta="${carta}"]`)).toBeVisible();
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Manilla en red: la carta con la que sale uno la ve el otro, y los dos ven el pinte', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'manilla');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) {
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(12);
    await expect(p.getByTestId('triunfo-manilla')).toContainText('pinte');
  }

  // Reparte el asiento 3: sale Ana (asiento 0), que puede echar cualquiera de sus 12 cartas.
  const jugables = ana.locator('[data-testid="mano"] .carta-mano.jugable');
  await expect(jugables).toHaveCount(12);
  const carta = await jugables.first().getAttribute('data-carta');
  await jugables.first().click({ position: { x: 6, y: 6 } });
  await ana.getByTestId('mesa').click();
  await expect(luis.locator(`[data-testid="mesa"] [data-carta="${carta}"]`)).toBeVisible();
});

test('Tute gana-pierde en red: la carta con la que sale uno la ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'tuteGanaPierde');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) {
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(12);
    await expect(p.getByTestId('triunfo-gana-pierde')).toContainText('Sin triunfo');
  }

  // Reparte el asiento 2: sale Ana (asiento 0), que puede echar cualquiera de sus 12 cartas.
  const jugables = ana.locator('[data-testid="mano"] .carta-mano.jugable');
  await expect(jugables).toHaveCount(12);
  const carta = await jugables.first().getAttribute('data-carta');
  await jugables.first().click({ position: { x: 6, y: 6 } });
  await ana.getByTestId('mesa').click();
  await expect(luis.locator(`[data-testid="mesa"] [data-carta="${carta}"]`)).toBeVisible();
});

test('Remigio en red: dos humanos roban y descartan', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'remigio');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(7);

  // Cada uno roba del mazo y descarta su primera carta, dos veces.
  for (let ronda = 0; ronda < 2; ronda++) {
    for (const [p, otro] of [
      [ana, luis],
      [luis, ana],
    ] as const) {
      await expect(p.getByTestId('mazo')).toHaveClass(/robable/);
      await p.getByTestId('mazo').click();
      await expect(p.getByTestId('descartar')).toBeVisible();
      const primera = p.locator('[data-testid="mano"] .carta-mano').first();
      const carta = await primera.getAttribute('data-carta');
      await primera.click({ position: { x: 6, y: 6 } });
      await p.getByTestId('descartar').click();
      await expect(otro.getByTestId('monton')).toHaveAttribute('aria-label', /Robar del montón/);
      expect(carta).not.toBeNull();
    }
  }
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(7);
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Remigio de diez cartas en red: la sala empieza con la opción', async ({ browser }) => {
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'remigio', (p) => p.getByTestId('remigio-diez').check());
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) {
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(10);
    await expect(p.getByTestId('sin-ligar')).toBeVisible();
  }

  // Ana roba y ve «Cerrar» en lugar de «Bajar»; descarta y le toca a Luis.
  await ana.getByTestId('mazo').click();
  await expect(ana.getByTestId('cerrar')).toBeVisible();
  await expect(ana.getByTestId('bajar')).toHaveCount(0);
  await ana
    .locator('[data-testid="mano"] .carta-mano')
    .first()
    .click({ position: { x: 6, y: 6 } });
  await ana.getByTestId('descartar').click();
  await expect(luis.getByTestId('mazo')).toHaveClass(/robable/);
});

test('Brisca con señas en red: cada uno ve las de su compañero', async ({ browser }) => {
  const jugadores = await Promise.all([0, 1, 2, 3].map(() => jugador(browser)));
  const [ana, ...otros] = jugadores as [Page, ...Page[]];
  const codigo = await crearSala(ana, 'brisca', async (p) => {
    await p.getByLabel('4 jugadores en parejas').check();
    await p.getByTestId('opcion-senas').check();
  });
  for (const [i, p] of otros.entries()) await unirse(p, codigo, ['Luis', 'Eva', 'Juan'][i]!);
  await ana.getByTestId('empezar-red').click();
  for (const p of jugadores) await expect(p.getByTestId('senas')).toContainText('Señas:');
});

test('sin servidor, la pantalla de red lo dice', async ({ page }) => {
  await abrirRed(page, 'Ana');
  await page.locator('summary').click();
  await page.getByTestId('servidor').fill('ws://localhost:9');
  await page.getByTestId('crear-sala').click();
  await elegirJuegoDeSala(page, 'brisca');
  await page.getByTestId('empezar').click();
  await expect(page.getByTestId('aviso-red')).toHaveText('No se puede conectar con el servidor');
});

test('Tresillo en red: lo que puja uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'tresillo');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(9);

  // Puja primero Ana (asiento 0, el mano): pasa, y Luis lo ve junto a su asiento.
  await ana.getByTestId('pasar').click();
  await expect(luis.getByTestId('asiento-0')).toContainText('Paso');
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Conquián en red: lo que baja uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'conquian');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(10);

  // Decide primero Ana (asiento 0): pasa, y la carta se le ofrece a Luis.
  await ana.getByTestId('pasar').click();
  await expect(luis.getByTestId('rotulo-descubierta')).toContainText('para ti');
  await expect(luis.getByTestId('pasar')).toBeVisible();
});

test('Treinta y uno en red: lo que roba uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'treintaYUno');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(3);

  // Juega primero Ana (asiento 0): se planta, y Luis lo ve.
  await ana.getByTestId('plantarse').click();
  await expect(luis.getByTestId('aviso-plantado')).toContainText('Ana se ha plantado');
  await expect(luis.getByTestId('asiento-0')).toContainText('Plantado');
});

test('Treinta y uno con viuda en red: el cambio de uno lo ve el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'treintaYUno', (p) => p.getByTestId('opcion-viuda').check());
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="viuda"] [data-carta]')).toHaveCount(3);

  // Juega primero Ana (asiento 0): cambia las tres, y Luis ve en la viuda las cartas de Ana.
  const deAna = await ana
    .locator('[data-testid="mano"] [data-carta]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await ana.getByTestId('cambiar-todas').click();
  for (const c of deAna) {
    await expect(luis.locator(`[data-testid="viuda"] [data-carta="${c}"]`)).toBeVisible();
  }
  await expect(luis.getByTestId('aviso-viuda')).toContainText('Ana cambia las tres');
});

test('Siete y media con cartas tapadas en red: la tapada de uno no la ve el otro', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'sieteYMedia', (p) =>
    p.getByTestId('opcion-tapadas').check(),
  );
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();

  // Ana (asiento 0) es la banca: apuesta Luis y pide tapada; Ana ve una carta boca abajo más.
  await luis.getByTestId('apostar').click();
  await expect(luis.getByTestId('pedir-tapada')).toBeVisible();
  const antes = await ana.locator('[data-zona="mano-1"] .mini').count();
  await luis.getByTestId('pedir-tapada').click();
  await expect(ana.getByTestId('aviso')).toHaveText(/Luis (pide una carta tapada|se pasa)/);
  // La partida en red no tiene semilla fija: si Luis se pasa, la mano termina y sale el resumen.
  if ((await ana.getByTestId('aviso').textContent())?.includes('tapada')) {
    await expect(ana.locator('[data-zona="mano-1"] .mini')).toHaveCount(antes + 1);
    await expect(ana.locator('[data-zona="mano-1"] [data-carta]')).toHaveCount(0);
  } else {
    await expect(ana.getByTestId('panel-mano')).toBeVisible();
  }
});

test('Siete y media con el doble para cualquier siete y media en red: la sala empieza con la opción', async ({
  browser,
}) => {
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'sieteYMedia', (p) =>
    p.getByTestId('opcion-doble-cualquiera').check(),
  );
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();

  // Ana (asiento 0) es la banca: apuesta Luis y le toca pedir o plantarse.
  await luis.getByTestId('apostar').click();
  await expect(luis.getByTestId('plantarse')).toBeVisible();
  await expect(ana.getByTestId('aviso')).toContainText('Luis');
});

// ── Conexión robusta (spec partidas-en-red: conexiones muertas y segundo plano) ──

/**
 * Intercepta los sockets de un jugador. Con `cortada`, los mensajes no pasan en ningún sentido
 * (como una red que deja de transmitir sin cerrar el socket) y las conexiones nuevas fallan.
 */
async function redControlada(page: Page) {
  const red = {
    cortada: false,
    abiertos: [] as { close: () => Promise<void> }[],
    /** Deja muertas las conexiones abiertas sin cerrarlas (socket zombi); las nuevas funcionan. */
    zombis: () => muertas.push(...red.abiertos.splice(0)),
  };
  const muertas: unknown[] = [];
  await page.routeWebSocket(/:8787/, (ws) => {
    if (red.cortada) {
      void ws.close();
      return;
    }
    const servidor = ws.connectToServer();
    const pasa = () => !red.cortada && !muertas.includes(ws);
    ws.onMessage((m) => {
      if (pasa()) servidor.send(m);
    });
    servidor.onMessage((m) => {
      if (pasa()) ws.send(m);
    });
    red.abiertos.push(ws);
  });
  return red;
}

/** Brisca de dos humanos empezada; Luis juega con la red controlada. */
async function briscaEmpezada(browser: Browser) {
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const red = await redControlada(luis);
  const codigo = await crearSala(ana, 'brisca');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  await expect(luis.getByTestId('franja-red')).toBeVisible();
  return { ana, luis, red };
}

test('una red que deja de transmitir se detecta en menos de 30 s y se recupera el asiento', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const { luis, red } = await briscaEmpezada(browser);

  red.cortada = true;
  await expect(luis.getByText(T.red.reconectando)).toBeVisible({ timeout: 30_000 });

  red.cortada = false;
  await expect(luis.getByText(T.red.reconectando)).toBeHidden({ timeout: 20_000 });
  await expect(luis.getByTestId('jugador-1')).toContainText('Luis');
});

test('al volver del segundo plano reconecta al momento, sin esperar al siguiente intento', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const { luis, red } = await briscaEmpezada(browser);
  const visibilidad = (estado: 'hidden' | 'visible') =>
    luis.evaluate((e) => {
      Object.defineProperty(document, 'visibilityState', { value: e, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    }, estado);

  // La app pasa a segundo plano y el sistema le corta la conexión un buen rato: los intentos de
  // reconexión fallan y la espera entre ellos crece hasta 10 s.
  await visibilidad('hidden');
  red.cortada = true;
  for (const ws of red.abiertos.splice(0)) await ws.close();
  await expect(luis.getByText(T.red.reconectando)).toBeVisible();
  await luis.waitForTimeout(16_000);

  // Vuelve la red y el jugador abre la app: reconecta enseguida y sigue en su asiento.
  red.cortada = false;
  await visibilidad('visible');
  await expect(luis.getByText(T.red.reconectando)).toBeHidden({ timeout: 3000 });
  await expect(luis.getByTestId('jugador-1')).toContainText('Luis');
});

test('al volver con el socket zombi, el ping lo descubre y se ve la partida en el punto actual', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const { ana, luis, red } = await briscaEmpezada(browser);
  const visibilidad = (estado: 'hidden' | 'visible') =>
    luis.evaluate((e) => {
      Object.defineProperty(document, 'visibilityState', { value: e, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    }, estado);

  // Luis cambia de app y su socket queda abierto pero muerto; mientras, Ana juega su carta.
  await expect(ana.locator('.carta-mano.jugable').first()).toBeVisible();
  await visibilidad('hidden');
  red.zombis();
  await ana.locator('.carta-mano.jugable').first().click();
  await ana.getByTestId('mesa').click();
  await expect(ana.locator('.carta-mano')).toHaveCount(2);

  // Al volver, el ping no tiene respuesta: suelta el socket, reconecta y le toca jugar.
  await visibilidad('visible');
  await expect(luis.locator('.carta-mano.jugable').first()).toBeVisible({ timeout: 15_000 });
  await expect(luis.getByText(T.red.reconectando)).toBeHidden();
  await expect(luis.getByTestId('jugador-1')).toContainText('Luis');
});

test('Twenty-Nine en red: el triunfo es secreto para el otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'twentyNine');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(4);

  // Puja primero Ana (asiento 0): 28, y elige corazones; Luis ve que hay un triunfo oculto.
  await ana.getByTestId('puja-28').click();
  // Luis (asiento 1) no puede pujar más: pasa, y los asientos de la IA también.
  await luis.getByTestId('pasar').click();
  await ana.getByTestId('triunfo-corazones').click({ timeout: 30_000 });
  await expect(ana.getByTestId('triunfo-twenty')).toContainText('Corazones');
  await expect(luis.getByTestId('triunfo-twenty')).toContainText('oculto');
  await expect(luis.getByTestId('puja-twenty')).toContainText('Puja 28 de Ana');
});

test('Briscola Chiamata en red: la subasta pasa de un navegador al otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'briscolaChiamata');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(8);

  // Puja primero Ana (asiento 0) el As; a Luis ya no le sale el As, sí el 3.
  await ana.getByTestId('puja-0').click();
  await expect(luis.getByTestId('puja-1')).toBeVisible({ timeout: 30_000 });
  await expect(luis.getByTestId('puja-0')).toHaveCount(0);
  await luis.getByTestId('pasar').click();
  await expect(ana.getByTestId('asiento-1')).toContainText('Paso');
});

test('Hand and Foot en red: dos humanos roban 2 y descartan', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'handAndFoot');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(11);

  // Empieza Ana (asiento 0) y después Luis (asiento 1): cada uno roba 2 y descarta su primera carta.
  for (const p of [ana, luis]) {
    await p.getByTestId('robar').click({ timeout: 30_000 });
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(13);
    await p
      .locator('[data-testid="mano"] .carta-mano')
      .first()
      .click({ position: { x: 6, y: 6 } });
    await p.getByTestId('descartar').click();
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(12);
  }
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
  await expect(ana.getByTestId('asiento-1')).toContainText('pie de 11');
});

test('Cuarenta y tres en red: los dos ven la misma muestra y la carta con la que se sale', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'cuarentaYTres');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) {
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(13);
  }
  const muestra = await ana.getByTestId('muestra').getAttribute('data-carta');
  await expect(luis.getByTestId('muestra')).toHaveAttribute('data-carta', muestra!);

  // Reparte el asiento 2: sale Ana (asiento 0), que puede echar cualquiera de sus 13 cartas.
  const jugables = ana.locator('[data-testid="mano"] .carta-mano.jugable');
  await expect(jugables).toHaveCount(13);
  const carta = await jugables.first().getAttribute('data-carta');
  await jugables.first().click({ position: { x: 6, y: 6 } });
  await ana.getByTestId('mesa').click();
  await expect(luis.locator(`[data-testid="mesa"] [data-carta="${carta}"]`)).toBeVisible();
});

test('Cuatro seises en red: la carta que pone uno la ve el otro en su fila', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'cuatroSeises');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) {
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(10);
    await expect(p.getByTestId('fondo-cuatro-seises')).toHaveText('Fondo: 4 fichas');
  }
  // Abre quien tiene el 6 de oros: si es uno de los dos, lo juega; los dos lo ven en su fila.
  for (const p of [ana, luis]) {
    const seis = p.locator('.carta-mano.jugable[data-carta="oros-6"]');
    if ((await seis.count()) > 0) {
      await seis.click({ position: { x: 6, y: 8 } });
      await p.getByTestId('mesa').click();
    }
  }
  for (const p of [ana, luis]) {
    await expect(p.getByTestId('fila-oros').locator('[data-carta="oros-6"]')).toBeVisible({
      timeout: 30_000,
    });
  }
});
