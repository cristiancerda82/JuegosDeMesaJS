<script lang="ts">
  import {
    baseSpider,
    cartaDeId,
    type AccionSpider,
    type CartaSpider,
    type ConfigSpider,
    type EstadoSpider,
    type VistaSpider,
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
    sesion: SesionMesa<ConfigSpider, EstadoSpider, AccionSpider, VistaSpider>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const puede = (tipo: AccionSpider['tipo']) => legales.some((a) => a.tipo === tipo);
  type Mover = Extract<AccionSpider, { tipo: 'mover' }>;

  // ── Orígenes y destinos ────────────────────────────────────────────────────
  // Origen "c<i>:<k>": la carta visible k de la columna i y las que tiene encima.

  function desdeYCantidad(origen: string): { desde: number; cantidad: number } {
    const [zona, k] = origen.split(':') as [string, string];
    const desde = Number(zona.slice(1));
    return { desde, cantidad: vista.columnas[desde]!.visibles.length - Number(k) };
  }

  function movimientos(origen: string): Mover[] {
    const { desde, cantidad } = desdeYCantidad(origen);
    return legales.filter(
      (a): a is Mover => a.tipo === 'mover' && a.desde === desde && a.cantidad === cantidad,
    );
  }

  const paloDe = (c: CartaSpider) => cartaDeId(baseSpider(c))!.palo;
  const vacia = (i: number) =>
    vista.columnas[i]!.ocultas === 0 && vista.columnas[i]!.visibles.length === 0;

  /** Doble toque: mejor alargar una escalera del mismo palo; si no, otra carta; si no, una vacía. */
  function mejorDestino(origen: string): string | null {
    const lista = movimientos(origen);
    if (lista.length === 0) return null;
    const { desde, cantidad } = desdeYCantidad(origen);
    const carta = vista.columnas[desde]!.visibles.at(-cantidad)!;
    const mismoPalo = lista.find((m) => {
      const tope = vista.columnas[m.hasta]!.visibles.at(-1);
      return tope !== undefined && paloDe(tope) === paloDe(carta);
    });
    const elegido = mismoPalo ?? lista.find((m) => !vacia(m.hasta)) ?? lista[0]!;
    return `c${elegido.hasta}`;
  }

  const interaccion = new Interaccion({
    destinos: (origen) => movimientos(origen).map((m) => `c${m.hasta}`),
    destinoObvio: mejorDestino,
    mover(origen, destino) {
      const m = movimientos(origen).find((x) => `c${x.hasta}` === destino);
      if (m) sesion.jugar(m);
    },
    elementos(origen, nodo) {
      const desde = Number(origen.split(':')[1]);
      return [...(nodo.parentElement?.querySelectorAll<HTMLElement>('[data-indice]') ?? [])].filter(
        (el) => Number(el.dataset.indice) >= desde,
      );
    },
  });

  /** Qué resaltar para una pista: las cartas que se moverían y su destino, o el mazo. */
  function resalte(pista: AccionSpider): Resalte {
    if (pista.tipo !== 'mover') return { cartas: [], pilas: ['mazo'] };
    return {
      cartas: vista.columnas[pista.desde]!.visibles.slice(-pista.cantidad),
      pilas: [`c${pista.hasta}`],
    };
  }

  /** Toda la mesa, con el mazo (que está en la barra): ahí se buscan los resaltes. */
  let mesaEntera: HTMLElement | undefined = $state();

  function accion(tipo: 'deshacer' | 'repartir') {
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

  /** Repartos que quedaban en la vista anterior: si bajan, las cartas nuevas vienen del mazo. */
  let repartosPrevios = 5;
  const recienRepartido = $derived(vista.repartosRestantes < repartosPrevios);
  $effect(() => {
    repartosPrevios = vista.repartosRestantes;
  });

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

  /**
   * Altura de la columna más larga en pasos: las cartas boca abajo ocupan menos. Con ella se
   * aprieta el paso entre cartas para que todo quepa en la pantalla.
   */
  const OCULTA = 0.35;
  const masLarga = $derived(
    Math.max(1, ...vista.columnas.map((c) => c.visibles.length - 1 + c.ocultas * OCULTA)),
  );
  const altura = (c: VistaSpider['columnas'][number]) =>
    `calc(var(--alto-carta) + ${Math.max(0, c.visibles.length - 1 + c.ocultas * OCULTA)} * var(--paso))`;
</script>

<div class="spider" style:--divisor={masLarga} bind:this={mesaEntera}>
  <div class="barra">
    <button
      class="mazo"
      onclick={() => accion('repartir')}
      disabled={!puede('repartir')}
      data-zona="mazo"
      data-testid="mazo"
      aria-label={`${T.partida.repartir}. ${T.partida.repartos(vista.repartosRestantes)}`}
      title={T.partida.repartir}
    >
      {#each { length: vista.repartosRestantes }, k (k)}
        <span class="dorso" style:left="{k * 5}px"><Carta /></span>
      {/each}
      {#if vista.repartosRestantes === 0}<span class="hueco-mazo"></span>{/if}
    </button>
    <span class="dato"><span class="etiqueta">{T.partida.repartos(vista.repartosRestantes)}</span></span>
    <span class="completadas" data-testid="completadas" aria-label="{T.partida.escaleras}: {vista.completadas.length}">
      {#each vista.completadas as p, k (k)}
        <span class="rey"><Carta id={`${p}-13`} /></span>
      {/each}
      <span class="etiqueta">{vista.completadas.length}/8</span>
    </span>
    <span class="dato"><span class="etiqueta">{T.partida.movimientos}</span> <b data-testid="movimientos">{vista.movimientos}</b></span>
    <span class="dato"><span class="etiqueta">{T.partida.tiempo}</span> <b>{tiempo}</b></span>
    <span class="acciones">
      <BotonPista {sesion} raiz={mesaEntera} {resalte} />
      <button onclick={() => accion('deshacer')} disabled={!puede('deshacer')} data-testid="deshacer">{T.partida.deshacer}</button>
      <button onclick={abandonar} disabled={!puede('abandonar')}>{T.partida.abandonar}</button>
    </span>
  </div>

  <div class="columnas" bind:this={raiz}>
    {#each vista.columnas as columna, i (i)}
      {@const zona = `c${i}`}
      <div
        class="columna"
        class:vacia={columna.ocultas + columna.visibles.length === 0}
        class:legal={interaccion.resaltados.has(zona)}
        data-destino={zona}
        data-testid={zona}
        aria-label={T.partida.columna(i + 1)}
        role="button"
        tabindex="-1"
        style:height={altura(columna)}
        onclick={() => interaccion.tocarDestino(zona)}
        onkeydown={() => {}}
      >
        {#each { length: columna.ocultas }, k (k)}
          <div class="carta-pos inerte" style:top="calc({k * OCULTA} * var(--paso))"><Carta /></div>
        {/each}
        {#each columna.visibles as id, k (id)}
          {@const origen = `${zona}:${k}`}
          <div
            class="carta-pos"
            class:seleccionada={interaccion.seleccion !== null &&
              interaccion.seleccion.startsWith(`${zona}:`) &&
              Number(interaccion.seleccion.split(':')[1]) <= k}
            style:top="calc({columna.ocultas * OCULTA + k} * var(--paso))"
            data-carta={id}
            data-indice={k}
            data-desde={recienRepartido && k === columna.visibles.length - 1 ? 'mazo' : undefined}
            data-testid="carta-{id}"
            use:interaccion.origen={origen}
          >
            <Carta id={baseSpider(id)} />
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<AvisoAtasco
  {legales}
  terminada={sesion.fin !== null}
  deshacer={() => accion('deshacer')}
  abandonar={() => sesion.jugar({ tipo: 'abandonar' })}
/>

<style>
  .spider {
    --hueco: clamp(2px, 0.8vw, 8px);
    --ancho-carta: min(calc((100vw - 16px - 9 * var(--hueco)) / 10), 76px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    /* Paso entre cartas: holgado con pocas y más apretado con muchas, sin tapar el índice. */
    --paso: max(
      calc(var(--alto-carta) * 0.2),
      min(
        calc(var(--alto-carta) * 0.3),
        calc((100dvh - 150px - 1.2 * var(--alto-carta)) / var(--divisor))
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
    gap: 4px 12px;
    padding: 6px 0 10px;
  }

  .mazo {
    position: relative;
    width: calc(var(--ancho-carta) + 20px);
    height: var(--alto-carta);
    padding: 0;
    border: none;
    background: none;
  }

  .mazo:disabled {
    opacity: 1;
    cursor: default;
  }

  .mazo .dorso {
    position: absolute;
    top: 0;
    width: var(--ancho-carta);
    height: var(--alto-carta);
  }

  .hueco-mazo {
    display: block;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    border-radius: 7%;
    outline: 2px dashed rgb(255 255 255 / 0.18);
    outline-offset: -2px;
  }

  .completadas {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .rey {
    display: block;
    width: calc(var(--ancho-carta) * 0.55);
    aspect-ratio: 100 / 140;
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
    gap: var(--hueco);
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .columna {
    position: relative;
    flex: none;
    width: var(--ancho-carta);
    min-height: var(--alto-carta);
    border-radius: 7%;
    outline: 2px dashed transparent;
    outline-offset: -2px;
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
