<script lang="ts">
  import {
    PALOS_FRANCESES,
    rangoBarbu,
    type AccionBarbu,
    type Asiento,
    type ConfigBarbu,
    type EstadoBarbu,
    type IdCarta,
    type PaloFrances,
    type VistaBarbu,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import { Interaccion } from '../interaccion/interaccion.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import ManoPropia from './bazas/ManoPropia.svelte';

  interface Props {
    sesion: SesionMesa<ConfigBarbu, EstadoBarbu, AccionBarbu, VistaBarbu>;
    nombre: (asiento: Asiento) => string;
  }

  let { sesion, nombre }: Props = $props();

  const JOTA = 11;
  const JUGADORES = 4;
  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  // Los rivales en el orden de juego, empezando por el siguiente al jugador.
  const rivales = $derived(Array.from({ length: JUGADORES - 1 }, (_, i) => (yo + i + 1) % JUGADORES));
  const activo = (asiento: Asiento) => vista.turno === asiento && sesion.fin === null;

  const jugable = (carta: IdCarta) => legales.some((a) => a.tipo === 'jugar' && a.carta === carta);
  const soloPasar = $derived(legales.length === 1 && legales[0]!.tipo === 'pasar');

  /** La mano ordenada por palo y, dentro de cada palo, por su sitio en la fila. */
  const mano = $derived(
    [...(vista.miMano ?? [])].sort((a, b) => {
      const pa = PALOS_FRANCESES.indexOf(a.split('-')[0] as PaloFrances);
      const pb = PALOS_FRANCESES.indexOf(b.split('-')[0] as PaloFrances);
      return pa - pb || rangoBarbu(a) - rangoBarbu(b);
    }),
  );

  // ── Filas: del 2 al As ─────────────────────────────────────────────────────

  const RANGOS = Array.from({ length: 13 }, (_, i) => i + 2);
  const idDe = (palo: PaloFrances, r: number) => `${palo}-${r === 14 ? 1 : r}` as IdCarta;

  function enMesa(palo: PaloFrances, r: number): boolean {
    const f = vista.filas[palo];
    return f !== null && r >= f.bajo && r <= f.alto;
  }

  function hueco(palo: PaloFrances, r: number): boolean {
    const f = vista.filas[palo];
    if (f === null) return r === JOTA;
    return r === f.bajo - 1 || r === f.alto + 1;
  }

  /** Puesto en que acabó un jugador (1.º, 2.º…), o `null`. */
  const puesto = (asiento: Asiento) => {
    const i = vista.acabados.indexOf(asiento);
    return i < 0 ? null : i + 1;
  };

  // ── Interacción ────────────────────────────────────────────────────────────

  const interaccion = new Interaccion({
    destinos: (carta) => (jugable(carta as IdCarta) ? ['mesa'] : []),
    destinoObvio: (carta) => (jugable(carta as IdCarta) ? 'mesa' : null),
    mover(carta, destino) {
      if (destino === 'mesa') sesion.jugar({ tipo: 'jugar', carta: carta as IdCarta });
    },
    elementos: (_carta, nodo) => [nodo],
  });

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (sesion.bloqueada) return '';
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    return soloPasar ? T.barbu.sinJugada : T.barbu.tuTurnoDomino;
  });

  // ── Animación ──────────────────────────────────────────────────────────────

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
</script>

<div class="domino" bind:this={raiz} style:--en-mano={Math.max(1, mano.length)}>
  <p class="contrato" data-testid="contrato-barbu">{T.barbu.contrato('domino', null)}</p>
  <div class="rivales">
    {#each rivales as asiento (asiento)}
      <div class="rival" class:activo={activo(asiento)} data-testid="asiento-{asiento}" data-zona="mano-{asiento}">
        <span class="dorso"><Carta /></span>
        <span class="datos">
          <b>{nombre(asiento)}</b>
          <small data-testid="cartas-{asiento}">
            {puesto(asiento) === null ? T.barbu.cartas(vista.cartasEnMano[asiento] ?? 0) : T.barbu.acabo(puesto(asiento)!)}
          </small>
          <small>{T.barbu.total(vista.totales[asiento] ?? 0)}</small>
        </span>
      </div>
    {/each}
  </div>

  <div
    class="mesa"
    class:legal={interaccion.resaltados.has('mesa')}
    data-destino="mesa"
    data-testid="mesa"
    aria-label={T.barbu.mesaDomino}
    role="button"
    tabindex="-1"
    onclick={() => interaccion.tocarDestino('mesa')}
    onkeydown={() => {}}
  >
    {#each PALOS_FRANCESES as palo (palo)}
      <div class="fila" data-testid="fila-{palo}">
        {#each RANGOS as r (r)}
          {@const id = idDe(palo, r)}
          <div class="hueco" class:abierto={hueco(palo, r)}>
            {#if enMesa(palo, r)}
              <div class="en-mesa" data-carta={id}><Carta {id} /></div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>

  <div class="propio" class:activo={activo(yo)}>
    <div class="estado">
      <span class="nombre">
        {T.brisca.tu}
        <small>{T.barbu.total(vista.totales[yo] ?? 0)}</small>
      </span>
      <span class="turno" role="status" data-testid="turno">
        {puesto(yo) === null ? turno : T.barbu.acabo(puesto(yo)!)}
      </span>
      {#if soloPasar && activo(yo) && !sesion.bloqueada}
        <button
          class="principal"
          data-testid="paso"
          onclick={() => {
            interaccion.cancelar();
            sesion.jugar({ tipo: 'pasar' });
          }}>{T.barbu.paso}</button
        >
      {/if}
    </div>
    <ManoPropia cartas={mano} {jugable} {interaccion} />
  </div>
</div>

<style>
  .domino {
    --ancho-hueco: min(calc((100vw - 16px - 12 * 2px - 12px) / 13), 52px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px - var(--alto-asistente, 0px));
    margin: 0 auto;
    padding: 0 8px 12px;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .contrato {
    margin: 0;
    font-weight: 700;
    color: var(--acento);
  }

  .rivales {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .rival {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px 4px 4px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.2);
  }

  .rival.activo {
    background: var(--acento);
    color: #2b2005;
  }

  .rival .dorso {
    width: 26px;
    aspect-ratio: 100 / 140;
  }

  .datos {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }

  .datos small {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .mesa {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    border-radius: 14px;
    background: rgb(0 0 0 / 0.12);
  }

  .mesa.legal {
    outline: 3px solid var(--resalte);
    box-shadow: 0 0 18px rgb(255 224 102 / 0.45);
  }

  .fila {
    display: flex;
    gap: 2px;
  }

  .hueco {
    position: relative;
    width: var(--ancho-hueco);
    aspect-ratio: 100 / 140;
    border-radius: 7%;
    outline: 1px solid rgb(255 255 255 / 0.06);
    outline-offset: -1px;
  }

  .hueco.abierto {
    outline: 2px dashed rgb(255 255 255 / 0.35);
    outline-offset: -2px;
  }

  .en-mesa {
    position: absolute;
    inset: 0;
  }

  .propio {
    /* La mano entera cabe: cada carta deja a la vista al menos un 30 % de su ancho. */
    --ancho-carta: min(19vw, 13dvh, 96px, calc((100vw - 24px) / (0.3 * (var(--en-mano) - 1) + 1)));
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
    margin-top: auto;
  }

  .propio :global(.ranura) {
    margin-right: 0;
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
