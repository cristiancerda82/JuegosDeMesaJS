<script lang="ts">
  import {
    valorEscoba,
    type AccionEscoba,
    type Asiento,
    type ConfigEscoba,
    type EstadoEscoba,
    type IdCarta,
    type VistaEscoba,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import { Interaccion } from '../interaccion/interaccion.svelte';
  import { bandoDe, porBando, type SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AsientoRival from './bazas/AsientoRival.svelte';
  import { lado, nombreAsiento } from './bazas/asientos';
  import ManoPropia from './bazas/ManoPropia.svelte';
  import DesgloseEscoba from './DesgloseEscoba.svelte';

  interface Props {
    sesion: SesionMesa<ConfigEscoba, EstadoEscoba, AccionEscoba, VistaEscoba>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  const miBando = $derived(bandoDe(yo) as 0 | 1);
  const rivales = $derived(Array.from({ length: n }, (_, a) => a).filter((a) => a !== yo));
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, n, yo, sesion.red);
  const lados = $derived<[string, string]>(
    n === 2 ? [T.brisca.tu, T.brisca.rival] : [T.brisca.nosotros, T.brisca.ellos],
  );
  const activo = (asiento: Asiento) => vista.turno === asiento && sesion.fin === null;

  // ── Jugadas de una carta ───────────────────────────────────────────────────

  const jugadasDe = (carta: string) => legales.filter((a) => a.carta === carta);
  const jugable = (carta: IdCarta) => jugadasDe(carta).length > 0;
  const ordenMesa = (cartas: readonly IdCarta[]) =>
    vista.mesa.filter((c) => cartas.includes(c));

  /** Selector abierto cuando una carta soltada en la mesa tiene varias jugadas. */
  let opciones: { carta: IdCarta; jugadas: AccionEscoba[] } | null = $state(null);

  function jugar(accion: AccionEscoba) {
    opciones = null;
    seleccionMesa = [];
    interaccion.cancelar();
    sesion.jugar(accion);
  }

  /** Soltar una carta en la mesa: la única jugada se aplica; si hay varias, se pregunta. */
  function soltar(carta: IdCarta) {
    const jugadas = jugadasDe(carta);
    if (jugadas.length === 1) jugar(jugadas[0]!);
    else if (jugadas.length > 1) opciones = { carta, jugadas };
  }

  const interaccion = new Interaccion({
    destinos: (carta) => (jugable(carta as IdCarta) ? ['mesa'] : []),
    destinoObvio: (carta) => (jugable(carta as IdCarta) ? 'mesa' : null),
    mover(carta, destino) {
      if (destino === 'mesa') soltar(carta as IdCarta);
    },
    elementos: (_carta, nodo) => [nodo],
  });

  // ── Captura armada tocando la mesa ─────────────────────────────────────────

  const elegida = $derived(interaccion.seleccion as IdCarta | null);
  let seleccionMesa: IdCarta[] = $state([]);
  $effect(() => {
    void elegida;
    seleccionMesa = [];
  });

  /** Cartas de la mesa que aparecen en alguna captura de la carta elegida. */
  const capturables = $derived(
    new Set(elegida === null ? [] : jugadasDe(elegida).flatMap((a) => a.captura)),
  );
  const suma = $derived(
    elegida === null
      ? 0
      : valorEscoba(elegida) + seleccionMesa.reduce((s, c) => s + valorEscoba(c), 0),
  );
  const capturaElegida = $derived.by(() => {
    if (elegida === null || seleccionMesa.length === 0) return null;
    const clave = JSON.stringify(ordenMesa(seleccionMesa));
    return jugadasDe(elegida).find((a) => JSON.stringify(a.captura) === clave) ?? null;
  });
  const dejarLegal = $derived(
    elegida === null ? null : (jugadasDe(elegida).find((a) => a.captura.length === 0) ?? null),
  );

  function tocarMesa(carta: IdCarta, ev: MouseEvent) {
    ev.stopPropagation();
    if (elegida === null || !capturables.has(carta)) return;
    seleccionMesa = seleccionMesa.includes(carta)
      ? seleccionMesa.filter((c) => c !== carta)
      : [...seleccionMesa, carta];
  }

  // ── Jugada reciente y avisos ───────────────────────────────────────────────

  const enPausa = $derived(sesion.bloqueada && sesion.pensando === null);
  /** Durante la pausa tras una captura se ven juntas la carta jugada y las recogidas. */
  const recogida = $derived(
    enPausa && vista.ultimaJugada !== null && vista.ultimaJugada.captura.length > 0
      ? vista.ultimaJugada
      : null,
  );
  const aviso = $derived.by(() => {
    if (recogida === null) return null;
    const quien = nombre(recogida.asiento);
    return recogida.escoba
      ? T.escoba.escobaDe(quien)
      : T.escoba.recoge(quien, recogida.captura.length + 1);
  });

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (sesion.bloqueada) return '';
    return vista.turno === yo ? T.brisca.tuTurno : T.brisca.turnoDe(nombre(vista.turno));
  });

  // ── Desglose al terminar cada mano ─────────────────────────────────────────

  let desglose: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      desglose = total - 1;
      sesion.pausar();
    }
    manosVistas = total;
  });

  /** Totales de la partida justo después de la mano `i`. */
  function totalesHasta(i: number): [number, number] {
    const t: [number, number] = [0, 0];
    for (const r of vista.resultadosManos.slice(0, i + 1)) {
      t[0] += r.puntos[0].total;
      t[1] += r.puntos[1].total;
    }
    return t;
  }

  function siguienteMano() {
    desglose = null;
    sesion.reanudar();
  }

  // ── Animación ──────────────────────────────────────────────────────────────

  let raiz: HTMLElement | undefined = $state();
  let previas: Posiciones = new Map();
  $effect.pre(() => {
    void vista;
    void recogida;
    if (raiz) previas = medir(raiz);
  });
  $effect(() => {
    void vista;
    void recogida;
    if (raiz) animar(raiz, previas);
  });
</script>

<div class="escoba" class:cuatro={n === 4} bind:this={raiz}>
  <div class="info">
    <span data-testid="puntos-partida">
      {T.escoba.puntos(...porBando(vista.puntosPartida, yo), vista.config.puntosPartida)}
    </span>
    {#each [0, 1] as const as k (k)}
      {@const b = k === 0 ? miBando : ((1 - miBando) as 0 | 1)}
      <span class="monton" data-testid="monton-{k}">
        {lados[k]}: {T.escoba.montonCartas(vista.cartasRecogidas[b])}
        {#if vista.escobas[b] > 0}
          · <b class="escobas">{T.escoba.montonEscobas(vista.escobas[b])}</b>
        {/if}
      </span>
    {/each}
  </div>

  {#each rivales as asiento (asiento)}
    <AsientoRival
      {asiento}
      lado={lado(asiento, n, yo)}
      nombre={nombre(asiento)}
      detalle=""
      cartas={vista.cartasEnMano[asiento] ?? 0}
      activo={activo(asiento)}
    />
  {/each}

  <div class="centro">
    {#if vista.mazo > 0}
      <div class="mazo" data-zona="mazo">
        <Carta />
        <span
          class="cuenta"
          data-testid="cartas-mazo"
          title={T.brisca.enMazo(vista.mazo)}
          aria-label={T.brisca.enMazo(vista.mazo)}>{vista.mazo}</span
        >
      </div>
    {/if}

    <div
      class="mesa"
      class:legal={interaccion.resaltados.has('mesa')}
      data-destino="mesa"
      data-testid="mesa"
      aria-label={T.escoba.mesa}
      role="button"
      tabindex="-1"
      onclick={() => interaccion.tocarDestino('mesa')}
      onkeydown={() => {}}
    >
      {#each vista.mesa as id (id)}
        <button
          type="button"
          class="carta-mesa"
          class:capturable={capturables.has(id)}
          class:elegida={seleccionMesa.includes(id)}
          data-carta={id}
          data-desde={vista.ultimaJugada?.carta === id
            ? `mano-${vista.ultimaJugada.asiento}`
            : 'mazo'}
          data-testid="mesa-{id}"
          aria-pressed={seleccionMesa.includes(id)}
          onclick={(ev) => tocarMesa(id, ev)}
        >
          <Carta {id} />
        </button>
      {/each}

      {#if recogida}
        <div class="recogida" class:es-escoba={recogida.escoba} data-testid="recogida">
          {#each [recogida.carta, ...recogida.captura] as id (id)}
            <div class="carta-recogida" data-carta={id} data-desde="mano-{recogida.asiento}">
              <Carta {id} />
            </div>
          {/each}
        </div>
      {/if}
      {#if aviso}
        <div class="aviso" role="status" data-testid="aviso">{aviso}</div>
      {/if}
    </div>
  </div>

  <div class="propio" class:activo={activo(yo)}>
    <div class="estado">
      <span class="nombre">{T.brisca.tu}</span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
      {#if elegida !== null && jugable(elegida)}
        <span class="suma" class:completa={suma === 15} data-testid="suma">
          {T.escoba.suma(suma)}
        </span>
        <button
          class="principal"
          data-testid="recoger"
          disabled={capturaElegida === null}
          onclick={() => capturaElegida && jugar(capturaElegida)}>{T.escoba.recoger}</button
        >
        {#if dejarLegal}
          <button data-testid="dejar" onclick={() => dejarLegal && jugar(dejarLegal)}
            >{T.escoba.dejar}</button
          >
        {/if}
      {/if}
    </div>
    <ManoPropia cartas={vista.miMano ?? []} {jugable} {interaccion} />
  </div>
</div>

{#if opciones}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-label={T.escoba.elegirCaptura} data-testid="opciones-captura">
      <h2>{T.escoba.elegirCaptura}</h2>
      <div class="jugada-elegida"><span class="mini"><Carta id={opciones.carta} /></span></div>
      <ul>
        {#each opciones.jugadas as jugada, i (i)}
          <li>
            <button class:principal={jugada.captura.length > 0} onclick={() => jugar(jugada)} data-testid="opcion-{i}">
              {#if jugada.captura.length > 0}
                <span class="grupo">
                  {#each jugada.captura as id (id)}
                    <span class="mini"><Carta {id} /></span>
                  {/each}
                </span>
                {T.escoba.recogerCartas(jugada.captura.length)}
              {:else}
                {T.escoba.dejar}
              {/if}
            </button>
          </li>
        {/each}
      </ul>
      <button onclick={() => (opciones = null)}>{T.escoba.cancelar}</button>
    </div>
  </div>
{/if}

{#if desglose !== null && vista.resultadosManos[desglose]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.escoba.finMano}</h2>
      <DesgloseEscoba
        resultado={vista.resultadosManos[desglose]!}
        {lados}
        totales={totalesHasta(desglose)}
        bando={miBando}
      />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.escoba.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .escoba {
    --ancho-carta: min(19vw, 13dvh, 104px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-rival: min(10vw, 7dvh, 54px);
    --ancho-mesa: min(15vw, 11dvh, 86px);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas:
      'info info info'
      'arriba arriba arriba'
      'izquierda centro derecha'
      'abajo abajo abajo';
    gap: 8px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .escoba.cuatro {
    --ancho-carta: min(16vw, 11dvh, 96px);
    --ancho-rival: min(9vw, 6dvh, 48px);
    --ancho-mesa: min(12vw, 9dvh, 76px);
  }

  .info {
    grid-area: info;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px 16px;
    color: var(--texto-suave);
    font-size: 0.88rem;
  }

  .escobas {
    color: var(--acento);
  }

  .centro {
    grid-area: centro;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 2vw, 20px);
    min-width: 0;
  }

  .mazo {
    position: relative;
    flex: none;
    width: calc(var(--ancho-mesa) * 0.8);
    aspect-ratio: 100 / 140;
  }

  .cuenta {
    position: absolute;
    right: 3px;
    bottom: 3px;
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    background: rgb(0 0 0 / 0.55);
  }

  .mesa {
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: calc(var(--ancho-mesa) * 1.4 * 2 + 24px);
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    border-radius: 18px;
    background: rgb(0 0 0 / 0.12);
    outline: 2px dashed rgb(255 255 255 / 0.15);
    outline-offset: -2px;
  }

  .mesa.legal {
    outline: 3px solid var(--resalte);
    box-shadow: 0 0 18px rgb(255 224 102 / 0.45);
  }

  .carta-mesa {
    flex: none;
    width: var(--ancho-mesa);
    aspect-ratio: 100 / 140;
    min-height: 0;
    padding: 0;
    border: none;
    border-radius: 7%;
    background: none;
    transition: translate 120ms;
  }

  .carta-mesa.capturable {
    outline: 2px solid rgb(255 224 102 / 0.75);
    outline-offset: 1px;
  }

  .carta-mesa.elegida {
    outline: 3px solid var(--resalte);
    translate: 0 -6px;
    box-shadow: 0 0 14px rgb(255 224 102 / 0.6);
  }

  .recogida {
    display: flex;
    gap: 4px;
    padding: 6px;
    border-radius: 12px;
    background: rgb(255 224 102 / 0.18);
    outline: 2px solid rgb(255 224 102 / 0.6);
  }

  .recogida.es-escoba {
    background: rgb(255 224 102 / 0.35);
  }

  .carta-recogida {
    width: calc(var(--ancho-mesa) * 0.8);
    aspect-ratio: 100 / 140;
  }

  .aviso {
    position: absolute;
    left: 50%;
    bottom: -6px;
    transform: translate(-50%, 100%);
    padding: 4px 12px;
    border-radius: 14px;
    white-space: nowrap;
    font-weight: 700;
    background: rgb(0 0 0 / 0.6);
    z-index: 5;
  }

  .propio {
    grid-area: abajo;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .estado {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 10px;
    min-height: 44px;
  }

  .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: rgb(0 0 0 / 0.2);
  }

  .activo .nombre {
    background: var(--acento);
    color: #2b2005;
  }

  .turno {
    font-weight: 600;
  }

  .suma {
    padding: 2px 10px;
    border-radius: 12px;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    background: rgb(0 0 0 / 0.3);
  }

  .suma.completa {
    background: var(--acento);
    color: #2b2005;
  }

  .velo {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgb(0 0 0 / 0.5);
    z-index: 1500;
  }

  .dialogo {
    width: min(100%, 420px);
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    padding: 18px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.2rem;
    margin-bottom: 10px;
  }

  .dialogo ul {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 10px 0;
    padding: 0;
    list-style: none;
  }

  .dialogo ul button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .dialogo > button {
    margin-top: 12px;
    width: 100%;
  }

  .jugada-elegida {
    display: flex;
    justify-content: center;
  }

  .grupo {
    display: inline-flex;
    gap: 3px;
  }

  .mini {
    display: block;
    width: 34px;
    aspect-ratio: 100 / 140;
  }
</style>
