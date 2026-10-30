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
import { iaCanastaBasica } from '../../src/ia/canasta-basica';
import { reconstruirCanasta } from '../../src/ia/reconstruir/canasta';
import { canasta, CONFIG_CANASTA_POR_DEFECTO } from '../../src/juegos/canasta';
import { iaWhistBasica } from '../../src/ia/whist-basica';
import { reconstruirWhist } from '../../src/ia/reconstruir/whist';
import { CONFIG_WHIST_POR_DEFECTO, whist } from '../../src/juegos/whist';
import { iaSevensBasica } from '../../src/ia/sevens-basica';
import { reconstruirSevens } from '../../src/ia/reconstruir/sevens';
import { CONFIG_SEVENS_POR_DEFECTO, sevens } from '../../src/juegos/sevens';
import { iaCasinoBasica } from '../../src/ia/casino-basica';
import { reconstruirCasino } from '../../src/ia/reconstruir/casino';
import { casino, CONFIG_CASINO_POR_DEFECTO, type EstadoCasino } from '../../src/juegos/casino';
import { iaDurakBasica } from '../../src/ia/durak-basica';
import { reconstruirDurak } from '../../src/ia/reconstruir/durak';
import { CONFIG_DURAK_POR_DEFECTO, durak } from '../../src/juegos/durak';
import { iaEuchreBasica } from '../../src/ia/euchre-basica';
import { reconstruirEuchre } from '../../src/ia/reconstruir/euchre';
import { CONFIG_EUCHRE_POR_DEFECTO, euchre } from '../../src/juegos/euchre';
import { iaBigTwoBasica } from '../../src/ia/big-two-basica';
import { reconstruirBigTwo } from '../../src/ia/reconstruir/big-two';
import { bigTwo, CONFIG_BIG_TWO_POR_DEFECTO } from '../../src/juegos/big-two';
import { iaCribbageBasica } from '../../src/ia/cribbage-basica';
import { reconstruirCribbage } from '../../src/ia/reconstruir/cribbage';
import { CONFIG_CRIBBAGE_POR_DEFECTO, cribbage } from '../../src/juegos/cribbage';
import { iaBeloteBasica } from '../../src/ia/belote-basica';
import { reconstruirBelote } from '../../src/ia/reconstruir/belote';
import { belote, CONFIG_BELOTE_POR_DEFECTO, esReyODamaDelTriunfo } from '../../src/juegos/belote';
import { iaSchnapsenBasica } from '../../src/ia/schnapsen-basica';
import { reconstruirSchnapsen } from '../../src/ia/reconstruir/schnapsen';
import { iaSkatBasica } from '../../src/ia/skat-basica';
import { reconstruirSkat } from '../../src/ia/reconstruir/skat';
import { CONFIG_SKAT_POR_DEFECTO, skat } from '../../src/juegos/skat';
import { iaOhHellBasica } from '../../src/ia/oh-hell-basica';
import { reconstruirOhHell } from '../../src/ia/reconstruir/oh-hell';
import { CONFIG_OH_HELL_POR_DEFECTO, ohHell } from '../../src/juegos/oh-hell';
import { iaSpiteMaliceBasica } from '../../src/ia/spite-malice-basica';
import { reconstruirSpiteMalice } from '../../src/ia/reconstruir/spite-malice';
import { CONFIG_SPITE_MALICE_POR_DEFECTO, spiteMalice } from '../../src/juegos/spite-malice';
import { iaBridgeBasica } from '../../src/ia/bridge-basica';
import { reconstruirBridge } from '../../src/ia/reconstruir/bridge';
import { bridge, CONFIG_BRIDGE_POR_DEFECTO, type EstadoBridge } from '../../src/juegos/bridge';
import { iaPescaBasica } from '../../src/ia/pesca-basica';
import { reconstruirPesca } from '../../src/ia/reconstruir/pesca';
import { CONFIG_PESCA_POR_DEFECTO, pesca, type EstadoPesca } from '../../src/juegos/pesca';
import { iaKingsCornerBasica } from '../../src/ia/kings-corner-basica';
import { reconstruirKingsCorner } from '../../src/ia/reconstruir/kings-corner';
import { CONFIG_KINGS_CORNER_POR_DEFECTO, kingsCorner } from '../../src/juegos/kings-corner';
import { iaBeziqueBasica } from '../../src/ia/bezique-basica';
import { reconstruirBezique } from '../../src/ia/reconstruir/bezique';
import { bezique, type EstadoBezique } from '../../src/juegos/bezique';
import { iaDoppelkopfBasica } from '../../src/ia/doppelkopf-basica';
import { reconstruirDoppelkopf } from '../../src/ia/reconstruir/doppelkopf';
import { doppelkopf, type EstadoDoppelkopf } from '../../src/juegos/doppelkopf';
import { iaTarotBasica } from '../../src/ia/tarot-basica';
import { reconstruirTarot } from '../../src/ia/reconstruir/tarot';
import { tarot, type EstadoTarot } from '../../src/juegos/tarot';
import {
  BARAJA_SCHNAPSEN,
  CONFIG_SCHNAPSEN_POR_DEFECTO,
  damaDe,
  schnapsen,
  type EstadoSchnapsen,
} from '../../src/juegos/schnapsen';
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

describirReconstruccion(canasta, reconstruirCanasta, {
  configs: [CONFIG_CANASTA_POR_DEFECTO],
  base: iaCanastaBasica,
  partidas: 4,
});

describirReconstruccion(whist, reconstruirWhist, {
  configs: [CONFIG_WHIST_POR_DEFECTO],
  base: iaWhistBasica,
});

describe('Reconstrucción del Whist', () => {
  it('la carta del triunfo sigue en la mano del repartidor', () => {
    const r = whist.crear(CONFIG_WHIST_POR_DEFECTO, 'triunfo');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const otro = (e.repartidor + 1) % 4;
    const g = new Generador(crearAzar('w'));
    for (let i = 0; i < 10; i++) {
      const rec = reconstruirWhist(whist.vistaDe(e, otro), g.estado());
      g.enteroHasta(1000);
      expect(rec.manos[e.repartidor]).toContain(e.cartaTriunfo);
    }
  });
});

describirReconstruccion(sevens, reconstruirSevens, {
  configs: [CONFIG_SEVENS_POR_DEFECTO, { jugadores: 3 }, { jugadores: 6 }],
  base: iaSevensBasica,
});

describirReconstruccion(casino, reconstruirCasino, {
  configs: [
    CONFIG_CASINO_POR_DEFECTO,
    { jugadores: 3, parejas: false },
    { jugadores: 4, parejas: true },
  ],
  base: iaCasinoBasica,
});

describe('Reconstrucción del Casino', () => {
  it('el dueño de una construcción ajena tiene una carta de su valor', () => {
    const r = casino.crear(CONFIG_CASINO_POR_DEFECTO, 'construccion');
    if (!r.ok) throw new Error(r.error);
    const e: EstadoCasino = {
      ...r.valor,
      mesa: [
        {
          tipo: 'construccion',
          id: 1,
          valor: 8,
          cartas: ['picas-5', 'picas-3'],
          duenio: 1,
          multiple: false,
        },
      ],
      manos: [
        r.valor.manos[0]!.filter((c) => !c.endsWith('-8')),
        ['treboles-8', 'corazones-2', 'corazones-3'],
      ],
    };
    const g = new Generador(crearAzar('c'));
    for (let i = 0; i < 10; i++) {
      const rec = reconstruirCasino(casino.vistaDe(e, 0), g.estado());
      g.enteroHasta(1000);
      expect(rec.manos[1]!.some((c) => c.endsWith('-8'))).toBe(true);
    }
  });
});

describirReconstruccion(durak, reconstruirDurak, {
  configs: [CONFIG_DURAK_POR_DEFECTO, { jugadores: 3 }, { jugadores: 6 }],
  base: iaDurakBasica,
});

describe('Reconstrucción del Durak', () => {
  it('las cartas que se llevó un rival siguen en su mano', () => {
    const r = durak.crear(CONFIG_DURAK_POR_DEFECTO, 'tomar');
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    const atacante = e.atacante;
    const carta = e.manos[atacante]![0]!;
    e = durak.transicion(e, atacante, { tipo: 'atacar', carta });
    e = durak.transicion(e, e.defensor, { tipo: 'tomar' });
    const g = new Generador(crearAzar('d'));
    for (let i = 0; i < 10; i++) {
      const rec = reconstruirDurak(durak.vistaDe(e, atacante), g.estado());
      g.enteroHasta(1000);
      expect(rec.manos[1 - atacante]).toContain(carta);
      expect(rec.mazo.at(-1)).toBe(e.cartaTriunfo);
    }
  });
});

describirReconstruccion(euchre, reconstruirEuchre, {
  configs: [CONFIG_EUCHRE_POR_DEFECTO],
  base: iaEuchreBasica,
});

describe('Reconstrucción del Euchre', () => {
  it('la carta vuelta que recogió el repartidor sigue en su mano', () => {
    const r = euchre.crear(CONFIG_EUCHRE_POR_DEFECTO, 'vuelta');
    if (!r.ok) throw new Error(r.error);
    let e = euchre.transicion(r.valor, 0, { tipo: 'pedir', solo: false });
    const repartidor = e.repartidor;
    e = euchre.transicion(e, repartidor, {
      tipo: 'descartar',
      carta: e.manos[repartidor]!.find((c) => c !== e.cartaVuelta)!,
    });
    const g = new Generador(crearAzar('e'));
    for (let i = 0; i < 10; i++) {
      const rec = reconstruirEuchre(euchre.vistaDe(e, 0), g.estado());
      g.enteroHasta(1000);
      expect(rec.manos[repartidor]).toContain(e.cartaVuelta);
      expect(rec.manos[repartidor]).toHaveLength(5);
      expect(rec.descarte).not.toBeNull();
    }
  });
});

describirReconstruccion(bigTwo, reconstruirBigTwo, {
  configs: [CONFIG_BIG_TWO_POR_DEFECTO],
  base: iaBigTwoBasica,
});

describirReconstruccion(cribbage, reconstruirCribbage, {
  configs: [CONFIG_CRIBBAGE_POR_DEFECTO],
  base: iaCribbageBasica,
});

describe('Reconstrucción del Cribbage', () => {
  it('las cartas que echó el jugador siguen en el crib', () => {
    const r = cribbage.crear(CONFIG_CRIBBAGE_POR_DEFECTO, 'crib');
    if (!r.ok) throw new Error(r.error);
    const echar = cribbage.accionesLegales(r.valor, 0)[0]!;
    let e = cribbage.transicion(r.valor, 0, echar);
    e = cribbage.transicion(e, 1, cribbage.accionesLegales(e, 1)[0]!);
    const g = new Generador(crearAzar('c'));
    for (let i = 0; i < 10; i++) {
      const rec = reconstruirCribbage(cribbage.vistaDe(e, 0), g.estado());
      g.enteroHasta(1000);
      expect(rec.echadas[0]).toEqual(e.echadas[0]);
      expect(rec.echadas[1]).toHaveLength(2);
    }
  });
});

describirReconstruccion(belote, reconstruirBelote, {
  configs: [CONFIG_BELOTE_POR_DEFECTO],
  base: iaBeloteBasica,
});

describe('Reconstrucción del Belote', () => {
  it('quien anunció «Belote» guarda la otra carta, y quien tomó, la carta vuelta', () => {
    // Busca una mano en la que un rival del 0 anuncie «Belote».
    for (let i = 0; ; i++) {
      const r = belote.crear(CONFIG_BELOTE_POR_DEFECTO, `belote-${i}`);
      if (!r.ok) throw new Error(r.error);
      let e = belote.transicion(r.valor, 0, { tipo: 'tomar' });
      const tiene = e.belote;
      if (tiene === null || tiene % 2 === 0) continue;
      while (e.anuncios.length === 0)
        e = belote.transicion(e, e.turno, belote.accionesLegales(e, e.turno)[0]!);
      if (e.anuncios.length !== 1 || e.resultadosManos.length > 0) continue;
      const otra = e.manos[tiene]!.find((c) => esReyODamaDelTriunfo(c, e.triunfo))!;
      const vuelta = e.manos[0]!.includes(e.cartaVuelta);
      const g = new Generador(crearAzar('b'));
      for (let k = 0; k < 10; k++) {
        const rec = reconstruirBelote(belote.vistaDe(e, 0), g.estado());
        g.enteroHasta(1000);
        expect(rec.manos[tiene]).toContain(otra);
        expect(rec.belote).toBe(tiene);
        expect(rec.manos[0]!.includes(e.cartaVuelta)).toBe(vuelta);
      }
      return;
    }
  });
});

describirReconstruccion(schnapsen, reconstruirSchnapsen, {
  configs: [CONFIG_SCHNAPSEN_POR_DEFECTO],
  base: iaSchnapsenBasica,
});

describe('Reconstrucción del Schnapsen', () => {
  it('el rival que cantó guarda la otra carta de la pareja', () => {
    const r = schnapsen.crear(CONFIG_SCHNAPSEN_POR_DEFECTO, 'cante');
    if (!r.ok) throw new Error(r.error);
    // El 1 tiene el K y la Q de picas, canta y sale con el K.
    const e0 = r.valor;
    const picas = ['picas-13', 'picas-12'] as const;
    const resto = BARAJA_SCHNAPSEN.filter(
      (c) => !(picas as readonly string[]).includes(c) && c !== 'corazones-1',
    );
    let e: EstadoSchnapsen = {
      ...e0,
      manos: [resto.slice(0, 5), [...picas, ...resto.slice(5, 8)]],
      mazo: resto.slice(8, 17),
      cartaVuelta: 'corazones-1',
      triunfo: 'corazones',
      turno: 1,
    };
    e = schnapsen.transicion(e, 1, { tipo: 'cantar', palo: 'picas' });
    e = schnapsen.transicion(e, 1, { tipo: 'jugar', carta: 'picas-13' });
    const g = new Generador(crearAzar('s'));
    for (let i = 0; i < 10; i++) {
      const rec = reconstruirSchnapsen(schnapsen.vistaDe(e, 0), g.estado());
      g.enteroHasta(1000);
      expect(rec.manos[1]).toContain(damaDe('picas'));
      expect(rec.manos[1]).toHaveLength(e.manos[1]!.length);
    }
  });
});

describirReconstruccion(skat, reconstruirSkat, {
  configs: [CONFIG_SKAT_POR_DEFECTO],
  base: iaSkatBasica,
});

describe('Reconstrucción del Skat', () => {
  it('el solista que se descartó conoce el Skat', () => {
    const r = skat.crear(CONFIG_SKAT_POR_DEFECTO, 'descarte');
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    // Mittelhand puja 18, Vorhand acepta, Mittelhand y Hinterhand pasan.
    for (const a of ['pujar', 'aceptar', 'pasar', 'pasar'] as const) {
      e = skat.transicion(e, e.turno, { tipo: a });
    }
    const solista = e.solista!;
    e = skat.transicion(e, solista, { tipo: 'cogerSkat' });
    e = skat.transicion(e, solista, { tipo: 'descartar', carta: e.manos[solista]![0]! });
    e = skat.transicion(e, solista, { tipo: 'descartar', carta: e.manos[solista]![0]! });
    const g = new Generador(crearAzar('k'));
    for (let i = 0; i < 10; i++) {
      const rec = reconstruirSkat(skat.vistaDe(e, solista), g.estado());
      g.enteroHasta(1000);
      expect(rec.skat).toEqual(e.skat);
    }
  });
});

describirReconstruccion(ohHell, reconstruirOhHell, {
  configs: [{ jugadores: 3 }, CONFIG_OH_HELL_POR_DEFECTO, { jugadores: 7 }],
  base: iaOhHellBasica,
});

describe('Reconstrucción del Oh Hell', () => {
  it('quien no siguió un palo no lo tiene en la mano reconstruida', () => {
    const r = ohHell.crear(CONFIG_OH_HELL_POR_DEFECTO, 'fallo');
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    // Apuestas y bazas con la primera acción legal hasta que alguien no sigue el palo.
    let pasos = 0;
    while (!e.fallos.some((f, a) => a !== 0 && f.length > 0) && pasos++ < 500) {
      e = ohHell.transicion(e, e.turno, ohHell.accionesLegales(e, e.turno)[0]!);
    }
    const quien = e.fallos.findIndex((f, a) => a !== 0 && f.length > 0);
    const palo = e.fallos[quien]![0]!;
    const g = new Generador(crearAzar('o'));
    for (let i = 0; i < 10; i++) {
      const rec = reconstruirOhHell(ohHell.vistaDe(e, 0), g.estado());
      g.enteroHasta(1000);
      expect(rec.manos[quien]!.some((c) => c.startsWith(palo))).toBe(false);
    }
  });
});

describirReconstruccion(spiteMalice, reconstruirSpiteMalice, {
  configs: [CONFIG_SPITE_MALICE_POR_DEFECTO],
  base: iaSpiteMaliceBasica,
});

describe('Reconstrucción del Spite and Malice', () => {
  it('la carta de arriba del montón propio es la que se ve y las de debajo cambian', () => {
    const r = spiteMalice.crear(CONFIG_SPITE_MALICE_POR_DEFECTO, 'monton');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const g = new Generador(crearAzar('m'));
    const debajo = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const rec = reconstruirSpiteMalice(spiteMalice.vistaDe(e, 0), g.estado());
      g.enteroHasta(1000);
      expect(rec.montones[0]!.at(-1)).toBe(e.montones[0]!.at(-1));
      expect(rec.montones[0]).toHaveLength(20);
      debajo.add(rec.montones[0]![0]!);
    }
    expect(debajo.size).toBeGreaterThan(1);
  });
});

describirReconstruccion(bridge, reconstruirBridge, {
  configs: [CONFIG_BRIDGE_POR_DEFECTO],
  base: iaBridgeBasica,
});

describe('Reconstrucción del Bridge', () => {
  it('el defensor ve el muerto y solo cambian las manos del declarante y de su compañero', () => {
    const r = bridge.crear(CONFIG_BRIDGE_POR_DEFECTO, 'muerto');
    if (!r.ok) throw new Error(r.error);
    let e: EstadoBridge = r.valor;
    // 1 sin triunfo del 0 y pasan todos: declara el 0, el muerto es el 2 y sale el 1.
    e = bridge.transicion(e, 0, { tipo: 'pujar', nivel: 1, denominacion: 'sinTriunfo' });
    for (const a of [1, 2, 3]) e = bridge.transicion(e, a, { tipo: 'pasar' });
    e = bridge.transicion(e, 1, bridge.accionesLegales(e, 1)[0]!);
    const g = new Generador(crearAzar('b'));
    const delDeclarante = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const rec = reconstruirBridge(bridge.vistaDe(e, 3), g.estado());
      g.enteroHasta(1000);
      expect(rec.manos[2]).toEqual(e.manos[2]);
      expect(rec.manos[3]).toEqual(e.manos[3]);
      expect(rec.manos[0]).toHaveLength(13);
      delDeclarante.add([...rec.manos[0]!].sort().join());
    }
    expect(delDeclarante.size).toBeGreaterThan(1);
  });
});

describirReconstruccion(pesca, reconstruirPesca, {
  configs: [2, 4, 6].map((jugadores) => ({ ...CONFIG_PESCA_POR_DEFECTO, jugadores })),
  base: iaPescaBasica,
});

describe('Reconstrucción de la Pesca', () => {
  it('quien pidió un valor y no lo ha perdido lo tiene en la mano reconstruida', () => {
    const r = pesca.crear({ jugadores: 3 }, 'sabido');
    if (!r.ok) throw new Error(r.error);
    let e: EstadoPesca = r.valor;
    // Se juega con la primera acción legal hasta que le toca al 2: el 1 ya ha pedido.
    while (e.turno !== 2) {
      e = pesca.transicion(e, e.turno, pesca.accionesLegales(e, e.turno)[0]!);
    }
    const pidio = e.registro.findLast((x) => x.tipo === 'pedir' && x.asiento === 1);
    if (!pidio || pidio.tipo !== 'pedir') throw new Error('El 1 no ha pedido');
    const delValor = (cs: readonly string[]) =>
      cs.some((c) => Number(c.split('-')[1]) === pidio.valor);
    expect(delValor(e.manos[1]!)).toBe(true);
    const g = new Generador(crearAzar('p'));
    for (let i = 0; i < 10; i++) {
      const rec = reconstruirPesca(pesca.vistaDe(e, 0), g.estado());
      g.enteroHasta(1000);
      expect(delValor(rec.manos[1]!)).toBe(true);
    }
  });
});

describirReconstruccion(kingsCorner, reconstruirKingsCorner, {
  configs: [2, 4].map((jugadores) => ({ ...CONFIG_KINGS_CORNER_POR_DEFECTO, jugadores })),
  base: iaKingsCornerBasica,
});

describirReconstruccion(bezique, reconstruirBezique, {
  configs: [{ objetivo: 200 }],
  base: iaBeziqueBasica,
});

describe('Reconstrucción del Bezique', () => {
  it('el rival conserva sus cartas cantadas', () => {
    const r = bezique.crear({ objetivo: 1000 }, 'cantadas');
    if (!r.ok) throw new Error(r.error);
    const e: EstadoBezique = {
      ...r.valor,
      cantadas: [[], [r.valor.manos[1]![0]!, r.valor.manos[1]![1]!]],
    };
    const g = new Generador(crearAzar('b'));
    for (let i = 0; i < 10; i++) {
      const rec = reconstruirBezique(bezique.vistaDe(e, 0), g.estado());
      g.enteroHasta(1000);
      expect(rec.manos[1]).toContain(e.manos[1]![0]);
      expect(rec.manos[1]).toContain(e.manos[1]![1]);
      expect(rec.manos[1]).toHaveLength(8);
    }
  });
});

describirReconstruccion(doppelkopf, reconstruirDoppelkopf, {
  configs: [{ manos: 1 }],
  base: iaDoppelkopfBasica,
});

describe('Reconstrucción del Doppelkopf', () => {
  it('quien anunció Re sin jugar su Q de tréboles la tiene; las dos en manos distintas', () => {
    const r = doppelkopf.crear({ manos: 1 }, 'bandos');
    if (!r.ok) throw new Error(r.error);
    let e: EstadoDoppelkopf = r.valor;
    for (let i = 0; i < 4 && e.fase === 'reservas'; i++) {
      const a = doppelkopf.accionesLegales(e, e.turno);
      e = doppelkopf.transicion(
        e,
        e.turno,
        a.find((x) => x.tipo === 'reservar' && x.reserva === 'sano') ?? a[0]!,
      );
    }
    if (e.juego !== 'normal') throw new Error('La semilla no da un juego normal');
    const conDama = e.re.find((a) => a !== 0)!;
    e = { ...e, anuncios: [{ asiento: conDama, bando: 're', nivel: 1 }] };
    const g = new Generador(crearAzar('d'));
    for (let i = 0; i < 20; i++) {
      const rec = reconstruirDoppelkopf(doppelkopf.vistaDe(e, 0), g.estado());
      g.enteroHasta(1000);
      expect(rec.manos[conDama]).toContain('treboles-12');
      const conDamas = rec.manos.filter((m) => m.includes('treboles-12'));
      expect(conDamas).toHaveLength(2);
      expect(rec.manos.every((m) => m.filter((c) => c === 'treboles-12').length <= 1)).toBe(true);
      if (e.re.includes(0)) expect(rec.re).toEqual(e.re);
    }
  });
});

describirReconstruccion(tarot, reconstruirTarot, {
  configs: [{ jugadores: 3 }, { jugadores: 4 }, { jugadores: 5 }],
  base: iaTarotBasica,
});

describe('Reconstrucción del Tarot', () => {
  it('los triunfos de una poignée que no se han jugado siguen en la mano de quien la enseñó', () => {
    const r = tarot.crear({ jugadores: 4 }, 'poignee');
    if (!r.ok) throw new Error(r.error);
    const triunfos = r.valor.manos[2]!.filter((c) => c.startsWith('triunfo-')).slice(0, 4);
    const e: EstadoTarot = {
      ...r.valor,
      fase: 'bazas',
      contrato: 'gardeSans',
      preneur: 1,
      dichos: ['pasa', 'gardeSans', 'pasa', 'pasa'],
      turno: 0,
      poignees: [{ asiento: 2, nivel: 1, cartas: triunfos }],
    };
    const g = new Generador(crearAzar('t'));
    for (let i = 0; i < 10; i++) {
      const rec = reconstruirTarot(tarot.vistaDe(e, 0), g.estado());
      g.enteroHasta(1000);
      for (const c of triunfos) expect(rec.manos[2]).toContain(c);
      expect(rec.manos[2]).toHaveLength(18);
      expect(rec.perro).toHaveLength(6);
    }
  });
});
