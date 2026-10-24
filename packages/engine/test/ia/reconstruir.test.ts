import { iaBriscaBasica } from '../../src/ia/brisca-basica';
import { reconstruirBrisca } from '../../src/ia/reconstruir/brisca';
import { reconstruirTute } from '../../src/ia/reconstruir/tute';
import { iaTuteBasica } from '../../src/ia/tute-basica';
import { brisca, CONFIG_BRISCA_POR_DEFECTO } from '../../src/juegos/brisca';
import { CONFIG_TUTE_POR_DEFECTO, tute } from '../../src/juegos/tute';
import { iaGuinoteBasica } from '../../src/ia/guinote-basica';
import { reconstruirGuinote } from '../../src/ia/reconstruir/guinote';
import { CONFIG_GUINOTE_POR_DEFECTO, guinote } from '../../src/juegos/guinote';
import { iaEscobaBasica } from '../../src/ia/escoba-basica';
import { reconstruirEscoba } from '../../src/ia/reconstruir/escoba';
import { CONFIG_ESCOBA_POR_DEFECTO, escoba } from '../../src/juegos/escoba';
import { iaChinchonBasica } from '../../src/ia/chinchon-basica';
import { reconstruirChinchon } from '../../src/ia/reconstruir/chinchon';
import { chinchon, CONFIG_CHINCHON_POR_DEFECTO } from '../../src/juegos/chinchon';
import { reconstruirSieteYMedia } from '../../src/ia/reconstruir/siete-y-media';
import { iaSieteYMediaBasica } from '../../src/ia/siete-y-media-basica';
import { CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, sieteYMedia } from '../../src/juegos/siete-y-media';
import { iaCinquilloBasica } from '../../src/ia/cinquillo-basica';
import { iaOchoLocoBasica } from '../../src/ia/ocho-loco-basica';
import { iaPicasBasica } from '../../src/ia/picas-basica';
import { iaBlackjackBasica } from '../../src/ia/blackjack-basica';
import { reconstruirBlackjack } from '../../src/ia/reconstruir/blackjack';
import { blackjack, CONFIG_BLACKJACK_POR_DEFECTO } from '../../src/juegos/blackjack';
import { iaGinRummyBasica } from '../../src/ia/gin-rummy-basica';
import { reconstruirGinRummy } from '../../src/ia/reconstruir/gin-rummy';
import { CONFIG_GIN_RUMMY_POR_DEFECTO, ginRummy } from '../../src/juegos/gin-rummy';
import { iaRummy500Basica } from '../../src/ia/rummy-500-basica';
import { reconstruirRummy500 } from '../../src/ia/reconstruir/rummy-500';
import { CONFIG_RUMMY_500_POR_DEFECTO, rummy500 } from '../../src/juegos/rummy-500';
import { iaCuloBasica } from '../../src/ia/culo-basica';
import { reconstruirCulo } from '../../src/ia/reconstruir/culo';
import { CONFIG_CULO_POR_DEFECTO, culo } from '../../src/juegos/culo';
import { reconstruirPicas } from '../../src/ia/reconstruir/picas';
import { CONFIG_PICAS_POR_DEFECTO, picas } from '../../src/juegos/picas';
import { reconstruirOchoLoco } from '../../src/ia/reconstruir/ocho-loco';
import { CONFIG_OCHO_LOCO_POR_DEFECTO, ochoLoco } from '../../src/juegos/ocho-loco';
import { reconstruirCinquillo } from '../../src/ia/reconstruir/cinquillo';
import { cinquillo, CONFIG_CINQUILLO_POR_DEFECTO } from '../../src/juegos/cinquillo';
import { iaPochaBasica } from '../../src/ia/pocha-basica';
import { reconstruirPocha } from '../../src/ia/reconstruir/pocha';
import { CONFIG_POCHA_POR_DEFECTO, pocha } from '../../src/juegos/pocha';
import { iaMusBasica } from '../../src/ia/mus-basica';
import { reconstruirMus } from '../../src/ia/reconstruir/mus';
import { CONFIG_MUS_POR_DEFECTO, mus, pares, tieneJuego } from '../../src/juegos/mus';
import { describe, expect, it } from 'vitest';
import { crearAzar, Generador } from '../../src/baraja/azar';
import { iaCorazonesBasica } from '../../src/ia/corazones-basica';
import { reconstruirCorazones } from '../../src/ia/reconstruir/corazones';
import { CONFIG_CORAZONES_POR_DEFECTO, corazones } from '../../src/juegos/corazones';
import { iaPinacleBasica } from '../../src/ia/pinacle-basica';
import { reconstruirPinacle } from '../../src/ia/reconstruir/pinacle';
import { CONFIG_PINACLE_POR_DEFECTO, pinacle } from '../../src/juegos/pinacle';
import { iaButifarraBasica } from '../../src/ia/butifarra-basica';
import { fallosConocidos, reconstruirButifarra } from '../../src/ia/reconstruir/butifarra';
import { butifarra, CONFIG_BUTIFARRA_POR_DEFECTO } from '../../src/juegos/butifarra';
import { paloDe } from '../../src/motor/bazas';
import { iaTrucBasica } from '../../src/ia/truc-basica';
import { reconstruirTruc } from '../../src/ia/reconstruir/truc';
import { CONFIG_TRUC_POR_DEFECTO, puntosEnvit, truc } from '../../src/juegos/truc';
import { iaJulepeBasica } from '../../src/ia/julepe-basica';
import { fallosJulepe, reconstruirJulepe } from '../../src/ia/reconstruir/julepe';
import { CONFIG_JULEPE_POR_DEFECTO, julepe } from '../../src/juegos/julepe';
import { iaRemigioBasica } from '../../src/ia/remigio-basica';
import { reconstruirRemigio } from '../../src/ia/reconstruir/remigio';
import { reconstruirTuteSubastado } from '../../src/ia/reconstruir/tute-subastado';
import { prohibidasCuatrola, reconstruirCuatrola } from '../../src/ia/reconstruir/cuatrola';
import { iaCuatrolaBasica } from '../../src/ia/cuatrola-basica';
import { cuatrola } from '../../src/juegos/cuatrola';
import { iaTuteSubastadoBasica } from '../../src/ia/tute-subastado-basica';
import { tuteSubastado } from '../../src/juegos/tute-subastado';
import { CONFIG_REMIGIO_POR_DEFECTO, remigio } from '../../src/juegos/remigio';
import { describirReconstruccion } from '../contrato/verificar-reconstruccion';

// Una suite por juego (spec niveles-ia: reconstrucción de las cartas ocultas).

describirReconstruccion(brisca, reconstruirBrisca, {
  configs: [
    CONFIG_BRISCA_POR_DEFECTO,
    { jugadores: 4, cambioMuestra: 'trasGanarBaza', arrastreFinal: true, manos: 3 },
  ],
  base: iaBriscaBasica,
});

describirReconstruccion(tute, reconstruirTute, {
  configs: [CONFIG_TUTE_POR_DEFECTO, { ...CONFIG_TUTE_POR_DEFECTO, jugadores: 4, manos: 3 }],
  base: iaTuteBasica,
});

describirReconstruccion(guinote, reconstruirGuinote, {
  configs: [
    CONFIG_GUINOTE_POR_DEFECTO,
    { jugadores: 4, cambioSiete: 'libre', montarSobreCompanero: true, meta: 51 },
  ],
  base: iaGuinoteBasica,
});

describirReconstruccion(escoba, reconstruirEscoba, {
  configs: [
    CONFIG_ESCOBA_POR_DEFECTO,
    { jugadores: 4, puntosPartida: 15, capturaObligatoria: true, escobaInicial: false },
  ],
  base: iaEscobaBasica,
});

describirReconstruccion(chinchon, reconstruirChinchon, {
  configs: [
    CONFIG_CHINCHON_POR_DEFECTO,
    { jugadores: 4, baraja: 'espanola48', comodines: false, limite: 50, cierreMaximo: 5 },
  ],
  base: iaChinchonBasica,
  // Las acciones legales del Chinchón son caras (cada cierre busca combinaciones).
  partidas: 3,
  pasosMaximos: 300,
  pasosFinales: 300,
});

describirReconstruccion(sieteYMedia, reconstruirSieteYMedia, {
  configs: [
    CONFIG_SIETE_Y_MEDIA_POR_DEFECTO,
    {
      jugadores: 4,
      manos: 5,
      fichasIniciales: 20,
      apuestaMaxima: 5,
      pagoDoble: false,
      cambioBanca: 'sieteYMedia',
    },
  ],
  base: iaSieteYMediaBasica,
});

describirReconstruccion(cinquillo, reconstruirCinquillo, {
  configs: [CONFIG_CINQUILLO_POR_DEFECTO, { jugadores: 3, manos: 1 }, { jugadores: 2, manos: 1 }],
  base: iaCinquilloBasica,
});

describirReconstruccion(pocha, reconstruirPocha, {
  configs: [
    CONFIG_POCHA_POR_DEFECTO,
    { jugadores: 3, duracion: 'completa', restriccionRepartidor: false },
  ],
  base: iaPochaBasica,
});

describirReconstruccion(mus, reconstruirMus, {
  configs: [CONFIG_MUS_POR_DEFECTO, { reyes: 4, puntos: 30, juegos: 1 }],
  base: iaMusBasica,
});

describe('reconstrucción del Mus', () => {
  it('las manos ajenas cuadran con lo declarado de pares y juego', () => {
    let revisadas = 0;
    for (let i = 0; i < 300; i++) {
      const creado = mus.crear(CONFIG_MUS_POR_DEFECTO, `declaraciones-${i}`);
      if (!creado.ok) throw new Error(creado.error);
      let e = creado.valor;
      // Se corta el mus para llegar a los lances, y se pasa hasta el lance de Juego.
      for (let paso = 0; paso < 40 && e.declaraciones.juego === null; paso++) {
        const t = e.turno;
        const acciones = mus.accionesLegales(e, t);
        if (acciones.length === 0) break;
        const accion =
          acciones.find((a) => a.tipo === 'cortar') ??
          acciones.find((a) => a.tipo === 'paso') ??
          acciones.find((a) => a.tipo === 'noQuiero') ??
          acciones[0]!;
        e = mus.transicion(e, t, accion);
      }
      const { pares: conPares, juego: conJuego } = e.declaraciones;
      if (conPares === null || mus.resultado(e) !== null) continue;
      const r = reconstruirMus(mus.vistaDe(e, 0), crearAzar(`mus-${i}`));
      for (let a = 1; a < 4; a++) {
        expect(pares(r.manos[a]!, 8) !== null).toBe(conPares[a]);
        if (conJuego) expect(tieneJuego(r.manos[a]!, 8)).toBe(conJuego[a]);
      }
      revisadas++;
    }
    expect(revisadas).toBeGreaterThan(50);
  });
});

describirReconstruccion(corazones, reconstruirCorazones, {
  configs: [CONFIG_CORAZONES_POR_DEFECTO, { pase: false, fin: 50 }],
  base: iaCorazonesBasica,
  partidas: 4,
});

describirReconstruccion(pinacle, reconstruirPinacle, {
  configs: [CONFIG_PINACLE_POR_DEFECTO, { jugadores: 4 }],
  base: iaPinacleBasica,
  partidas: 3,
  pasosMaximos: 600,
});

describirReconstruccion(butifarra, reconstruirButifarra, {
  configs: [CONFIG_BUTIFARRA_POR_DEFECTO, { objetivo: 51 }],
  base: iaButifarraBasica,
  partidas: 4,
});

describe('reconstrucción de la Butifarra', () => {
  it('quien no siguió el palo no lo tiene, y quien no falló pudiendo no tiene triunfos', () => {
    const fallos = fallosConocidos(
      [
        [
          { asiento: 0, carta: 'copas-2' },
          { asiento: 1, carta: 'espadas-4' },
          { asiento: 2, carta: 'oros-3' },
          { asiento: 3, carta: 'bastos-5' },
        ],
      ],
      'oros',
    );
    expect([...fallos[1]!].sort()).toEqual(['copas', 'oros']);
    expect([...fallos[2]!]).toEqual(['copas']);
    // La baza la ganaba un rival (el 2, con triunfo): estaba obligado a fallar.
    expect([...fallos[3]!].sort()).toEqual(['copas', 'oros']);
    // Si la baza es del compañero, no fallar no dice nada de sus triunfos.
    const conCompanero = fallosConocidos(
      [
        [
          { asiento: 0, carta: 'copas-9' },
          { asiento: 1, carta: 'copas-2' },
          { asiento: 2, carta: 'bastos-4' },
        ],
      ],
      'oros',
    );
    expect([...conCompanero[2]!]).toEqual(['copas']);
  });

  it('las manos reconstruidas respetan los fallos vistos en la mano', () => {
    let revisadas = 0;
    for (let i = 0; i < 200; i++) {
      const creado = butifarra.crear(CONFIG_BUTIFARRA_POR_DEFECTO, `fallos-${i}`);
      if (!creado.ok) throw new Error(creado.error);
      let e = creado.valor;
      const g = new Generador(crearAzar(`fallos-${i}/g`));
      const pasos = 10 + g.enteroHasta(36);
      for (let paso = 0; paso < pasos && e.resultadosManos.length === 0; paso++) {
        const acciones = butifarra.accionesLegales(e, e.turno);
        e = butifarra.transicion(e, e.turno, acciones[g.enteroHasta(acciones.length)]!);
      }
      if (e.resultadosManos.length > 0 || e.fase !== 'jugar') continue;
      const vista = butifarra.vistaDe(e, 0);
      const fallos = fallosConocidos(
        [...vista.bazasJugadas.map((b) => b.cartas), vista.mesa],
        vista.eleccion!.triunfo,
      );
      for (let k = 0; k < 5; k++) {
        const r = reconstruirButifarra(vista, crearAzar(`fallos-${i}/${k}`));
        for (let a = 1; a < 4; a++) {
          for (const c of r.manos[a]!) expect(fallos[a]!.has(paloDe(c))).toBe(false);
        }
      }
      if (fallos.some((f) => f.size > 0)) revisadas++;
    }
    expect(revisadas).toBeGreaterThan(50);
  });
});

describirReconstruccion(truc, reconstruirTruc, {
  configs: [CONFIG_TRUC_POR_DEFECTO, { jugadores: 4, cames: 1 }],
  base: iaTrucBasica,
});

describe('reconstrucción del Truc', () => {
  it('las manos ajenas dan los puntos de envit que se mostraron', () => {
    let revisadas = 0;
    for (let i = 0; i < 200; i++) {
      const jugadores = i % 2 === 0 ? 2 : 4;
      const creado = truc.crear({ jugadores, cames: 1 }, `envit-${i}`);
      if (!creado.ok) throw new Error(creado.error);
      let e = creado.valor;
      e = truc.transicion(e, 0, { tipo: 'envidar' });
      e = truc.transicion(e, 1, { tipo: 'vull' });
      const vista = truc.vistaDe(e, 0);
      for (let k = 0; k < 3; k++) {
        const r = reconstruirTruc(vista, crearAzar(`envit-${i}/${k}`));
        vista.envit.mostrado.forEach((p, a) => {
          if (p !== null && a !== 0) expect(puntosEnvit(r.manos[a]!)).toBe(p);
        });
      }
      revisadas++;
    }
    expect(revisadas).toBe(200);
  });
});

describirReconstruccion(julepe, reconstruirJulepe, {
  configs: [CONFIG_JULEPE_POR_DEFECTO, { jugadores: 6, manos: 6 }, { jugadores: 3, manos: 6 }],
  base: iaJulepeBasica,
  partidas: 4,
});

describe('reconstrucción del Julepe', () => {
  it('la carta de triunfo sigue en la mano del repartidor y se respetan los fallos', () => {
    let revisadas = 0;
    for (let i = 0; i < 150; i++) {
      const creado = julepe.crear({ jugadores: 4, manos: 6 }, `julepe-${i}`);
      if (!creado.ok) throw new Error(creado.error);
      let e = creado.valor;
      const g = new Generador(crearAzar(`julepe-${i}/g`));
      const pasos = 6 + g.enteroHasta(16);
      for (let paso = 0; paso < pasos && e.resultadosManos.length === 0; paso++) {
        const acciones = julepe.accionesLegales(e, e.turno);
        e = julepe.transicion(e, e.turno, acciones[g.enteroHasta(acciones.length)]!);
      }
      if (e.resultadosManos.length > 0) continue;
      const vista = julepe.vistaDe(e, 0);
      const fallos = fallosJulepe(
        [...vista.bazasJugadas.map((b) => b.cartas), vista.mesa],
        vista.triunfo,
        4,
      );
      const r = reconstruirJulepe(vista, crearAzar(`julepe-${i}/r`));
      if (vista.cartaTriunfo !== null)
        expect(r.manos[vista.repartidor]).toContain(vista.cartaTriunfo);
      for (let a = 1; a < 4; a++) {
        for (const c of r.manos[a]!) expect(fallos[a]!.has(paloDe(c))).toBe(false);
      }
      revisadas++;
    }
    expect(revisadas).toBeGreaterThan(50);
  });
});

describirReconstruccion(remigio, reconstruirRemigio, {
  configs: [CONFIG_REMIGIO_POR_DEFECTO, { jugadores: 4 }],
  base: iaRemigioBasica,
  partidas: 3,
  pasosMaximos: 400,
});

describirReconstruccion(tuteSubastado, reconstruirTuteSubastado, {
  configs: [{ manos: 4 }],
  base: iaTuteSubastadoBasica,
  partidas: 3,
  pasosMaximos: 400,
});

describe('reconstrucción del Tute subastado', () => {
  it('ningún rival recibe un palo que se sabe que no tiene', () => {
    let revisadas = 0;
    for (let i = 0; i < 40; i++) {
      const creado = tuteSubastado.crear({ manos: 4 }, `subastado-${i}`);
      if (!creado.ok) throw new Error(creado.error);
      let e = creado.valor;
      const g = new Generador(crearAzar(`subastado-${i}/g`));
      for (let paso = 0; paso < 30 + g.enteroHasta(30); paso++) {
        const acciones = tuteSubastado.accionesLegales(e, e.turno);
        if (acciones.length === 0) break;
        e = tuteSubastado.transicion(e, e.turno, acciones[g.enteroHasta(acciones.length)]!);
      }
      if (e.fase !== 'bazas') continue;
      const vista = tuteSubastado.vistaDe(e, 0);
      const fallos = fallosJulepe(
        [...vista.bazasMano.map((b) => b.cartas), vista.mesa],
        vista.triunfo!,
        4,
      );
      const r = reconstruirTuteSubastado(vista, crearAzar(`subastado-${i}/r`));
      for (let a = 1; a < 4; a++) {
        for (const c of r.manos[a]!) expect(fallos[a]!.has(paloDe(c))).toBe(false);
      }
      revisadas++;
    }
    expect(revisadas).toBeGreaterThan(20);
  });
});

describirReconstruccion(cuatrola, reconstruirCuatrola, {
  configs: [{ manos: 4 }],
  base: iaCuatrolaBasica,
  partidas: 3,
  pasosMaximos: 400,
});

describe('reconstrucción de la Cuatrola', () => {
  it('respeta lo que se sabe de cada mano y la carta llamada', () => {
    let revisadas = 0;
    for (let i = 0; i < 60; i++) {
      const creado = cuatrola.crear({ manos: 4 }, `cuatrola-${i}`);
      if (!creado.ok) throw new Error(creado.error);
      let e = creado.valor;
      const g = new Generador(crearAzar(`cuatrola-${i}/g`));
      for (let paso = 0; paso < 10 + g.enteroHasta(40); paso++) {
        const acciones = cuatrola.accionesLegales(e, e.turno);
        if (acciones.length === 0) break;
        e = cuatrola.transicion(e, e.turno, acciones[g.enteroHasta(acciones.length)]!);
      }
      if (e.fase !== 'bazas') continue;
      const yo = [0, 1, 2, 3].find((a) => a !== e.jugador && a !== e.companero)!;
      const vista = cuatrola.vistaDe(e, yo);
      const prohibidas = prohibidasCuatrola(
        [...vista.bazasMano.map((b) => b.cartas), vista.mesa],
        vista.triunfo!,
      );
      // Lo que se deduce nunca contradice el estado real.
      for (let a = 0; a < 4; a++) {
        for (const c of e.manos[a]!) expect(prohibidas[a]!.has(c)).toBe(false);
      }
      const r = reconstruirCuatrola(vista, crearAzar(`cuatrola-${i}/r`));
      for (let a = 0; a < 4; a++) {
        if (a === yo) continue;
        for (const c of r.manos[a]!) expect(prohibidas[a]!.has(c)).toBe(false);
      }
      if (e.llamada !== null) expect(r.manos[e.jugador!]).not.toContain(e.llamada);
      expect(cuatrola.vistaDe(r, yo)).toEqual(vista);
      revisadas++;
    }
    expect(revisadas).toBeGreaterThan(20);
  });
});

describirReconstruccion(ochoLoco, reconstruirOchoLoco, {
  configs: [CONFIG_OCHO_LOCO_POR_DEFECTO, { jugadores: 2 }, { jugadores: 5 }],
  base: iaOchoLocoBasica,
});

describirReconstruccion(picas, reconstruirPicas, {
  configs: [CONFIG_PICAS_POR_DEFECTO],
  base: iaPicasBasica,
});

describirReconstruccion(blackjack, reconstruirBlackjack, {
  configs: [CONFIG_BLACKJACK_POR_DEFECTO, { jugadores: 4, manos: 5 }],
  base: iaBlackjackBasica,
});

describirReconstruccion(ginRummy, reconstruirGinRummy, {
  configs: [CONFIG_GIN_RUMMY_POR_DEFECTO],
  base: iaGinRummyBasica,
});

describirReconstruccion(rummy500, reconstruirRummy500, {
  configs: [CONFIG_RUMMY_500_POR_DEFECTO, { jugadores: 4 }],
  base: iaRummy500Basica,
});

describirReconstruccion(culo, reconstruirCulo, {
  configs: [CONFIG_CULO_POR_DEFECTO, { jugadores: 3 }, { jugadores: 6 }],
  base: iaCuloBasica,
  pasosMaximos: 500,
});

describe('Reconstrucción del Culo', () => {
  it('lo que el presidente devolvió y el culo no ha jugado sigue en la mano del culo', () => {
    // Juega la primera mano con la básica hasta el intercambio.
    const e = culo.crear(CONFIG_CULO_POR_DEFECTO, 'reconstruir-culo');
    if (!e.ok) throw new Error(e.error);
    let estado = e.valor;
    let azar = crearAzar('x');
    while (estado.resultadosManos.length === 0) {
      const acciones = culo.accionesLegales(estado, estado.turno);
      const d = iaCuloBasica.decidir(culo.vistaDe(estado, estado.turno), acciones, azar);
      azar = d.azar;
      estado = culo.transicion(estado, estado.turno, d.accion);
    }
    const presidente = estado.turno;
    const devueltas = estado.manos[presidente]!.slice(0, 2);
    estado = culo.transicion(estado, presidente, { tipo: 'devolver', cartas: devueltas });
    const culoAsiento = estado.intercambios[0]!.da;
    const g = new Generador(crearAzar('culo'));
    for (let i = 0; i < 10; i++) {
      const r = reconstruirCulo(culo.vistaDe(estado, presidente), g.estado());
      g.enteroHasta(1000);
      expect(r.manos[culoAsiento]).toEqual(expect.arrayContaining(devueltas));
    }
  });
});
