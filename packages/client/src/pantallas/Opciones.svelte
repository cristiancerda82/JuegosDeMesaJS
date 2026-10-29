<script lang="ts">
  import {
    NIVELES_IA,
    type NivelIA,
  } from '@juegos/engine';
  import type {
    ConfigBrisca,
    ConfigBurro,
    ConfigButifarra,
    ConfigTruc,
    ConfigJulepe,
    ConfigRemigio,
    ConfigTuteSubastado,
    ConfigCuatrola,
    ConfigMentiroso,
    ConfigOchoLoco,
    ConfigPicas,
    ConfigBlackjack,
    ConfigGinRummy,
    ConfigRummy500,
    ConfigHoldem,
    ConfigCulo,
    ConfigCanasta,
    ConfigWhist,
    ConfigSevens,
    ConfigCasino,
    ConfigDurak,
    ConfigEuchre,
    ConfigBigTwo,
    ConfigCribbage,
    ConfigBelote,
    ConfigSchnapsen,
    ConfigSkat,
    ConfigBridge,
    ConfigPesca,
    ConfigKingsCorner,
    ConfigOhHell,
    ConfigSpiteMalice,
    ConfigPiramide,
    ConfigGolf,
    ConfigTriPeaks,
    ConfigYukon,
    ConfigCanfield,
    ConfigCuarentaLadrones,
    ConfigScorpion,
    ConfigChinchon,
    ConfigCorazones,
    ConfigCinquillo,
    ConfigEscoba,
    ConfigFreeCell,
    ConfigGuinote,
    ConfigKlondike,
    ConfigMus,
    ConfigPinacle,
    ConfigPocha,
    ConfigSpider,
    ConfigSieteYMedia,
    ConfigTute,
  } from '@juegos/engine';
  import { JUEGOS, type IdJuego } from '../sesion/juegos';
  import type { ConfigJuego } from '../sesion/partida';
  import { T } from '../textos';
  import ComoSeJuega from './ComoSeJuega.svelte';
  import { guardarNivel, leerNivel } from './nivel';

  interface Props {
    juego: IdJuego;
    empezar: (config: ConfigJuego, nivel: NivelIA) => void;
    volver: () => void;
    /** Opciones para crear una sala en red: el botón dice «Crear sala». */
    red?: boolean;
  }

  let { juego, empezar, volver, red = false }: Props = $props();

  type Editable<T> = { -readonly [K in keyof T]: T[K] };

  // Copias editables de las configuraciones por defecto.
  let klondike: Editable<ConfigKlondike> = $state({ ...JUEGOS.klondike.configPorDefecto });
  let brisca: Editable<ConfigBrisca> = $state({ ...JUEGOS.brisca.configPorDefecto });
  let tute: Editable<ConfigTute> = $state({ ...JUEGOS.tute.configPorDefecto });
  let escoba: Editable<ConfigEscoba> = $state({ ...JUEGOS.escoba.configPorDefecto });
  let chinchon: Editable<ConfigChinchon> = $state({ ...JUEGOS.chinchon.configPorDefecto });
  let guinote: Editable<ConfigGuinote> = $state({ ...JUEGOS.guinote.configPorDefecto });
  let sieteYMedia: Editable<ConfigSieteYMedia> = $state({ ...JUEGOS.sieteYMedia.configPorDefecto });
  let freecell: Editable<ConfigFreeCell> = $state({ ...JUEGOS.freecell.configPorDefecto });
  let cinquillo: Editable<ConfigCinquillo> = $state({ ...JUEGOS.cinquillo.configPorDefecto });
  let pocha: Editable<ConfigPocha> = $state({ ...JUEGOS.pocha.configPorDefecto });
  let musConfig: Editable<ConfigMus> = $state({ ...JUEGOS.mus.configPorDefecto });
  let spider: Editable<ConfigSpider> = $state({ ...JUEGOS.spider.configPorDefecto });
  let piramideConfig: Editable<ConfigPiramide> = $state({ ...JUEGOS.piramide.configPorDefecto });
  let golfConfig: Editable<ConfigGolf> = $state({ ...JUEGOS.golf.configPorDefecto });
  const tripeaksConfig: ConfigTriPeaks = JUEGOS.tripeaks.configPorDefecto;
  let yukonConfig: Editable<ConfigYukon> = $state({ ...JUEGOS.yukon.configPorDefecto });
  let canfieldConfig: Editable<ConfigCanfield> = $state({ ...JUEGOS.canfield.configPorDefecto });
  let scorpionConfig: Editable<ConfigScorpion> = $state({ ...JUEGOS.scorpion.configPorDefecto });
  let cuarentaLadronesConfig: Editable<ConfigCuarentaLadrones> = $state({
    ...JUEGOS.cuarentaLadrones.configPorDefecto,
  });
  let corazones: Editable<ConfigCorazones> = $state({ ...JUEGOS.corazones.configPorDefecto });
  let burro: Editable<ConfigBurro> = $state({ ...JUEGOS.burro.configPorDefecto });
  let pinacle: Editable<ConfigPinacle> = $state({ ...JUEGOS.pinacle.configPorDefecto });
  let butifarra: Editable<ConfigButifarra> = $state({ ...JUEGOS.butifarra.configPorDefecto });
  let trucConfig: Editable<ConfigTruc> = $state({ ...JUEGOS.truc.configPorDefecto });
  let julepeConfig: Editable<ConfigJulepe> = $state({ ...JUEGOS.julepe.configPorDefecto });
  let remigioConfig: Editable<ConfigRemigio> = $state({ ...JUEGOS.remigio.configPorDefecto });
  let cuatrolaConfig: Editable<ConfigCuatrola> = $state({ ...JUEGOS.cuatrola.configPorDefecto });
  let mentirosoConfig: Editable<ConfigMentiroso> = $state({ ...JUEGOS.mentiroso.configPorDefecto });
  let ochoLocoConfig: Editable<ConfigOchoLoco> = $state({ ...JUEGOS.ochoLoco.configPorDefecto });
  const picasConfig: ConfigPicas = JUEGOS.picas.configPorDefecto;
  let blackjackConfig: Editable<ConfigBlackjack> = $state({ ...JUEGOS.blackjack.configPorDefecto });
  const ginRummyConfig: ConfigGinRummy = JUEGOS.ginRummy.configPorDefecto;
  let rummy500Config: Editable<ConfigRummy500> = $state({ ...JUEGOS.rummy500.configPorDefecto });
  let holdemConfig: Editable<ConfigHoldem> = $state({ ...JUEGOS.holdem.configPorDefecto });
  let culoConfig: Editable<ConfigCulo> = $state({ ...JUEGOS.culo.configPorDefecto });
  let canastaConfig: Editable<ConfigCanasta> = $state({ ...JUEGOS.canasta.configPorDefecto });
  let whistConfig: Editable<ConfigWhist> = $state({ ...JUEGOS.whist.configPorDefecto });
  let sevensConfig: Editable<ConfigSevens> = $state({ ...JUEGOS.sevens.configPorDefecto });
  let casinoConfig: Editable<ConfigCasino> = $state({ ...JUEGOS.casino.configPorDefecto });
  let durakConfig: Editable<ConfigDurak> = $state({ ...JUEGOS.durak.configPorDefecto });
  let euchreConfig: Editable<ConfigEuchre> = $state({ ...JUEGOS.euchre.configPorDefecto });
  let bigTwoConfig: Editable<ConfigBigTwo> = $state({ ...JUEGOS.bigTwo.configPorDefecto });
  let cribbageConfig: Editable<ConfigCribbage> = $state({ ...JUEGOS.cribbage.configPorDefecto });
  let beloteConfig: Editable<ConfigBelote> = $state({ ...JUEGOS.belote.configPorDefecto });
  let schnapsenConfig: Editable<ConfigSchnapsen> = $state({ ...JUEGOS.schnapsen.configPorDefecto });
  let skatConfig: Editable<ConfigSkat> = $state({ ...JUEGOS.skat.configPorDefecto });
  let bridgeConfig: Editable<ConfigBridge> = $state({ ...JUEGOS.bridge.configPorDefecto });
  let pescaConfig: Editable<ConfigPesca> = $state({ ...JUEGOS.pesca.configPorDefecto });
  let kingsConfig: Editable<ConfigKingsCorner> = $state({ ...JUEGOS.kingsCorner.configPorDefecto });
  let ohHellConfig: Editable<ConfigOhHell> = $state({ ...JUEGOS.ohHell.configPorDefecto });
  let spiteMaliceConfig: Editable<ConfigSpiteMalice> = $state({
    ...JUEGOS.spiteMalice.configPorDefecto,
  });
  let subastado: Editable<ConfigTuteSubastado> = $state({
    ...JUEGOS.tuteSubastado.configPorDefecto,
  });
  let freecellModo: 'azar' | 'numero' = $state('azar');
  let freecellNumero = $state(1);

  /** Nivel de la IA, recordado por juego; los solitarios no tienen. */
  const conIA = $derived(JUEGOS[juego].ia !== null);
  // Basta con el valor inicial: las opciones se montan de nuevo al elegir otro juego.
  // svelte-ignore state_referenced_locally
  let nivel: NivelIA = $state(leerNivel(juego));

  const VUELTAS: readonly (number | null)[] = [null, 3, 1, 0];

  let verAyuda = $state(false);

  function enviar(ev: SubmitEvent) {
    ev.preventDefault();
    const partida = freecellModo === 'numero' ? freecellNumero : null;
    const configs = {
      klondike,
      brisca,
      tute,
      escoba,
      chinchon,
      guinote,
      sieteYMedia,
      freecell: { ...freecell, partida },
      cinquillo,
      pocha,
      mus: musConfig,
      spider,
      piramide: piramideConfig,
      golf: golfConfig,
      tripeaks: tripeaksConfig,
      yukon: yukonConfig,
      canfield: canfieldConfig,
      cuarentaLadrones: cuarentaLadronesConfig,
      scorpion: scorpionConfig,
      corazones,
      burro,
      pinacle,
      butifarra,
      truc: trucConfig,
      julepe: julepeConfig,
      remigio: remigioConfig,
      tuteSubastado: subastado,
      cuatrola: cuatrolaConfig,
      mentiroso: mentirosoConfig,
      ochoLoco: ochoLocoConfig,
      picas: picasConfig,
      blackjack: blackjackConfig,
      ginRummy: ginRummyConfig,
      rummy500: rummy500Config,
      holdem: holdemConfig,
      culo: culoConfig,
      canasta: canastaConfig,
      whist: whistConfig,
      sevens: sevensConfig,
      durak: durakConfig,
      euchre: euchreConfig,
      bigTwo: bigTwoConfig,
      cribbage: cribbageConfig,
      belote: beloteConfig,
      schnapsen: schnapsenConfig,
      skat: skatConfig,
      bridge: bridgeConfig,
      pesca: pescaConfig,
      kingsCorner: kingsConfig,
      ohHell: ohHellConfig,
      spiteMalice: spiteMaliceConfig,
      // Las parejas, solo con 4 jugadores.
      casino: { ...casinoConfig, parejas: casinoConfig.jugadores === 4 && casinoConfig.parejas },
    };
    if (conIA) guardarNivel(juego, nivel);
    empezar({ ...configs[juego] }, nivel);
  }
</script>

<main class="opciones">
  <h1>{T.opciones.titulo(JUEGOS[juego].nombre)}</h1>

  <button type="button" class="ayuda" onclick={() => (verAyuda = true)} data-testid="ver-ayuda">
    {T.ayuda.boton}
  </button>
  {#if verAyuda}
    <ComoSeJuega {juego} cerrar={() => (verAyuda = false)} />
  {/if}

  <form onsubmit={enviar}>
    {#if conIA}
      <fieldset data-testid="nivel-ia">
        <legend>{T.opciones.nivelIA}</legend>
        {#each NIVELES_IA as n (n)}
          <label>
            <input type="radio" bind:group={nivel} value={n} />
            <span><b>{T.opciones.nivel[n]}</b> · {T.opciones.nivelDesc[n]}</span>
          </label>
        {/each}
      </fieldset>
    {/if}
    {#if juego === 'klondike'}
      <fieldset>
        <legend>{T.opciones.robo}</legend>
        <label><input type="radio" bind:group={klondike.robo} value={1} /> {T.opciones.robo1}</label>
        <label><input type="radio" bind:group={klondike.robo} value={3} /> {T.opciones.robo3}</label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.vueltas}</legend>
        {#each VUELTAS as v (v)}
          <label>
            <input type="radio" bind:group={klondike.reciclajes} value={v} />
            {v === null ? T.opciones.ilimitadas : T.opciones.vueltasN(v)}
          </label>
        {/each}
      </fieldset>
    {:else if juego === 'canfield'}
      <fieldset>
        <legend>{T.opciones.robo}</legend>
        <label><input type="radio" bind:group={canfieldConfig.robo} value={3} /> {T.opciones.robo3}</label>
        <label><input type="radio" bind:group={canfieldConfig.robo} value={1} /> {T.opciones.robo1}</label>
      </fieldset>
    {:else if juego === 'yukon'}
      <fieldset>
        <legend>{T.opciones.construccion}</legend>
        <label><input type="radio" bind:group={yukonConfig.construccion} value="colores" /> {T.opciones.construccionColores}</label>
        <label><input type="radio" bind:group={yukonConfig.construccion} value="palo" /> {T.opciones.construccionPalo}</label>
      </fieldset>
    {:else if juego === 'chinchon'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [2, 3, 4] as n (n)}
          <label><input type="radio" bind:group={chinchon.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.baraja}</legend>
        <label><input type="radio" bind:group={chinchon.baraja} value="espanola40" /> {T.opciones.baraja40}</label>
        <label><input type="radio" bind:group={chinchon.baraja} value="espanola48" /> {T.opciones.baraja48}</label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.comodines}</legend>
        <label class="casilla">
          <input type="checkbox" bind:checked={chinchon.comodines} />
          {T.opciones.comodinesDesc}
        </label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.limite}</legend>
        {#each [100, 50] as l (l)}
          <label><input type="radio" bind:group={chinchon.limite} value={l} /> {T.opciones.limiteN(l)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.cierreMaximo}</legend>
        {#each [3, 5, 0] as m (m)}
          <label><input type="radio" bind:group={chinchon.cierreMaximo} value={m} /> {T.opciones.cierreN(m)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'escoba'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        <label><input type="radio" bind:group={escoba.jugadores} value={2} /> {T.opciones.dosJugadores}</label>
        <label><input type="radio" bind:group={escoba.jugadores} value={4} /> {T.opciones.cuatroJugadores}</label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.puntosPartida}</legend>
        {#each [15, 21, 31] as p (p)}
          <label><input type="radio" bind:group={escoba.puntosPartida} value={p} /> {T.opciones.puntosN(p)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.capturaObligatoria}</legend>
        <label class="casilla">
          <input type="checkbox" bind:checked={escoba.capturaObligatoria} />
          {T.opciones.capturaObligatoriaDesc}
        </label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.escobaInicial}</legend>
        <label class="casilla">
          <input type="checkbox" bind:checked={escoba.escobaInicial} />
          {T.opciones.escobaInicialDesc}
        </label>
      </fieldset>
    {:else if juego === 'corazones'}
      <fieldset>
        <legend>{T.opciones.paseCorazones}</legend>
        <label class="casilla">
          <input type="checkbox" bind:checked={corazones.pase} />
          {T.opciones.paseCorazonesDesc}
        </label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.puntosPartida}</legend>
        {#each [100, 50] as p (p)}
          <label><input type="radio" bind:group={corazones.fin} value={p} /> {T.opciones.puntosN(p)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'burro'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [3, 4, 5] as n (n)}
          <label><input type="radio" bind:group={burro.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'pinacle'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        <label><input type="radio" bind:group={pinacle.jugadores} value={2} /> {T.opciones.dosJugadores}</label>
        <label><input type="radio" bind:group={pinacle.jugadores} value={4} /> {T.opciones.cuatroJugadores}</label>
      </fieldset>
    {:else if juego === 'remigio'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [2, 3, 4, 5] as const as n (n)}
          <label><input type="radio" bind:group={remigioConfig.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'durak'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [2, 3, 4, 5, 6] as const as n (n)}
          <label><input type="radio" bind:group={durakConfig.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'casino'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [2, 3, 4] as const as n (n)}
          <label><input type="radio" bind:group={casinoConfig.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
        {#if casinoConfig.jugadores === 4}
          <label><input type="checkbox" bind:checked={casinoConfig.parejas} data-testid="parejas" /> {T.opciones.enParejas}</label>
        {/if}
      </fieldset>
    {:else if juego === 'sevens'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [3, 4, 5, 6] as const as n (n)}
          <label><input type="radio" bind:group={sevensConfig.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'culo'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [3, 4, 5, 6] as const as n (n)}
          <label><input type="radio" bind:group={culoConfig.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'holdem'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [2, 3, 4, 5, 6] as const as n (n)}
          <label><input type="radio" bind:group={holdemConfig.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'rummy500'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [2, 3, 4] as const as n (n)}
          <label><input type="radio" bind:group={rummy500Config.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'blackjack'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [1, 2, 3, 4] as const as n (n)}
          <label><input type="radio" bind:group={blackjackConfig.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.manosJulepe}</legend>
        {#each [5, 10, 20] as const as m (m)}
          <label><input type="radio" bind:group={blackjackConfig.manos} value={m} /> {T.opciones.manosJulepeN(m)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'ochoLoco'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [2, 3, 4, 5] as const as n (n)}
          <label><input type="radio" bind:group={ochoLocoConfig.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'mentiroso'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [3, 4, 5, 6] as const as n (n)}
          <label><input type="radio" bind:group={mentirosoConfig.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'cuatrola'}
      <p class="nota-opciones">{T.opciones.siempreCuatro}</p>
      <fieldset>
        <legend>{T.opciones.manosJulepe}</legend>
        {#each [8, 4, 12] as const as m (m)}
          <label><input type="radio" bind:group={cuatrolaConfig.manos} value={m} /> {T.opciones.manosJulepeN(m)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'tuteSubastado'}
      <p class="nota-opciones">{T.opciones.siempreCuatro}</p>
      <fieldset>
        <legend>{T.opciones.manosJulepe}</legend>
        {#each [8, 4, 12] as const as m (m)}
          <label><input type="radio" bind:group={subastado.manos} value={m} /> {T.opciones.manosJulepeN(m)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'julepe'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [3, 4, 5, 6] as const as n (n)}
          <label><input type="radio" bind:group={julepeConfig.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.manosJulepe}</legend>
        {#each [12, 6, 20] as const as m (m)}
          <label><input type="radio" bind:group={julepeConfig.manos} value={m} /> {T.opciones.manosJulepeN(m)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'truc'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        <label><input type="radio" bind:group={trucConfig.jugadores} value={2} /> {T.opciones.dosJugadores}</label>
        <label><input type="radio" bind:group={trucConfig.jugadores} value={4} /> {T.opciones.cuatroJugadores}</label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.puntosPartida}</legend>
        <label><input type="radio" bind:group={trucConfig.cames} value={2} /> {T.opciones.dosCames}</label>
        <label><input type="radio" bind:group={trucConfig.cames} value={1} /> {T.opciones.unaCame}</label>
      </fieldset>
    {:else if juego === 'butifarra'}
      <fieldset>
        <legend>{T.opciones.puntosPartida}</legend>
        {#each [101, 51, 151] as const as p (p)}
          <label><input type="radio" bind:group={butifarra.objetivo} value={p} /> {T.opciones.puntosN(p)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'golf'}
      <fieldset>
        <legend>{T.opciones.vueltaGolf}</legend>
        <label class="casilla">
          <input type="checkbox" bind:checked={golfConfig.vuelta} data-testid="vuelta-golf" />
          {T.opciones.vueltaGolfDesc}
        </label>
      </fieldset>
    {:else if juego === 'piramide'}
      <fieldset>
        <legend>{T.opciones.pasadas}</legend>
        {#each [3, 1, null] as const as p (p)}
          <label><input type="radio" bind:group={piramideConfig.pasadas} value={p} /> {T.opciones.pasadasN(p)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'spider'}
      <fieldset>
        <legend>{T.opciones.palosSpider}</legend>
        {#each [1, 2, 4] as p (p)}
          <label><input type="radio" bind:group={spider.palos} value={p} /> {T.opciones.palosN(p)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.repartirConVacias}</legend>
        <label class="casilla">
          <input type="checkbox" bind:checked={spider.repartirConVacias} />
          {T.opciones.repartirConVaciasDesc}
        </label>
      </fieldset>
    {:else if juego === 'mus'}
      <fieldset>
        <legend>{T.opciones.reyesMus}</legend>
        <label><input type="radio" bind:group={musConfig.reyes} value={8} /> {T.opciones.ochoReyes}</label>
        <label><input type="radio" bind:group={musConfig.reyes} value={4} /> {T.opciones.cuatroReyes}</label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.puntosJuegoMus}</legend>
        {#each [40, 30] as p (p)}
          <label><input type="radio" bind:group={musConfig.puntos} value={p} /> {T.opciones.piedrasN(p)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.juegosMus}</legend>
        {#each [3, 1, 5] as j (j)}
          <label><input type="radio" bind:group={musConfig.juegos} value={j} /> {T.opciones.juegosN(j)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'pocha'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [4, 3] as n (n)}
          <label><input type="radio" bind:group={pocha.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.duracionPocha}</legend>
        <label><input type="radio" bind:group={pocha.duracion} value="corta" /> {T.opciones.duracionCorta}</label>
        <label><input type="radio" bind:group={pocha.duracion} value="completa" /> {T.opciones.duracionCompleta}</label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.restriccionRepartidor}</legend>
        <label class="casilla">
          <input type="checkbox" bind:checked={pocha.restriccionRepartidor} data-testid="restriccion-repartidor" />
          {T.opciones.restriccionRepartidorDesc}
        </label>
      </fieldset>
    {:else if juego === 'cinquillo'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [4, 3, 2] as n (n)}
          <label><input type="radio" bind:group={cinquillo.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.manosPartida}</legend>
        {#each [3, 1, 5] as m (m)}
          <label><input type="radio" bind:group={cinquillo.manos} value={m} /> {T.opciones.manosPartidaN(m)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'freecell'}
      <fieldset>
        <legend>{T.opciones.partidaFreeCell}</legend>
        <label><input type="radio" bind:group={freecellModo} value="azar" /> {T.opciones.partidaAzar}</label>
        <label><input type="radio" bind:group={freecellModo} value="numero" /> {T.opciones.partidaNumero}</label>
        {#if freecellModo === 'numero'}
          <label class="numero">
            {T.opciones.numeroPartida}
            <input
              type="number"
              min="1"
              max="32000"
              step="1"
              required
              bind:value={freecellNumero}
              data-testid="numero-partida"
            />
          </label>
        {/if}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.celdas}</legend>
        {#each [4, 3, 2, 1] as c (c)}
          <label><input type="radio" bind:group={freecell.celdas} value={c} /> {T.opciones.celdasN(c)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.autoFundacion}</legend>
        <label class="casilla">
          <input type="checkbox" bind:checked={freecell.autoFundacion} />
          {T.opciones.autoFundacionDesc}
        </label>
      </fieldset>
    {:else if juego === 'sieteYMedia'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [2, 3, 4] as n (n)}
          <label><input type="radio" bind:group={sieteYMedia.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.manosPartida}</legend>
        {#each [10, 5, 20] as m (m)}
          <label><input type="radio" bind:group={sieteYMedia.manos} value={m} /> {T.opciones.manosPartidaN(m)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.fichasIniciales}</legend>
        {#each [50, 20, 100] as f (f)}
          <label><input type="radio" bind:group={sieteYMedia.fichasIniciales} value={f} /> {T.opciones.fichasN(f)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.apuestaMaxima}</legend>
        {#each [10, 5, 20] as a (a)}
          <label><input type="radio" bind:group={sieteYMedia.apuestaMaxima} value={a} /> {T.opciones.apuestaN(a)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.cambioBanca}</legend>
        <label><input type="radio" bind:group={sieteYMedia.cambioBanca} value="rotar" /> {T.opciones.bancaRotar}</label>
        <label><input type="radio" bind:group={sieteYMedia.cambioBanca} value="sieteYMedia" /> {T.opciones.bancaSieteYMedia}</label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.pagoDoble}</legend>
        <label class="casilla">
          <input type="checkbox" bind:checked={sieteYMedia.pagoDoble} />
          {T.opciones.pagoDobleDesc}
        </label>
      </fieldset>
    {:else if juego === 'ohHell'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [3, 4, 5, 6, 7] as n (n)}
          <label><input type="radio" bind:group={ohHellConfig.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'kingsCorner'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [2, 3, 4] as n (n)}
          <label><input type="radio" bind:group={kingsConfig.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'pesca'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        {#each [2, 3, 4, 5, 6] as n (n)}
          <label><input type="radio" bind:group={pescaConfig.jugadores} value={n} /> {T.opciones.jugadoresN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'bridge'}
      <fieldset>
        <legend>{T.opciones.ciclos}</legend>
        {#each [1, 2, 3] as n (n)}
          <label><input type="radio" bind:group={bridgeConfig.ciclos} value={n} /> {T.opciones.ciclosN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'skat'}
      <fieldset>
        <legend>{T.opciones.rondas}</legend>
        {#each [1, 2, 3] as n (n)}
          <label><input type="radio" bind:group={skatConfig.rondas} value={n} /> {T.opciones.rondasN(n)}</label>
        {/each}
      </fieldset>
    {:else if juego === 'guinote'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        <label><input type="radio" bind:group={guinote.jugadores} value={2} /> {T.opciones.dosJugadores}</label>
        <label><input type="radio" bind:group={guinote.jugadores} value={4} /> {T.opciones.cuatroJugadores}</label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.puntosPartida}</legend>
        {#each [101, 51, 151] as p (p)}
          <label><input type="radio" bind:group={guinote.meta} value={p} /> {T.opciones.puntosN(p)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.cambioSieteGuinote}</legend>
        <label><input type="radio" bind:group={guinote.cambioSiete} value="trasGanarBaza" /> {T.opciones.cambioSieteTrasBaza}</label>
        <label><input type="radio" bind:group={guinote.cambioSiete} value="libre" /> {T.opciones.cambioSieteLibre}</label>
        <label><input type="radio" bind:group={guinote.cambioSiete} value="no" /> {T.opciones.cambioNo}</label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.montar}</legend>
        <label class="casilla">
          <input type="checkbox" bind:checked={guinote.montarSobreCompanero} />
          {T.opciones.montarArrastreDesc}
        </label>
      </fieldset>
    {:else if juego === 'tute'}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        <label><input type="radio" bind:group={tute.jugadores} value={2} /> {T.opciones.dosJugadores}</label>
        <label><input type="radio" bind:group={tute.jugadores} value={4} /> {T.opciones.cuatroJugadores}</label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.cambioSiete}</legend>
        <label><input type="radio" bind:group={tute.cambioSiete} value="trasGanarBaza" /> {T.opciones.cambioSieteTrasBaza}</label>
        <label><input type="radio" bind:group={tute.cambioSiete} value="libre" /> {T.opciones.cambioSieteLibre}</label>
        <label><input type="radio" bind:group={tute.cambioSiete} value="no" /> {T.opciones.cambioNo}</label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.manos}</legend>
        {#each [1, 3, 5] as m (m)}
          <label><input type="radio" bind:group={tute.manos} value={m} /> {T.opciones.manosJulepeN(m)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.montar}</legend>
        <label class="casilla">
          <input type="checkbox" bind:checked={tute.montarSobreCompanero} />
          {T.opciones.montarDesc}
        </label>
      </fieldset>
    {:else}
      <fieldset>
        <legend>{T.opciones.jugadores}</legend>
        <label><input type="radio" bind:group={brisca.jugadores} value={2} /> {T.opciones.dosJugadores}</label>
        <label><input type="radio" bind:group={brisca.jugadores} value={4} /> {T.opciones.cuatroJugadores}</label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.cambioMuestra}</legend>
        <label><input type="radio" bind:group={brisca.cambioMuestra} value="libre" /> {T.opciones.cambioLibre}</label>
        <label><input type="radio" bind:group={brisca.cambioMuestra} value="trasGanarBaza" /> {T.opciones.cambioTrasBaza}</label>
        <label><input type="radio" bind:group={brisca.cambioMuestra} value="no" /> {T.opciones.cambioNo}</label>
      </fieldset>
      <fieldset>
        <legend>{T.opciones.manos}</legend>
        {#each [1, 3, 5] as m (m)}
          <label><input type="radio" bind:group={brisca.manos} value={m} /> {T.opciones.manosJulepeN(m)}</label>
        {/each}
      </fieldset>
      <fieldset>
        <legend>{T.opciones.arrastre}</legend>
        <label class="casilla">
          <input type="checkbox" bind:checked={brisca.arrastreFinal} />
          {T.opciones.arrastreDesc}
        </label>
      </fieldset>
    {/if}

    <div class="botones">
      <button type="button" onclick={volver}>{T.opciones.volver}</button>
      <button type="submit" class="principal" data-testid="empezar">{red ? T.red.crear : T.opciones.empezar}</button>
    </div>
  </form>
</main>

<style>
  .opciones {
    max-width: 560px;
    margin: 0 auto;
    padding: 24px 16px 32px;
  }

  h1 {
    font-size: 1.6rem;
    margin-bottom: 12px;
  }

  .ayuda {
    width: 100%;
    margin-bottom: 16px;
    border-color: rgb(242 193 78 / 0.6);
    font-weight: 600;
  }

  fieldset {
    margin: 0 0 14px;
    padding: 10px 14px 12px;
    border: 1px solid rgb(255 255 255 / 0.2);
    border-radius: var(--radio);
    background: rgb(0 0 0 / 0.15);
  }

  legend {
    padding: 0 6px;
    font-weight: 700;
  }

  label {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 40px;
  }

  input {
    width: 20px;
    height: 20px;
    accent-color: var(--acento);
    flex: none;
  }

  .botones {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 18px;
  }

  .nota-opciones {
    margin: 0;
    font-size: 0.9rem;
    color: var(--texto-suave);
  }
</style>
