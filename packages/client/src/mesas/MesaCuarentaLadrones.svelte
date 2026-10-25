<script lang="ts">
  import {
    baseSpider,
    type AccionCuarentaLadrones,
    type CartaLadrones,
    type ConfigCuarentaLadrones,
    type EstadoCuarentaLadrones,
    type PilaLadrones,
    type VistaCuarentaLadrones,
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
    sesion: SesionMesa<
      ConfigCuarentaLadrones,
      EstadoCuarentaLadrones,
      AccionCuarentaLadrones,
      VistaCuarentaLadrones
    >;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const puede = (tipo: AccionCuarentaLadrones['tipo']) => legales.some((a) => a.tipo === tipo);
  const base = (c: CartaLadrones) => baseSpider(c);

  // ── Orígenes y destinos ────────────────────────────────────────────────────
  // Orígenes: "descarte" y "c<i>:<k>" (carta k de la columna i, con las que tiene encima).

  function pilaYCantidad(origen: string): { pila: PilaLadrones; cantidad: number } {
    if (origen.startsWith('c')) {
      const [pila, k] = origen.split(':') as [PilaLadrones, string];
      const col = vista.columnas[Number(pila.slice(1))]!;
      return { pila, cantidad: col.length - Number(k) };
    }
    return { pila: origen as PilaLadrones, cantidad: 1 };
  }

  function movimientos(origen: string) {
    const { pila, cantidad } = pilaYCantidad(origen);
    return legales.filter(
      (a): a is Extract<AccionCuarentaLadrones, { tipo: 'mover' }> =>
        a.tipo === 'mover' && a.desde === pila && a.cantidad === cantidad,
    );
  }

  /** Una columna vacía cualquiera vale por la primera, que es la que listan las reglas. */
  function destinoReal(destino: string): string {
    if (!destino.startsWith('c') || vista.columnas[Number(destino.slice(1))]!.length > 0) return destino;
    const primera = vista.columnas.findIndex((c) => c.length === 0);
    return `c${primera}`;
  }

  const interaccion = new Interaccion({
    destinos(origen) {
      const hastas = movimientos(origen).map((m) => m.hasta as string);
      // Si se puede ir a la primera columna vacía, se puede ir a cualquiera.
      const huecos = vista.columnas.flatMap((c, i) => (c.length === 0 ? [`c${i}`] : []));
      return hastas.some((h) => huecos.includes(h)) ? [...new Set([...hastas, ...huecos])] : hastas;
    },
    destinoObvio(origen) {
      const destinos = movimientos(origen).map((m) => m.hasta);
      return destinos.find((d) => d.startsWith('f')) ?? destinos[0] ?? null;
    },
    mover(origen, destino) {
      const real = destinoReal(destino);
      const m = movimientos(origen).find((x) => x.hasta === real);
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
    const accion = legales.find((a) => a.tipo === 'robar');
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
  function resalte(pista: AccionCuarentaLadrones): Resalte {
    if (pista.tipo !== 'mover') return { cartas: [], pilas: ['mazo'] };
    const cartas =
      pista.desde === 'descarte'
        ? vista.descarte.slice(-1)
        : vista.columnas[Number(pista.desde.slice(1))]!.slice(-pista.cantidad);
    return { cartas, pilas: [pista.hasta] };
  }

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

  /** Pasos de la columna más larga: con ella se aprieta el paso para que todo quepa. */
  const masLarga = $derived(Math.max(1, ...vista.columnas.map((c) => c.length - 1)));
  const arriba = $derived(vista.descarte.at(-1) ?? null);
</script>

<div class="ladrones" style:--divisor={masLarga}>
  <div class="barra">
    <span class="dato"><span class="etiqueta">{T.partida.movimientos}</span> <b data-testid="movimientos">{vista.movimientos}</b></span>
    <span class="dato"><span class="etiqueta">{T.partida.tiempo}</span> <b>{tiempo}</b></span>
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
        disabled={!puede('robar')}
        aria-label={vista.mazo > 0 ? T.partida.robar : T.partida.mazoVacio}
      >
        {#if vista.mazo > 0}
          <Carta />
          <span class="contador">{vista.mazo}</span>
        {/if}
      </button>

      <div class="pila descarte" data-zona="descarte" data-testid="descarte" aria-label={T.partida.descarte}>
        {#if vista.descarte.length > 1}
          <div class="carta-pos inerte"><Carta id={base(vista.descarte.at(-2)!)} /></div>
        {/if}
        {#if arriba}
          {#key arriba}
            <div
              class="carta-pos"
              class:seleccionada={interaccion.seleccion === 'descarte'}
              data-carta={arriba}
              data-desde="mazo"
              use:interaccion.origen={'descarte'}
            >
              <Carta id={base(arriba)} />
            </div>
          {/key}
        {/if}
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
            <span class="hueco-base" aria-hidden="true">A</span>
          {:else}
            {#key fundacion.at(-1)}
              <div class="carta-pos inerte" data-carta={fundacion.at(-1)}><Carta id={base(fundacion.at(-1)!)} /></div>
            {/key}
          {/if}
        </div>
      {/each}
    </div>

    <div class="columnas">
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
          style:height="calc(var(--alto-carta) + {Math.max(0, columna.length - 1)} * var(--paso))"
          onclick={() => interaccion.tocarDestino(zona)}
          onkeydown={() => {}}
        >
          {#each columna as id, k (id)}
            {@const origen = `${zona}:${k}`}
            <div
              class="carta-pos"
              class:seleccionada={interaccion.seleccion !== null && interaccion.seleccion.startsWith(`${zona}:`) && Number(interaccion.seleccion.split(':')[1]) <= k}
              style:top="calc({k} * var(--paso))"
              data-carta={id}
              data-indice={k}
              use:interaccion.origen={origen}
            >
              <Carta id={base(id)} />
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
  .ladrones {
    --hueco: clamp(2px, 0.8vw, 8px);
    /* Diez pilas en cada fila: el mazo, el descarte y las 8 fundaciones; y las 10 columnas. */
    --ancho-carta: min(calc((100vw - 16px - 9 * var(--hueco)) / 10), 76px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    /* Paso entre cartas: holgado con pocas y más apretado con muchas, sin tapar el índice. */
    --paso: max(
      calc(var(--alto-carta) * 0.2),
      min(
        calc(var(--alto-carta) * 0.3),
        calc((100dvh - 150px - 2.4 * var(--alto-carta)) / var(--divisor))
      )
    );
    width: min(100%, calc(10 * 76px + 9 * 8px + 16px));
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
    margin-bottom: calc(var(--hueco) * 2 + 6px);
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

  .descarte {
    outline: none;
  }

  .contador {
    position: absolute;
    right: 2px;
    bottom: 2px;
    padding: 0 4px;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 700;
    background: rgb(0 0 0 / 0.55);
  }

  .hueco-base {
    display: grid;
    place-items: center;
    height: 100%;
    font-size: calc(var(--ancho-carta) * 0.45);
    font-weight: 700;
    color: var(--texto-suave);
    opacity: 0.6;
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
