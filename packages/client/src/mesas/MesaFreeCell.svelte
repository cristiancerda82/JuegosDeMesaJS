<script lang="ts">
  import type {
    AccionFreeCell,
    ConfigFreeCell,
    EstadoFreeCell,
    PilaFreeCell,
    VistaFreeCell,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import { Interaccion } from '../interaccion/interaccion.svelte';
  import type { Sesion } from '../sesion/sesion.svelte';
  import { T } from '../textos';
  import { formatoTiempo } from './tiempo';

  interface Props {
    sesion: Sesion<ConfigFreeCell, EstadoFreeCell, AccionFreeCell, VistaFreeCell>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const puede = (tipo: AccionFreeCell['tipo']) => legales.some((a) => a.tipo === tipo);
  type Mover = Extract<AccionFreeCell, { tipo: 'mover' }>;

  // ── Orígenes y destinos ────────────────────────────────────────────────────
  // Orígenes: "l<i>" (carta de una celda) y "c<i>:<k>" (carta k de la columna i y las de encima).

  function pilaYCantidad(origen: string): { pila: PilaFreeCell; cantidad: number } {
    if (origen.startsWith('c')) {
      const [pila, k] = origen.split(':') as [PilaFreeCell, string];
      return { pila, cantidad: vista.columnas[Number(pila.slice(1))]!.length - Number(k) };
    }
    return { pila: origen as PilaFreeCell, cantidad: 1 };
  }

  const celdaVacia = (pila: string) =>
    pila.startsWith('l') && vista.celdas[Number(pila.slice(1))] === null;
  const columnaVacia = (pila: string) =>
    pila.startsWith('c') && vista.columnas[Number(pila.slice(1))]!.length === 0;

  function movimientos(origen: string): Mover[] {
    const { pila, cantidad } = pilaYCantidad(origen);
    return legales.filter(
      (a): a is Mover => a.tipo === 'mover' && a.desde === pila && a.cantidad === cantidad,
    );
  }

  /**
   * El motor solo ofrece la primera celda libre y la primera columna vacía, porque son
   * equivalentes; en la mesa vale cualquiera, así que se busca el movimiento del mismo tipo.
   */
  function movimientoHacia(origen: string, destino: string): Mover | undefined {
    const lista = movimientos(origen);
    const exacto = lista.find((m) => m.hasta === destino);
    if (exacto) return exacto;
    if (celdaVacia(destino)) return lista.find((m) => celdaVacia(m.hasta));
    if (columnaVacia(destino)) return lista.find((m) => columnaVacia(m.hasta));
    return undefined;
  }

  function destinos(origen: string): string[] {
    const lista = movimientos(origen).map((m) => m.hasta as string);
    const todos = new Set(lista);
    if (lista.some(celdaVacia)) vista.celdas.forEach((c, i) => c === null && todos.add(`l${i}`));
    if (lista.some(columnaVacia)) {
      vista.columnas.forEach((c, i) => c.length === 0 && todos.add(`c${i}`));
    }
    return [...todos];
  }

  const interaccion = new Interaccion({
    destinos,
    destinoObvio(origen) {
      const lista = movimientos(origen).map((m) => m.hasta);
      return lista.find((d) => d.startsWith('f')) ?? lista.find((d) => d.startsWith('l')) ?? null;
    },
    mover(origen, destino) {
      const m = movimientoHacia(origen, destino);
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

  function accion(tipo: 'deshacer' | 'autocompletar') {
    interaccion.cancelar();
    sesion.jugar({ tipo });
  }

  function abandonar() {
    if (confirm(T.partida.confirmarAbandono)) sesion.jugar({ tipo: 'abandonar' });
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

  /** Las columnas largas se solapan más para caber sin scroll. */
  const masLarga = $derived(Math.max(1, ...vista.columnas.map((c) => c.length)));
</script>

<div class="freecell" style:--divisor={Math.max(1, masLarga - 1)}>
  <div class="barra">
    <span class="dato"><span class="etiqueta">{T.partida.partidaN}</span> <b data-testid="numero">{vista.numero}</b></span>
    <span class="dato"><span class="etiqueta">{T.partida.movimientos}</span> <b data-testid="movimientos">{vista.movimientos}</b></span>
    <span class="dato"><span class="etiqueta">{T.partida.tiempo}</span> <b>{tiempo}</b></span>
    <span class="dato"><span class="etiqueta">{T.partida.maxMovible}</span> <b data-testid="max-movible">{T.partida.cartasN(vista.maxMovible)}</b></span>
    <span class="acciones">
      <button onclick={() => accion('deshacer')} disabled={!puede('deshacer')} data-testid="deshacer">{T.partida.deshacer}</button>
      {#if puede('autocompletar')}
        <button class="principal" onclick={() => accion('autocompletar')} data-testid="autocompletar">{T.partida.autocompletar}</button>
      {/if}
      <button onclick={abandonar} disabled={!puede('abandonar')}>{T.partida.abandonar}</button>
    </span>
  </div>

  <div class="mesa" bind:this={raiz}>
    <div class="fila">
      {#each vista.celdas as carta, i (i)}
        {@const zona = `l${i}`}
        <div
          class="pila celda"
          class:legal={interaccion.resaltados.has(zona)}
          data-destino={zona}
          data-testid={zona}
          aria-label={T.partida.celda(i + 1)}
          role="button"
          tabindex="-1"
          onclick={() => interaccion.tocarDestino(zona)}
          onkeydown={() => {}}
        >
          {#if carta !== null}
            <div
              class="carta-pos"
              class:seleccionada={interaccion.seleccion === zona}
              data-carta={carta}
              use:interaccion.origen={zona}
            >
              <Carta id={carta} />
            </div>
          {/if}
        </div>
      {/each}
      {#each { length: 4 - vista.celdas.length }, k (k)}
        <div class="hueco-vacio"></div>
      {/each}

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
          {#if fundacion.length === 0}<span class="marca-as" aria-hidden="true">A</span>{/if}
          {#each fundacion as id (id)}
            <div class="carta-pos inerte" data-carta={id}><Carta {id} /></div>
          {/each}
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
              class:seleccionada={interaccion.seleccion !== null &&
                interaccion.seleccion.startsWith(`${zona}:`) &&
                Number(interaccion.seleccion.split(':')[1]) <= k}
              style:top="calc({k} * var(--paso))"
              data-carta={id}
              data-indice={k}
              data-testid="carta-{id}"
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

<style>
  .freecell {
    --hueco: clamp(3px, 1vw, 10px);
    --ancho-carta: min(calc((100vw - 16px - 7 * var(--hueco)) / 8), 88px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    /* Paso entre cartas de una columna: holgado con pocas, más apretado con muchas, pero
       siempre dejando a la vista el índice de cada carta. */
    --paso: max(
      calc(var(--alto-carta) * 0.2),
      min(
        calc(var(--alto-carta) * 0.36),
        calc((100dvh - 150px - 2.3 * var(--alto-carta)) / var(--divisor))
      )
    );
    width: min(100%, calc(8 * 88px + 7 * 10px + 16px));
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
    margin-bottom: calc(var(--hueco) * 2);
  }

  .hueco-vacio {
    width: var(--ancho-carta);
    flex: none;
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

  /* Las celdas, hundidas; las fundaciones, con la «A» por la que empiezan. */
  .celda {
    outline-style: solid;
    outline-color: rgb(0 0 0 / 0.25);
    background: rgb(0 0 0 / 0.22);
  }

  .marca-as {
    display: grid;
    place-items: center;
    height: 100%;
    font-size: calc(var(--ancho-carta) * 0.5);
    font-weight: 800;
    color: rgb(255 255 255 / 0.22);
  }

  .columna {
    outline-color: transparent;
    min-height: var(--alto-carta);
  }

  .columna.vacia {
    outline-color: rgb(255 255 255 / 0.18);
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
