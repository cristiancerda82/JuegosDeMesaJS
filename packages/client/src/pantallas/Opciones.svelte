<script lang="ts">
  import type {
    ConfigBrisca,
    ConfigChinchon,
    ConfigEscoba,
    ConfigFreeCell,
    ConfigGuinote,
    ConfigKlondike,
    ConfigSieteYMedia,
    ConfigTute,
  } from '@juegos/engine';
  import { JUEGOS, type IdJuego } from '../sesion/juegos';
  import type { ConfigJuego } from '../sesion/partida';
  import { T } from '../textos';
  import ComoSeJuega from './ComoSeJuega.svelte';

  interface Props {
    juego: IdJuego;
    empezar: (config: ConfigJuego) => void;
    volver: () => void;
  }

  let { juego, empezar, volver }: Props = $props();

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
  let freecellModo: 'azar' | 'numero' = $state('azar');
  let freecellNumero = $state(1);

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
    };
    empezar({ ...configs[juego] });
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
          <label><input type="radio" bind:group={tute.manos} value={m} /> {T.opciones.manosN(m)}</label>
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
          <label><input type="radio" bind:group={brisca.manos} value={m} /> {T.opciones.manosN(m)}</label>
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
      <button type="submit" class="principal" data-testid="empezar">{T.opciones.empezar}</button>
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
</style>
