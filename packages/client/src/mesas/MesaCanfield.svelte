<script lang="ts">
  import type {
    AccionCanfield,
    ConfigCanfield,
    EstadoCanfield,
    PilaCanfield,
    VistaCanfield,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import { Interaccion } from '../interaccion/interaccion.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AvisoAtasco from './AvisoAtasco.svelte';
  import BotonPista, { type Resalte } from './BotonPista.svelte';
  import { formatoTiempo } from './tiempo';

  interface Props {
    sesion: SesionMesa<ConfigCanfield, EstadoCanfield, AccionCanfield, VistaCanfield>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const puede = (tipo: AccionCanfield['tipo']) => legales.some((a) => a.tipo === tipo);

  // ── Orígenes y destinos ────────────────────────────────────────────────────
  // Orígenes: "descarte", "reserva", "f<i>" (tope de una fundación) y "c<i>:<k>" (carta k de la
  // columna i, con las que tiene encima).

  function pilaYCantidad(origen: string): { pila: PilaCanfield; cantidad: number } {
    if (origen.startsWith('c')) {
      const [pila, k] = origen.split(':') as [PilaCanfield, string];
      const col = vista.columnas[Number(pila.slice(1))]!;
      return { pila, cantidad: col.length - Number(k) };
    }
    return { pila: origen as PilaCanfield, cantidad: 1 };
  }

  function movimientos(origen: string) {
    const { pila, cantidad } = pilaYCantidad(origen);
    return legales.filter(
      (a): a is Extract<AccionCanfield, { tipo: 'mover' }> =>
        a.tipo === 'mover' && a.desde === pila && a.cantidad === cantidad,
    );
  }

  const interaccion = new Interaccion({
    destinos: (origen) => movimientos(origen).map((m) => m.hasta),
    destinoObvio(origen) {
      const destinos = movimientos(origen).map((m) => m.hasta);
      return destinos.find((d) => d.startsWith('f')) ?? destinos[0] ?? null;
    },
    mover(origen, destino) {
      const m = movimientos(origen).find((x) => x.hasta === destino);
      if (m) sesion.jugar(m);
    },
    elementos(origen, nodo) {
      if (!origen.startsWith('c')) return [nodo];
      const desde = Number(origen.split(':')[1]);
      return [...(nodo.parentElement?.querySelectorAll<HTMLElement>('[data-indice]') ?? [])].filter(
        (el) => Number(el.dataset.indice) >= desde,
      );
    },
  });

  function mazo() {
    interaccion.cancelar();
    const accion = legales.find((a) => a.tipo === 'robar' || a.tipo === 'reciclar');
    if (accion) sesion.jugar(accion);
  }

  function accion(tipo: 'deshacer' | 'autocompletar') {
    interaccion.cancelar();
    sesion.jugar({ tipo });
  }

  function abandonar() {
    if (confirm(T.partida.confirmarAbandono)) sesion.jugar({ tipo: 'abandonar' });
  }

  /** Qué resaltar para una pista: las cartas que se moverían y su destino, o el mazo. */
  function resalte(pista: AccionCanfield): Resalte {
    if (pista.tipo !== 'mover') return { cartas: [], pilas: ['mazo'] };
    let cartas: readonly string[];
    if (pista.desde === 'descarte') cartas = vista.descarte.slice(-1);
    else if (pista.desde === 'reserva') cartas = vista.reservaArriba ? [vista.reservaArriba] : [];
    else if (pista.desde.startsWith('f')) cartas = vista.fundaciones[Number(pista.desde.slice(1))]!.slice(-1);
    else cartas = vista.columnas[Number(pista.desde.slice(1))]!.slice(-pista.cantidad);
    return { cartas, pilas: [pista.hasta] };
  }

  const NUMEROS: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };

  // ── Tiempo ─────────────────────────────────────────────────────────────────

  let tiempo = $state('');
  $effect(() => {
    const actualizar = () => (tiempo = formatoTiempo(sesion.tiempoMs()));
    actualizar();
    const reloj = setInterval(actualizar, 500);
    return () => clearInterval(reloj);
  });

  // ── Animación de cada cambio de la vista ───────────────────────────────────

  let raiz: HTMLElement | undefined = $state();
  let previas: Posiciones = new Map();
  $effect.pre(() => {
    void vista;
    if (raiz) previas = medir(raiz);
  });
  $effect(() => {
    void vista;
    if (raiz) animar(raiz, previas);
  });

  /** Cartas del descarte que se ven abiertas en abanico (las 3 últimas al robar de 3). */
  const abanico = $derived(vista.config.robo === 3 ? 3 : 1);
</script>

<div class="canfield">
  <div class="barra">
    <span class="dato"><span class="etiqueta">{T.partida.movimientos}</span> <b data-testid="movimientos">{vista.movimientos}</b></span>
    <span class="dato"><span class="etiqueta">{T.partida.tiempo}</span> <b>{tiempo}</b></span>
    <span class="dato" data-testid="base"><span class="etiqueta">{T.canfield.base}</span> <b>{NUMEROS[vista.base] ?? vista.base}</b></span>
    <span class="acciones">
      <BotonPista {sesion} {raiz} {resalte} />
      <button onclick={() => accion('deshacer')} disabled={!puede('deshacer')}>{T.partida.deshacer}</button>
      {#if puede('autocompletar')}
        <button class="principal" onclick={() => accion('autocompletar')}>{T.partida.autocompletar}</button>
      {/if}
      <button onclick={abandonar} disabled={!puede('abandonar')}>{T.partida.abandonar}</button>
    </span>
  </div>

  <div class="mesa" bind:this={raiz}>
    <div class="fila">
      <button
        class="pila mazo"
        data-zona="mazo"
        data-testid="mazo"
        onclick={mazo}
        disabled={!puede('robar') && !puede('reciclar')}
        aria-label={vista.mazo > 0 ? T.partida.robar : puede('reciclar') ? T.partida.reciclar : T.partida.mazoVacio}
      >
        {#if vista.mazo > 0}
          <Carta />
          <span class="contador">{vista.mazo}</span>
        {:else if puede('reciclar')}
          <span class="reciclar" aria-hidden="true">↻</span>
        {/if}
      </button>

      <div class="pila descarte" data-zona="descarte" data-testid="descarte" aria-label={T.partida.descarte}>
        {#each vista.descarte as id, i (id)}
          {@const visible = Math.max(0, i - (vista.descarte.length - abanico))}
          {@const tope = i === vista.descarte.length - 1}
          {#if tope}
            <div
              class="carta-pos"
              class:seleccionada={interaccion.seleccion === 'descarte'}
              style:left="calc({visible} * var(--paso-abanico))"
              data-carta={id}
              data-desde="mazo"
              use:interaccion.origen={'descarte'}
            >
              <Carta {id} />
            </div>
          {:else}
            <div class="carta-pos inerte" style:left="calc({visible} * var(--paso-abanico))" data-carta={id} data-desde="mazo">
              <Carta {id} />
            </div>
          {/if}
        {/each}
      </div>

      {#each vista.fundaciones as fundacion, i (i)}
        {@const zona = `f${i}`}
        <div
          class="pila fundacion"
          class:legal={interaccion.resaltados.has(zona)}
          data-destino={zona}
          data-testid={zona}
          aria-label={T.partida.fundacion(i + 1)}
          role="button"
          tabindex="-1"
          onclick={() => interaccion.tocarDestino(zona)}
          onkeydown={() => {}}
        >
          {#if fundacion.length === 0}
            <span class="hueco-base" aria-hidden="true">{NUMEROS[vista.base] ?? vista.base}</span>
          {/if}
          {#each fundacion as id, k (id)}
            {#if k === fundacion.length - 1}
              <div
                class="carta-pos"
                class:seleccionada={interaccion.seleccion === zona}
                data-carta={id}
                use:interaccion.origen={zona}
              >
                <Carta {id} />
              </div>
            {:else}
              <div class="carta-pos inerte" data-carta={id}><Carta {id} /></div>
            {/if}
          {/each}
        </div>
      {/each}
    </div>

    <div class="columnas">
      <div class="pila reserva" data-zona="reserva" data-testid="reserva" aria-label={T.canfield.reserva(vista.reserva)}>
        {#if vista.reservaArriba}
          {#key vista.reservaArriba}
            <div
              class="carta-pos"
              class:seleccionada={interaccion.seleccion === 'reserva'}
              data-carta={vista.reservaArriba}
              use:interaccion.origen={'reserva'}
            >
              <Carta id={vista.reservaArriba} />
            </div>
          {/key}
          <span class="contador">{vista.reserva}</span>
        {/if}
        <span class="rotulo">{T.canfield.reservaRotulo}</span>
      </div>

      {#each vista.columnas as columna, i (i)}
        {@const zona = `c${i}`}
        <div
          class="columna"
          class:vacia={columna.length === 0}
          class:legal={interaccion.resaltados.has(zona)}
          data-destino={zona}
          data-testid={zona}
          aria-label={T.partida.columna(i + 1)}
          role="button"
          tabindex="-1"
          style:height="calc(var(--alto-carta) + {Math.max(0, columna.length - 1)} * var(--paso-visible))"
          onclick={() => interaccion.tocarDestino(zona)}
          onkeydown={() => {}}
        >
          {#each columna as id, k (id)}
            {@const origen = `${zona}:${k}`}
            <div
              class="carta-pos"
              class:seleccionada={interaccion.seleccion !== null && interaccion.seleccion.startsWith(`${zona}:`) && Number(interaccion.seleccion.split(':')[1]) <= k}
              style:top="calc({k} * var(--paso-visible))"
              data-carta={id}
              data-indice={k}
              use:interaccion.origen={origen}
            >
              <Carta {id} />
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<AvisoAtasco
  {legales}
  terminada={sesion.fin !== null}
  deshacer={() => accion('deshacer')}
  abandonar={() => sesion.jugar({ tipo: 'abandonar' })}
/>

<style>
  .canfield {
    --hueco: clamp(4px, 1.2vw, 12px);
    /* Seis pilas en la fila de arriba, más el abanico del descarte (0,45 de carta). */
    --ancho-carta: min(calc((100vw - 16px - 5 * var(--hueco)) / 6.45), 100px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --paso-visible: min(calc(var(--alto-carta) * 0.3), 3.8vh);
    --paso-abanico: calc(var(--ancho-carta) * 0.22);
    width: min(100%, calc(6.45 * 100px + 5 * 12px + 16px));
    margin: 0 auto;
    padding: 0 8px 24px;
  }

  .barra {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 14px;
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

  .mesa {
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .fila,
  .columnas {
    display: flex;
    gap: var(--hueco);
  }

  .fila {
    margin-bottom: calc(var(--hueco) * 2 + 0.9rem);
  }

  .pila,
  .columna {
    position: relative;
    flex: none;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    border-radius: 7%;
    outline: 2px dashed rgb(255 255 255 / 0.18);
    outline-offset: -2px;
  }

  .columna {
    outline-color: transparent;
    min-height: var(--alto-carta);
  }

  .columna.vacia {
    outline-color: rgb(255 255 255 / 0.18);
  }

  .mazo {
    padding: 0;
    border: none;
    min-height: 0;
    background: none;
    display: block;
  }

  .mazo:disabled {
    opacity: 1;
  }

  .contador {
    position: absolute;
    right: 3px;
    bottom: 3px;
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    background: rgb(0 0 0 / 0.55);
  }

  .reciclar,
  .hueco-base {
    display: grid;
    place-items: center;
    height: 100%;
    font-size: calc(var(--ancho-carta) * 0.45);
    color: var(--texto-suave);
  }

  .hueco-base {
    font-weight: 700;
    opacity: 0.6;
  }

  .descarte {
    width: calc(var(--ancho-carta) * 1.45);
    outline: none;
  }

  .reserva {
    outline-color: rgb(255 224 102 / 0.35);
  }

  .rotulo {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 2px);
    font-size: 0.7rem;
    color: var(--texto-suave);
    text-align: center;
  }

  .carta-pos {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    border-radius: 7%;
    cursor: grab;
    touch-action: none;
  }

  .carta-pos.inerte {
    pointer-events: none;
    cursor: default;
  }

  .carta-pos.seleccionada {
    outline: 3px solid var(--resalte);
    outline-offset: 0;
    transform: translateY(-2px);
  }

  :global(.carta-pos.arrastrando) {
    cursor: grabbing;
    filter: drop-shadow(var(--sombra-alta));
  }

  .legal {
    outline: 3px solid var(--resalte) !important;
    outline-offset: 1px !important;
    box-shadow: 0 0 14px rgb(255 224 102 / 0.55);
  }
</style>
