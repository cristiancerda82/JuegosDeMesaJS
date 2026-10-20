<script lang="ts">
  import {
    FILAS_PIRAMIDE,
    inicioFilaPiramide,
    libreEnPiramide,
    valorPiramide,
    type AccionPiramide,
    type ConfigPiramide,
    type EstadoPiramide,
    type IdCarta,
    type SitioPiramide,
    type VistaPiramide,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AvisoAtasco from './AvisoAtasco.svelte';
  import BotonPista, { type Resalte } from './BotonPista.svelte';
  import { formatoTiempo } from './tiempo';

  interface Props {
    sesion: SesionMesa<ConfigPiramide, EstadoPiramide, AccionPiramide, VistaPiramide>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const puede = (tipo: AccionPiramide['tipo']) => legales.some((a) => a.tipo === tipo);

  /** Las filas de la pirámide, cada una con sus posiciones. */
  const filas = Array.from({ length: FILAS_PIRAMIDE }, (_, f) =>
    Array.from({ length: f + 1 }, (_, i) => inicioFilaPiramide(f) + i),
  );

  // ── Selección: una carta libre, y la segunda quita la pareja ───────────────
  // Clave de un sitio: "p<posición>" para la pirámide y "d" para el descarte.

  const clave = (s: SitioPiramide) => ('descarte' in s ? 'd' : `p${s.piramide}`);
  const cartaEn = (k: string): IdCarta | null =>
    k === 'd' ? (vista.descarte.at(-1) ?? null) : vista.piramide[Number(k.slice(1))]!;
  const esLibre = (k: string) =>
    k === 'd' ? vista.descarte.length > 0 : libreEnPiramide(vista.piramide, Number(k.slice(1)));

  let seleccion: string | null = $state(null);
  $effect(() => {
    // Si la carta elegida ya no está libre (deshacer, pista…), se suelta.
    if (seleccion !== null && !esLibre(seleccion)) seleccion = null;
  });

  /** La acción de quitar exactamente esas cartas, si es legal. */
  function quitar(...claves: string[]): AccionPiramide | undefined {
    const buscadas = [...claves].sort().join();
    return legales.find(
      (a) => a.tipo === 'quitar' && a.cartas.map(clave).sort().join() === buscadas,
    );
  }

  function tocar(k: string) {
    if (sesion.bloqueada || !esLibre(k)) return;
    const carta = cartaEn(k)!;
    if (seleccion === k) {
      seleccion = null;
      return;
    }
    if (valorPiramide(carta) === 13) {
      const rey = quitar(k);
      if (rey) {
        seleccion = null;
        sesion.jugar(rey);
      }
      return;
    }
    const pareja = seleccion === null ? undefined : quitar(seleccion, k);
    if (pareja) {
      seleccion = null;
      sesion.jugar(pareja);
    } else {
      seleccion = k;
    }
  }

  function accion(tipo: 'deshacer' | 'robar' | 'reciclar') {
    seleccion = null;
    sesion.jugar({ tipo });
  }

  function tocarMazo() {
    if (puede('robar')) accion('robar');
    else if (puede('reciclar')) accion('reciclar');
  }

  function abandonar() {
    if (confirm(T.partida.confirmarAbandono)) sesion.jugar({ tipo: 'abandonar' });
  }

  /** Qué resaltar para una pista: las cartas que se quitarían, o el mazo. */
  function resalte(pista: AccionPiramide): Resalte {
    if (pista.tipo !== 'quitar') return { cartas: [], pilas: ['mazo'] };
    return { cartas: pista.cartas.map((s) => cartaEn(clave(s))!), pilas: [] };
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

  /** El abanico del descarte: las tres de arriba. */
  const abanico = $derived(vista.descarte.slice(-3));
  const vueltasTexto = $derived(
    vista.vueltasRestantes === null
      ? T.piramide.sinLimite
      : T.partida.vueltasRestantes(vista.vueltasRestantes),
  );
</script>

<div class="piramide" bind:this={mesaEntera}>
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

  <div class="filas" data-testid="piramide">
    {#each filas as fila, f (f)}
      <div class="fila" style:z-index={f}>
        {#each fila as p (p)}
          {@const carta = vista.piramide[p]}
          {#if carta}
            {@const libre = libreEnPiramide(vista.piramide, p)}
            <button
              class="naipe"
              class:tapada={!libre}
              class:seleccionada={seleccion === `p${p}`}
              data-carta={carta}
              data-testid="carta-{carta}"
              aria-label={carta}
              aria-disabled={!libre}
              onclick={() => tocar(`p${p}`)}
            >
              <Carta id={carta} />
            </button>
          {:else}
            <span class="hueco"></span>
          {/if}
        {/each}
      </div>
    {/each}
  </div>

  <div class="pilas">
    <button
      class="mazo"
      onclick={tocarMazo}
      disabled={!puede('robar') && !puede('reciclar')}
      data-zona="mazo"
      data-testid="mazo"
      aria-label={vista.mazo > 0 ? T.partida.robar : T.partida.reciclar}
      title={vista.mazo > 0 ? T.partida.robar : T.partida.reciclar}
    >
      {#if vista.mazo > 0}
        <Carta />
        <span class="cuenta">{vista.mazo}</span>
      {:else}
        <span class="vacio">{puede('reciclar') ? '↻' : ''}</span>
      {/if}
    </button>
    <div class="descarte" data-testid="descarte">
      {#each abanico as carta, i (carta)}
        {@const arriba = i === abanico.length - 1}
        <button
          class="naipe"
          class:seleccionada={arriba && seleccion === 'd'}
          style:left="calc({i} * var(--ancho-carta) * 0.3)"
          data-carta={arriba ? carta : undefined}
          data-testid={arriba ? 'descarte-arriba' : undefined}
          aria-label={carta}
          disabled={!arriba}
          onclick={() => tocar('d')}
        >
          <Carta id={carta} />
        </button>
      {/each}
    </div>
    <span class="dato vueltas" data-testid="vueltas"><span class="etiqueta">{vueltasTexto}</span></span>
  </div>
</div>

<AvisoAtasco
  {legales}
  terminada={sesion.fin !== null}
  deshacer={() => accion('deshacer')}
  abandonar={() => sesion.jugar({ tipo: 'abandonar' })}
/>

<style>
  .piramide {
    /* 7 cartas de ancho con huecos, y la pirámide y las pilas caben en la altura. */
    --ancho-carta: min(12.5vw, 70px, calc((100dvh - 210px) / (6.3 * 1.4)));
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --hueco: calc(var(--ancho-carta) * 0.08);
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

  .filas {
    display: flex;
    flex-direction: column;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;
  }

  /* Cada fila sube sobre la anterior: deja ver el 45 % de arriba de las cartas tapadas. */
  .fila {
    position: relative;
    display: flex;
    gap: var(--hueco);
    /* La fila de abajo solapa a la de arriba: solo las cartas reciben los toques. */
    pointer-events: none;
  }

  .fila .naipe {
    pointer-events: auto;
  }

  .fila + .fila {
    margin-top: calc(var(--alto-carta) * -0.55);
  }

  .naipe,
  .hueco {
    display: block;
    flex: none;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    padding: 0;
    border: none;
    border-radius: 7%;
    background: none;
  }

  .naipe {
    cursor: pointer;
  }

  .naipe.tapada {
    cursor: default;
    filter: brightness(0.62);
  }

  .naipe.seleccionada {
    outline: 3px solid var(--resalte);
    outline-offset: 0;
    transform: translateY(-3px);
  }

  .pilas {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 14px;
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
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    border-radius: 7%;
    font-size: 1.6rem;
    color: var(--texto-suave);
    outline: 2px dashed rgb(255 255 255 / 0.18);
    outline-offset: -2px;
  }

  .descarte {
    position: relative;
    width: calc(var(--ancho-carta) * 1.6);
    height: var(--alto-carta);
  }

  .descarte .naipe {
    position: absolute;
    top: 0;
  }

  .descarte .naipe:disabled {
    opacity: 1;
    cursor: default;
  }
</style>
