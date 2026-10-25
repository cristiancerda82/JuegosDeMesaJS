<script lang="ts">
  import {
    PALOS_FRANCESES,
    SIETE,
    valorSevens,
    type AccionSevens,
    type Asiento,
    type ConfigSevens,
    type EstadoSevens,
    type IdCarta,
    type PaloFrances,
    type VistaSevens,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import { Interaccion } from '../interaccion/interaccion.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { nombreNumerado } from './bazas/asientos';
  import { T } from '../textos';
  import ManoPropia from './bazas/ManoPropia.svelte';
  import ResumenSevens from './ResumenSevens.svelte';

  interface Props {
    sesion: SesionMesa<ConfigSevens, EstadoSevens, AccionSevens, VistaSevens>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  // Los rivales en el orden de juego, empezando por el siguiente al jugador.
  const rivales = $derived(Array.from({ length: n - 1 }, (_, i) => (yo + i + 1) % n));

  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);
  const activo = (asiento: Asiento) => vista.turno === asiento && sesion.fin === null;

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'jugar' && a.carta === carta);
  const soloPasar = $derived(legales.length === 1 && legales[0]!.tipo === 'pasar');

  /** La mano ordenada por palo y, dentro de cada palo, por su sitio en la escalera. */
  const mano = $derived(
    [...(vista.miMano ?? [])].sort((a, b) => {
      const pa = PALOS_FRANCESES.indexOf(a.split('-')[0] as PaloFrances);
      const pb = PALOS_FRANCESES.indexOf(b.split('-')[0] as PaloFrances);
      return pa - pb || valorSevens(a) - valorSevens(b);
    }),
  );

  // ── Mesa: lo que hay de cada palo y los huecos donde se puede jugar ────────

  const VALORES = Array.from({ length: 13 }, (_, i) => i + 1);

  function enMesa(palo: PaloFrances, v: number): boolean {
    const e = vista.mesa[palo];
    return e !== null && v >= e.bajo && v <= e.alto;
  }

  function hueco(palo: PaloFrances, v: number): boolean {
    const e = vista.mesa[palo];
    // Hasta que sale el 7 de diamantes, es el único hueco abierto.
    if (e === null) return v === SIETE && (vista.mesa.diamantes !== null || palo === 'diamantes');
    return v === e.bajo - 1 || v === e.alto + 1;
  }

  // ── Interacción ────────────────────────────────────────────────────────────

  const interaccion = new Interaccion({
    destinos: (carta) => (jugable(carta as IdCarta) ? ['mesa'] : []),
    destinoObvio: (carta) => (jugable(carta as IdCarta) ? 'mesa' : null),
    mover(carta, destino) {
      if (destino === 'mesa') sesion.jugar({ tipo: 'jugar', carta: carta as IdCarta });
    },
    elementos: (_carta, nodo) => [nodo],
  });

  // ── Turno y avisos ─────────────────────────────────────────────────────────

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (sesion.bloqueada) return '';
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    if (soloPasar) return T.sevens.sinJugada;
    return vista.mesa.diamantes === null ? T.sevens.salida : T.sevens.tuTurno;
  });

  const aviso = $derived.by(() => {
    const a = vista.ultimaAccion;
    if (a === null || sesion.fin !== null) return null;
    const quien = nombre(a.asiento);
    if (a.tipo === 'pasar') return T.sevens.pasa(quien);
    return T.sevens.juega(quien, nombreCarta(a.carta).toLowerCase());
  });

  // ── Resultado al terminar cada mano ────────────────────────────────────────

  let resultado: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      resultado = total - 1;
      sesion.pausar();
    }
    manosVistas = total;
  });

  function siguienteMano() {
    resultado = null;
    sesion.reanudar();
  }

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

<div class="sevens" bind:this={raiz} style:--en-mano={Math.max(1, mano.length)}>
  <div class="rivales">
    {#each rivales as asiento (asiento)}
      <div class="rival" class:activo={activo(asiento)} data-testid="asiento-{asiento}" data-zona="mano-{asiento}">
        <span class="dorso"><Carta /></span>
        <span class="datos">
          <b>{nombre(asiento)}</b>
          <small data-testid="cartas-{asiento}">{T.sevens.cartas(vista.cartasEnMano[asiento] ?? 0)}</small>
          <small>{T.sevens.puntos(vista.totales[asiento] ?? 0)}</small>
        </span>
      </div>
    {/each}
  </div>

  <div
    class="mesa"
    class:legal={interaccion.resaltados.has('mesa')}
    data-destino="mesa"
    data-testid="mesa"
    aria-label={T.sevens.mesa}
    role="button"
    tabindex="-1"
    onclick={() => interaccion.tocarDestino('mesa')}
    onkeydown={() => {}}
  >
    {#each PALOS_FRANCESES as palo (palo)}
      <div class="fila" data-testid="fila-{palo}">
        {#each VALORES as valor (valor)}
          {@const id = `${palo}-${valor}` as IdCarta}
          <div class="hueco" class:abierto={hueco(palo, valor)}>
            {#if enMesa(palo, valor)}
              <div class="en-mesa" data-carta={id}><Carta {id} /></div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>

  {#if aviso}
    <p class="aviso" role="status" data-testid="aviso">{aviso}</p>
  {/if}

  <div class="propio" class:activo={activo(yo)}>
    <div class="estado">
      <span class="nombre">
        {T.brisca.tu}
        <small>{T.sevens.puntos(vista.totales[yo] ?? 0)}</small>
      </span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
      {#if soloPasar && activo(yo)}
        <button
          class="principal"
          data-testid="paso"
          onclick={() => {
            interaccion.cancelar();
            sesion.jugar({ tipo: 'pasar' });
          }}>{T.sevens.paso}</button
        >
      {/if}
    </div>
    <ManoPropia cartas={mano} {jugable} {interaccion} />
  </div>
</div>

{#if resultado !== null && vista.resultadosManos[resultado]}
  {@const r = vista.resultadosManos[resultado]!}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.sevens.finMano(resultado + 1)}</h2>
      <ResumenSevens resultado={r} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.sevens.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .sevens {
    --ancho-hueco: min(calc((100vw - 16px - 12 * 2px - 12px) / 13), 52px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
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

  .aviso {
    margin: 0;
    padding: 4px 12px;
    border-radius: 14px;
    font-size: 0.9rem;
    font-weight: 600;
    background: rgb(0 0 0 / 0.3);
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
    width: min(100%, 400px);
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
    margin-bottom: 6px;
  }

  .dialogo > button {
    margin-top: 14px;
    width: 100%;
  }
</style>
