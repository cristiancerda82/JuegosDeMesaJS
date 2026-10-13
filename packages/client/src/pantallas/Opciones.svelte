<script lang="ts">
  import type { ConfigBrisca, ConfigKlondike, ConfigTute } from '@juegos/engine';
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

  const VUELTAS: readonly (number | null)[] = [null, 3, 1, 0];

  let verAyuda = $state(false);

  function enviar(ev: SubmitEvent) {
    ev.preventDefault();
    const configs = { klondike, brisca, tute };
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
