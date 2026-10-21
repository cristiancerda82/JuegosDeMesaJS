<script lang="ts">
  import {
    esOcho,
    numeroOchoLoco,
    OBJETIVO_OCHO_LOCO,
    PALOS_FRANCESES,
    paloOchoLoco,
    type AccionOchoLoco,
    type Asiento,
    type ConfigOchoLoco,
    type EstadoOchoLoco,
    type IdCarta,
    type PaloFrances,
    type UltimaOchoLoco,
    type VistaOchoLoco,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AsientoRival from './bazas/AsientoRival.svelte';
  import { lado, nombreNumerado } from './bazas/asientos';
  import ResumenOchoLoco from './ResumenOchoLoco.svelte';

  interface Props {
    sesion: SesionMesa<ConfigOchoLoco, EstadoOchoLoco, AccionOchoLoco, VistaOchoLoco>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última carta de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 900 * FACTOR_PAUSAS;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  const rivales = $derived(Array.from({ length: n }, (_, a) => a).filter((a) => a !== yo));
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.ochoLoco.rivalN);
  const palo = (p: PaloFrances) => T.cartas.palos[p] ?? p;
  const SIMBOLOS: Record<PaloFrances, string> = {
    picas: '♠',
    corazones: '♥',
    diamantes: '♦',
    treboles: '♣',
  };

  const puede = (tipo: AccionOchoLoco['tipo']) => legales.some((a) => a.tipo === tipo);
  const jugable = (c: IdCarta) => legales.some((a) => a.tipo === 'jugar' && a.carta === c);
  const miTurno = $derived(vista.turno === yo && sesion.fin === null);

  /** La mano ordenada por palo y número. */
  const mano = $derived(
    [...(vista.miMano ?? [])].sort(
      (a, b) =>
        PALOS_FRANCESES.indexOf(paloOchoLoco(a)) - PALOS_FRANCESES.indexOf(paloOchoLoco(b)) ||
        numeroOchoLoco(a) - numeroOchoLoco(b),
    ),
  );

  const arriba = $derived(vista.descarte.at(-1) ?? null);
  /** El palo que toca lo eligió un 8 (no es el de la carta de arriba). */
  const elegido = $derived(arriba !== null && esOcho(arriba));

  /** El 8 que el jugador ha tocado y para el que tiene que elegir palo. */
  let ocho: IdCarta | null = $state(null);
  $effect(() => {
    if (ocho !== null && (!miTurno || !jugable(ocho))) ocho = null;
  });

  function tocar(c: IdCarta) {
    if (sesion.bloqueada || !jugable(c)) return;
    if (esOcho(c)) {
      ocho = ocho === c ? null : c;
      return;
    }
    sesion.jugar({ tipo: 'jugar', carta: c });
  }

  function elegirPalo(p: PaloFrances) {
    if (ocho === null) return;
    const carta = ocho;
    ocho = null;
    sesion.jugar({ tipo: 'jugar', carta, palo: p });
  }

  function textoUltima(u: UltimaOchoLoco | null): string {
    if (u === null) return '';
    if (u.tipo === 'robar') return T.ochoLoco.robo;
    if (u.tipo === 'pasar') return T.ochoLoco.paso;
    return T.ochoLoco.jugo(nombreCarta(u.carta), u.palo === null ? null : palo(u.palo));
  }

  const turnoTexto = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (vista.turno !== yo) return T.ochoLoco.leToca(nombre(vista.turno));
    if (vista.robe) return puede('jugar') ? T.ochoLoco.tuRobada : T.ochoLoco.robadaNoCasa;
    if (puede('jugar')) return T.ochoLoco.tuTurno;
    return puede('robar') ? T.ochoLoco.tuTurnoRobar : T.ochoLoco.nadaQueRobar;
  });

  // ── Resumen al terminar cada mano ──────────────────────────────────────────

  let resumen: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  let espera: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      sesion.pausar();
      espera = setTimeout(() => (resumen = total - 1), ESPERA_RESUMEN_MS);
    }
    manosVistas = total;
  });
  $effect(() => () => {
    if (espera !== null) clearTimeout(espera);
  });

  function siguienteMano() {
    resumen = null;
    sesion.reanudar();
  }
</script>

<div class="ocho-loco" class:muchos={n >= 5}>
  {#each rivales as asiento (asiento)}
    <AsientoRival
      {asiento}
      lado={lado(asiento, n, yo)}
      nombre={nombre(asiento)}
      detalle={[T.ochoLoco.puntos(vista.totales[asiento] ?? 0), textoUltima(vista.ultimas[asiento] ?? null)]
        .filter(Boolean)
        .join(' · ')}
      cartas={Math.min(vista.cartasEnMano[asiento] ?? 0, 10)}
      activo={vista.turno === asiento && sesion.fin === null}
    />
  {/each}

  <div class="centro">
    <div class="pilas">
      <div class="pila" data-testid="mazo" aria-label={T.ochoLoco.mazo(vista.mazo)}>
        {#if vista.mazo > 0}<Carta />{/if}
        <span class="cuenta">{vista.mazo}</span>
      </div>
      <div class="pila" data-testid="descarte" data-carta={arriba}>
        {#if arriba !== null}<Carta id={arriba} />{/if}
      </div>
    </div>
    <p class="toca" class:elegido data-testid="palo" data-palo={vista.palo}>
      {T.ochoLoco.toca(palo(vista.palo))}
    </p>
    <p class="marcador" data-testid="puntos">
      {T.ochoLoco.puntos(vista.totales[yo] ?? 0)} / {OBJETIVO_OCHO_LOCO}
    </p>
  </div>

  <div class="abajo">
    <p class="turno" role="status" data-testid="turno">{turnoTexto}</p>
    {#if miTurno && ocho !== null}
      <div class="botones" role="group" aria-label={T.ochoLoco.eligePalo} data-testid="elegir-palo">
        <span class="pregunta">{T.ochoLoco.eligePalo}</span>
        {#each PALOS_FRANCESES as p (p)}
          <button data-testid="palo-{p}" onclick={() => elegirPalo(p)}>
            <span class="simbolo {p}" aria-hidden="true">{SIMBOLOS[p]}</span>
            {palo(p)}
          </button>
        {/each}
      </div>
    {:else if miTurno && (puede('robar') || puede('pasar'))}
      <div class="botones">
        {#if puede('robar')}
          <button class="principal" data-testid="robar" onclick={() => sesion.jugar({ tipo: 'robar' })}>
            {T.ochoLoco.robar}
          </button>
        {/if}
        {#if puede('pasar')}
          <button data-testid="pasar" onclick={() => sesion.jugar({ tipo: 'pasar' })}>
            {T.ochoLoco.pasar}
          </button>
        {/if}
      </div>
    {/if}
    <div class="mano" data-testid="mano">
      {#each mano as c (c)}
        <button
          class="carta-mano"
          class:jugable={miTurno && jugable(c)}
          class:robada={vista.robada === c}
          class:seleccionada={ocho === c}
          data-testid="mano-{c}"
          data-carta={c}
          disabled={!miTurno || !jugable(c)}
          onclick={() => tocar(c)}
        >
          <Carta id={c} />
        </button>
      {/each}
    </div>
  </div>
</div>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div
      class="dialogo"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fin-mano"
      data-testid="panel-mano"
    >
      <h2 id="fin-mano">{T.ochoLoco.finMano(resumen + 1)}</h2>
      <ResumenOchoLoco resultado={vista.resultadosManos[resumen]!} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.ochoLoco.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
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
    width: min(100%, 460px);
    max-height: calc(100dvh - 92px);
    overflow-y: auto;
    padding: 14px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.1rem;
    margin-bottom: 4px;
  }

  .ocho-loco {
    --ancho-carta: min(15vw, 9dvh, 70px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-rival: min(8vw, 5dvh, 40px);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      'arriba arriba arriba'
      'izquierda centro derecha'
      'abajo abajo abajo';
    gap: 6px;
    width: min(100%, 900px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    user-select: none;
    -webkit-user-select: none;
  }

  .ocho-loco.muchos {
    --ancho-rival: min(6vw, 4dvh, 32px);
  }

  .ocho-loco :global(.asiento.arriba-izquierda),
  .ocho-loco :global(.asiento.arriba-derecha) {
    grid-area: arriba;
  }

  .ocho-loco :global(.asiento.arriba-izquierda) {
    justify-self: start;
  }

  .ocho-loco :global(.asiento.arriba-derecha) {
    justify-self: end;
  }

  .centro {
    grid-area: centro;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 0;
  }

  .pilas {
    display: flex;
    gap: 14px;
  }

  .pila {
    position: relative;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    border-radius: 7%;
    outline: 2px dashed rgb(255 255 255 / 0.2);
    outline-offset: -2px;
  }

  .pila :global(.carta) {
    width: 100%;
    height: 100%;
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

  .toca,
  .marcador {
    margin: 0;
    text-align: center;
  }

  .toca {
    font-weight: 600;
  }

  .toca.elegido {
    padding: 2px 10px;
    border-radius: 10px;
    color: var(--fondo, #10291a);
    background: var(--acento);
  }

  .marcador {
    font-size: 0.85rem;
    color: var(--texto-suave);
  }

  .abajo {
    grid-area: abajo;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .turno {
    margin: 0;
    min-height: 1.3em;
    text-align: center;
  }

  .botones {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .simbolo.corazones,
  .simbolo.diamantes {
    color: #ff8a8a;
  }

  .pregunta {
    width: 100%;
    text-align: center;
    font-size: 0.9rem;
  }

  .mano {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 6px;
    width: 100%;
    padding: 10px calc(var(--ancho-carta) * 0.55) 0 0;
  }

  .carta-mano {
    position: relative;
    width: calc(var(--ancho-carta) * 0.45);
    height: var(--alto-carta);
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    transition: translate 120ms;
  }

  .carta-mano:disabled {
    opacity: 1;
    cursor: default;
  }

  .carta-mano :global(.carta) {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--ancho-carta);
    height: var(--alto-carta);
  }

  .carta-mano.jugable {
    translate: 0 -8px;
  }

  .carta-mano.jugable :global(.carta) {
    outline: 2px solid var(--resalte);
    border-radius: 7%;
  }

  .carta-mano.robada :global(.carta),
  .carta-mano.seleccionada :global(.carta) {
    outline: 3px solid var(--acento);
    border-radius: 7%;
  }
</style>
