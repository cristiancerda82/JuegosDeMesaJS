<script lang="ts">
  import type {
    AccionPishti,
    Asiento,
    ConfigPishti,
    EstadoPishti,
    IdCarta,
    VistaPishti,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import { Interaccion } from '../interaccion/interaccion.svelte';
  import { bandoDe, porBando, type SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AsientoRival from './bazas/AsientoRival.svelte';
  import { lado, nombreAsiento } from './bazas/asientos';
  import ManoPropia from './bazas/ManoPropia.svelte';
  import ResumenPishti from './ResumenPishti.svelte';

  interface Props {
    sesion: SesionMesa<ConfigPishti, EstadoPishti, AccionPishti, VistaPishti>;
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

  // ── Jugar una carta ────────────────────────────────────────────────────────

  const jugable = (carta: IdCarta) => legales.some((a) => a.carta === carta);

  const interaccion = new Interaccion({
    destinos: (carta) => (jugable(carta as IdCarta) ? ['mesa'] : []),
    destinoObvio: (carta) => (jugable(carta as IdCarta) ? 'mesa' : null),
    mover(carta, destino) {
      if (destino !== 'mesa') return;
      const accion = legales.find((a) => a.carta === carta);
      if (accion) {
        interaccion.cancelar();
        sesion.jugar(accion);
      }
    },
    elementos: (_carta, nodo) => [nodo],
  });

  // ── Montón ─────────────────────────────────────────────────────────────────

  /** Cartas a la vista que se pintan: las 5 de arriba, la última encima. */
  const VISIBLES = 5;
  const visibles = $derived(vista.monton.slice(-VISIBLES));
  const totalMonton = $derived(vista.monton.length + vista.tapadas);

  // ── Jugada reciente y avisos ───────────────────────────────────────────────

  const enPausa = $derived(sesion.bloqueada && sesion.pensando === null);
  /** Durante la pausa tras llevarse el montón se ven juntas la carta jugada y las que se lleva. */
  const recogida = $derived(
    enPausa && vista.ultimaJugada !== null && vista.ultimaJugada.llevadas.length > 0
      ? vista.ultimaJugada
      : null,
  );
  const aviso = $derived.by(() => {
    if (recogida === null) return null;
    const quien = nombre(recogida.asiento);
    if (recogida.pishti > 0) return T.pishti.pishtiDe(quien, recogida.pishti);
    return T.pishti.seLleva(quien, recogida.llevadas.length + recogida.tapadas + 1);
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

<div class="pishti" class:cuatro={n === 4} bind:this={raiz}>
  <div class="info">
    <span data-testid="puntos-partida">
      {T.pishti.puntos(...porBando(vista.puntos, yo), vista.config.meta)}
    </span>
    {#each [0, 1] as const as k (k)}
      {@const b = k === 0 ? miBando : ((1 - miBando) as 0 | 1)}
      <span class="recogidas" data-testid="recogidas-{k}">
        {lados[k]}: {T.pishti.montonCartas(vista.cartasRecogidas[b])}
        {#if vista.pishtis[b].cuantos > 0}
          · <b class="destacado">{T.pishti.montonPishtis(vista.pishtis[b].cuantos)}</b>
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
      aria-label={T.pishti.monton}
      role="button"
      tabindex="-1"
      onclick={() => interaccion.tocarDestino('mesa')}
      onkeydown={() => {}}
    >
      <div class="pila" style:--n={visibles.length}>
        {#if vista.tapadas > 0}
          <div class="tapadas" data-testid="tapadas" title={T.pishti.tapadas(vista.tapadas)}>
            <Carta />
            <span class="cuenta">{vista.tapadas}</span>
          </div>
        {/if}
        {#each visibles as id, i (id)}
          <div
            class="carta-monton"
            class:arriba={i === visibles.length - 1}
            style:--i={i}
            data-carta={id}
            data-desde={vista.ultimaJugada?.carta === id
              ? `mano-${vista.ultimaJugada.asiento}`
              : 'mazo'}
            data-testid="monton-{id}"
          >
            <Carta {id} />
          </div>
        {/each}
      </div>
      {#if totalMonton > 0}
        <span class="total" data-testid="total-monton">{T.pishti.enMonton(totalMonton)}</span>
      {/if}

      {#if recogida}
        <div class="recogida" class:es-pishti={recogida.pishti > 0} data-testid="recogida">
          {#each [...recogida.llevadas, recogida.carta] as id (id)}
            <div class="carta-recogida" data-carta={id} data-desde="mano-{recogida.asiento}">
              <Carta {id} />
            </div>
          {/each}
        </div>
      {/if}
      {#if aviso}
        <div class="aviso" role="status" data-testid="aviso">{aviso}</div>
      {/if}
      <span class="oculto" data-testid="ultima-jugada" data-ultima={vista.ultimaJugada?.carta ?? ''}
      ></span>
    </div>
  </div>

  <div class="propio" class:activo={activo(yo)}>
    <div class="estado">
      <span class="nombre">{T.brisca.tu}</span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
    </div>
    <ManoPropia cartas={vista.miMano ?? []} {jugable} {interaccion} />
  </div>
</div>

{#if desglose !== null && vista.resultadosManos[desglose]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.pishti.finMano}</h2>
      <ResumenPishti resultado={vista.resultadosManos[desglose]!} {lados} bando={miBando} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.pishti.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .pishti {
    --ancho-carta: min(19vw, 13dvh, 104px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-rival: min(10vw, 7dvh, 54px);
    --ancho-mesa: min(17vw, 12dvh, 92px);
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
    min-height: calc(100dvh - 60px - var(--alto-asistente, 0px));
    margin: 0 auto;
    padding: 0 8px 12px;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .pishti.cuatro {
    --ancho-carta: min(17vw, 11dvh, 96px);
    --ancho-rival: min(9vw, 6dvh, 48px);
    --ancho-mesa: min(14vw, 10dvh, 80px);
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

  .destacado {
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

  .mazo,
  .tapadas {
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
    min-height: calc(var(--ancho-mesa) * 1.4 + 56px);
    display: flex;
    flex-direction: column;
    align-items: center;
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

  .pila {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: calc(var(--ancho-mesa) * 1.4);
  }

  /* Las cartas a la vista, en abanico: cada una asoma un poco por debajo de la siguiente. */
  .pila :global(.carta-monton) {
    flex: none;
    width: var(--ancho-mesa);
    aspect-ratio: 100 / 140;
    margin-left: calc(var(--ancho-mesa) * -0.72);
  }

  .pila :global(.carta-monton:first-of-type),
  .tapadas + :global(.carta-monton) {
    margin-left: 0;
  }

  .carta-monton.arriba {
    filter: drop-shadow(0 0 6px rgb(255 224 102 / 0.55));
  }

  .total {
    font-size: 0.8rem;
    color: var(--texto-suave);
  }

  .recogida {
    position: absolute;
    inset: auto 8px 8px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
    padding: 6px;
    border-radius: 12px;
    background: rgb(255 224 102 / 0.18);
    outline: 2px solid rgb(255 224 102 / 0.6);
  }

  .recogida.es-pishti {
    background: rgb(255 224 102 / 0.35);
  }

  .carta-recogida {
    width: calc(var(--ancho-mesa) * 0.6);
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

  .oculto {
    display: none;
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

  .dialogo > button {
    margin-top: 12px;
    width: 100%;
  }
</style>
