<script lang="ts">
  import type { Asiento, IdCarta } from '@juegos/engine';
  import type { Snippet } from 'svelte';
  import { animar, medir, type Posiciones } from '../../interaccion/flip';
  import { Interaccion } from '../../interaccion/interaccion.svelte';
  import { HUMANO } from '../../sesion/sesion.svelte';
  import { T } from '../../textos';
  import AsientoRival from './AsientoRival.svelte';
  import { lado, nombreAsiento, type EstadoSesion, type VistaBazas } from './asientos';
  import ManoPropia from './ManoPropia.svelte';
  import MazoYMuestra from './MazoYMuestra.svelte';
  import Tapete from './Tapete.svelte';

  /**
   * Mesa común de los juegos de bazas: rivales, mazo y muestra, tapete con la baza en curso y
   * la mano propia. Cada juego aporta su barra de información, sus acciones y sus avisos.
   */
  interface Props {
    vista: VistaBazas;
    sesion: EstadoSesion;
    jugable: (carta: IdCarta) => boolean;
    jugar: (carta: IdCarta) => void;
    /** Carta de la mano de un rival que todos ven. */
    cartaVisible?: (asiento: Asiento) => IdCarta | null;
    /** Aviso propio del juego; si es `null`, se usan los de baza y fin de mano. */
    aviso?: string | null;
    detalleAviso?: Snippet | undefined;
    /** Barra de información (triunfo, manos, cantes…). */
    info: Snippet;
    /** Botones de acción junto a la mano propia; reciben cómo cancelar la selección. */
    acciones?: Snippet<[() => void]>;
    /** Nombre de cada asiento; por defecto, «Tú», «Rival», «Compañero»… */
    nombre?: (asiento: Asiento) => string;
    /** Texto junto al nombre de cada asiento; por defecto, las bazas ganadas. */
    detalle?: (asiento: Asiento) => string;
  }

  let {
    vista,
    sesion,
    jugable,
    jugar,
    cartaVisible = () => null,
    aviso = null,
    detalleAviso,
    info,
    acciones,
    nombre = (asiento: Asiento) => nombreAsiento(asiento, vista.config.jugadores),
    detalle = (asiento: Asiento) => T.brisca.bazas(vista.bazas[asiento] ?? 0),
  }: Props = $props();

  const n = $derived(vista.config.jugadores);
  const rivales = $derived(Array.from({ length: n - 1 }, (_, i) => i + 1));
  const activo = (asiento: Asiento) => vista.turno === asiento && sesion.fin === null;

  // ── Baza en curso y avisos ─────────────────────────────────────────────────

  /** Durante la pausa tras una baza se sigue viendo la baza completa. */
  const viendoBaza = $derived(
    sesion.bloqueada &&
      sesion.pensando === null &&
      vista.mesa.length === 0 &&
      vista.ultimaBaza !== null,
  );
  const enMesa = $derived(viendoBaza ? vista.ultimaBaza!.cartas : vista.mesa);

  const avisoBaza = $derived.by(() => {
    if (sesion.fin !== null) return null;
    if (viendoBaza) return T.brisca.ganaBaza(nombre(vista.ultimaBaza!.ganador));
    const ultima = vista.resultadosManos.at(-1);
    const manoNueva = vista.bazas.every((b) => b === 0) && vista.mesa.length === 0;
    if (sesion.bloqueada && sesion.pensando === null && ultima && manoNueva) {
      return T.brisca.finMano(ultima.puntos[0], ultima.puntos[1]);
    }
    return null;
  });

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (sesion.bloqueada) return '';
    return vista.turno === HUMANO ? T.brisca.tuTurno : T.brisca.turnoDe(nombre(vista.turno));
  });

  // ── Interacción ────────────────────────────────────────────────────────────

  const interaccion = new Interaccion({
    destinos: (carta) => (jugable(carta as IdCarta) ? ['mesa'] : []),
    destinoObvio: (carta) => (jugable(carta as IdCarta) ? 'mesa' : null),
    mover(carta, destino) {
      if (destino === 'mesa') jugar(carta as IdCarta);
    },
    elementos: (_carta, nodo) => [nodo],
  });

  // ── Animación ──────────────────────────────────────────────────────────────

  let raiz: HTMLElement | undefined = $state();
  let previas: Posiciones = new Map();
  $effect.pre(() => {
    void vista;
    void enMesa;
    if (raiz) previas = medir(raiz);
  });
  $effect(() => {
    void vista;
    void enMesa;
    if (raiz) animar(raiz, previas);
  });
</script>

<div class="mesa-bazas" class:cuatro={n >= 3} bind:this={raiz}>
  <div class="info">{@render info()}</div>

  {#each rivales as asiento (asiento)}
    <AsientoRival
      {asiento}
      lado={lado(asiento, n)}
      nombre={nombre(asiento)}
      detalle={detalle(asiento)}
      cartas={vista.cartasEnMano[asiento] ?? 0}
      activo={activo(asiento)}
      visible={cartaVisible(asiento)}
    />
  {/each}

  <div class="centro">
    {#if vista.mazo > 0 || vista.muestra !== null}
      <MazoYMuestra mazo={vista.mazo} muestra={vista.muestra} />
    {/if}
    <Tapete
      jugadas={enMesa}
      jugadores={n}
      {interaccion}
      aviso={aviso ?? avisoBaza}
      detalleAviso={aviso ? detalleAviso : undefined}
    />
  </div>

  <div class="propio" class:activo={activo(HUMANO)}>
    <div class="estado">
      <span class="nombre">
        {nombre(HUMANO)} <small data-testid="detalle-propio">{detalle(HUMANO)}</small>
      </span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
      {@render acciones?.(() => interaccion.cancelar())}
    </div>
    <ManoPropia cartas={vista.miMano ?? []} {jugable} {interaccion} />
  </div>
</div>

<style>
  .mesa-bazas {
    --ancho-carta: min(19vw, 13dvh, 104px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-rival: min(10vw, 7dvh, 54px);
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

  /* Con 3 y 4 jugadores la mesa central comparte el ancho con dos rivales laterales. */
  .mesa-bazas.cuatro {
    --ancho-carta: min(16vw, 11dvh, 96px);
    --ancho-rival: min(9vw, 6dvh, 48px);
    --escala-mazo: 0.7;
  }

  .info {
    grid-area: info;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px 18px;
    color: var(--texto-suave);
    font-size: 0.9rem;
  }

  .centro {
    grid-area: centro;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 3vw, 28px);
    min-width: 0;
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
    gap: 6px 12px;
    min-height: 44px;
  }

  .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: rgb(0 0 0 / 0.2);
  }

  .nombre small {
    font-weight: 400;
    color: var(--texto-suave);
    margin-left: 4px;
  }

  .activo .nombre {
    background: var(--acento);
    color: #2b2005;
  }

  .activo .nombre small {
    color: #5b4a12;
  }

  .turno {
    font-weight: 600;
  }
</style>
