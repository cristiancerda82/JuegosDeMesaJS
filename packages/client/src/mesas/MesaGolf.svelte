<script lang="ts">
  import type {
    AccionGolf,
    ConfigGolf,
    EstadoGolf,
    IdCarta,
    VistaGolf,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AvisoAtasco from './AvisoAtasco.svelte';
  import BotonPista, { type Resalte } from './BotonPista.svelte';
  import { formatoTiempo } from './tiempo';

  interface Props {
    sesion: SesionMesa<ConfigGolf, EstadoGolf, AccionGolf, VistaGolf>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const puede = (tipo: AccionGolf['tipo']) => legales.some((a) => a.tipo === tipo);
  const movible = (columna: number) =>
    legales.some((a) => a.tipo === 'mover' && a.columna === columna);

  function mover(columna: number) {
    if (!sesion.bloqueada && movible(columna)) sesion.jugar({ tipo: 'mover', columna });
  }

  function accion(tipo: 'deshacer' | 'robar') {
    sesion.jugar({ tipo });
  }

  function abandonar() {
    if (confirm(T.partida.confirmarAbandono)) sesion.jugar({ tipo: 'abandonar' });
  }

  /** Qué resaltar para una pista: la carta que se movería, o el mazo. */
  function resalte(pista: AccionGolf): Resalte {
    if (pista.tipo !== 'mover') return { cartas: [], pilas: ['mazo'] };
    return { cartas: [vista.columnas[pista.columna]!.at(-1)!], pilas: [] };
  }

  let mesaEntera: HTMLElement | undefined = $state();

  // ── Tiempo ─────────────────────────────────────────────────────────────────

  let tiempo = $state('');
  $effect(() => {
    const actualizar = () => (tiempo = formatoTiempo(sesion.tiempoMs()));
    actualizar();
    const reloj = setInterval(actualizar, 500);
    return () => clearInterval(reloj);
  });

  // ── Animación de cada cambio de la vista ───────────────────────────────────

  let previas: Posiciones = new Map();
  $effect.pre(() => {
    void vista;
    if (mesaEntera) previas = medir(mesaEntera);
  });
  $effect(() => {
    void vista;
    if (mesaEntera) animar(mesaEntera, previas);
  });

  /** El descarte en abanico: las tres de arriba. */
  const abanico = $derived(vista.descarte.slice(-3) as IdCarta[]);
</script>

<div class="golf" bind:this={mesaEntera}>
  <div class="barra">
    <span class="dato">
      <span class="etiqueta">{T.partida.movimientos}</span>
      <b data-testid="movimientos">{vista.movimientos}</b>
    </span>
    <span class="dato"><span class="etiqueta">{T.partida.tiempo}</span> <b>{tiempo}</b></span>
    <span class="acciones">
      <BotonPista {sesion} raiz={mesaEntera} {resalte} />
      <button onclick={() => accion('deshacer')} disabled={!puede('deshacer')} data-testid="deshacer">
        {T.partida.deshacer}
      </button>
      <button onclick={abandonar} disabled={!puede('abandonar')}>{T.partida.abandonar}</button>
    </span>
  </div>

  <div class="columnas">
    {#each vista.columnas as columna, i (i)}
      <div class="columna" data-testid="c{i}">
        {#each columna as carta, k (carta)}
          {@const ultima = k === columna.length - 1}
          <button
            class="naipe"
            class:movible={ultima && movible(i)}
            style:top="calc({k} * var(--paso))"
            data-carta={carta}
            data-testid="carta-{carta}"
            aria-label={carta}
            disabled={!ultima}
            onclick={() => mover(i)}
          >
            <Carta id={carta} />
          </button>
        {/each}
      </div>
    {/each}
  </div>

  <div class="pilas">
    <button
      class="mazo"
      onclick={() => accion('robar')}
      disabled={!puede('robar')}
      data-zona="mazo"
      data-testid="mazo"
      aria-label={T.partida.robar}
      title={T.partida.robar}
    >
      {#if vista.mazo > 0}
        <Carta />
        <span class="cuenta">{vista.mazo}</span>
      {:else}
        <span class="vacio"></span>
      {/if}
    </button>
    <div class="descarte" data-testid="descarte">
      {#each abanico as carta, i (carta)}
        <span
          class="naipe"
          style:left="calc({i} * var(--ancho-carta) * 0.3)"
          data-carta={i === abanico.length - 1 ? carta : undefined}
          data-testid={i === abanico.length - 1 ? 'descarte-arriba' : undefined}
        >
          <Carta id={carta} />
        </span>
      {/each}
    </div>
    <span class="dato" data-testid="en-mazo"><span class="etiqueta">{T.brisca.enMazo(vista.mazo)}</span></span>
  </div>
</div>

<AvisoAtasco
  {legales}
  terminada={sesion.fin !== null}
  deshacer={() => accion('deshacer')}
  abandonar={() => sesion.jugar({ tipo: 'abandonar' })}
/>

<style>
  .golf {
    --ancho-carta: min(12.5vw, 70px, calc((100dvh - 230px) / (3.1 * 1.4)));
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --hueco: calc(var(--ancho-carta) * 0.08);
    /* Paso entre las cartas de una columna: deja ver el índice de todas. */
    --paso: calc(var(--alto-carta) * 0.28);
    width: min(100%, calc(7 * 70px + 6 * 6px + 16px));
    margin: 0 auto;
    padding: 0 8px 24px;
  }

  .barra {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 12px;
    padding: 6px 0 10px;
  }

  .dato {
    font-variant-numeric: tabular-nums;
  }

  .etiqueta {
    color: var(--texto-suave);
    font-size: 0.85rem;
  }

  .acciones {
    display: flex;
    gap: 6px;
    margin-left: auto;
  }

  .acciones button {
    padding: 0.4rem 0.7rem;
    font-size: 0.9rem;
  }

  .columnas {
    display: flex;
    justify-content: center;
    gap: var(--hueco);
    user-select: none;
    -webkit-user-select: none;
  }

  .columna {
    position: relative;
    flex: none;
    width: var(--ancho-carta);
    height: calc(var(--alto-carta) + 4 * var(--paso));
  }

  .naipe {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    padding: 0;
    border: none;
    border-radius: 7%;
    background: none;
  }

  button.naipe:disabled {
    opacity: 1;
    cursor: default;
  }

  .naipe.movible {
    outline: 3px solid var(--resalte);
    outline-offset: 0;
    box-shadow: 0 0 12px rgb(255 224 102 / 0.5);
  }

  .pilas {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
    justify-content: center;
  }

  .mazo {
    position: relative;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    padding: 0;
    border: none;
    background: none;
  }

  .mazo:disabled {
    opacity: 1;
    cursor: default;
  }

  .cuenta {
    position: absolute;
    right: 4px;
    bottom: 4px;
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.8rem;
    background: rgb(0 0 0 / 0.55);
  }

  .vacio {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 7%;
    outline: 2px dashed rgb(255 255 255 / 0.18);
    outline-offset: -2px;
  }

  .descarte {
    position: relative;
    width: calc(var(--ancho-carta) * 1.6);
    height: var(--alto-carta);
  }
</style>
