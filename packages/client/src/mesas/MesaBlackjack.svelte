<script lang="ts">
  import {
    valorBlackjack,
    type AccionBlackjack,
    type Asiento,
    type ConfigBlackjack,
    type EstadoBlackjack,
    type VistaBlackjack,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado } from './bazas/asientos';
  import ResumenBlackjack from './ResumenBlackjack.svelte';

  interface Props {
    sesion: SesionMesa<ConfigBlackjack, EstadoBlackjack, AccionBlackjack, VistaBlackjack>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver las cartas de la banca antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 700 * FACTOR_PAUSAS;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);
  /** Los demás arriba y el jugador abajo, el más cerca de sus botones. */
  const orden = $derived([
    ...Array.from({ length: n }, (_, a) => a).filter((a) => a !== yo),
    yo,
  ]);

  const apuestas = $derived(legales.flatMap((a) => (a.tipo === 'apostar' ? [a.fichas] : [])));
  const puede = (tipo: AccionBlackjack['tipo']) => legales.some((a) => a.tipo === tipo);
  /** Entre el fin de una mano y su resumen no se apuesta: primero se ven las cartas. */
  let cerrando = $state(false);
  const miTurno = $derived(
    vista.turno === yo && sesion.fin === null && !sesion.bloqueada && !cerrando,
  );

  const turnoTexto = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (vista.turno !== yo) return T.blackjack.leToca(nombre(vista.turno));
    return vista.fase === 'apuesta' ? T.blackjack.tuApuesta : T.blackjack.tuTurno;
  });

  const valor = (cartas: Parameters<typeof valorBlackjack>[0]) => {
    const v = valorBlackjack(cartas);
    return v.blanda ? T.blackjack.blanda(v.total) : String(v.total);
  };

  // ── Resumen al terminar cada mano ──────────────────────────────────────────

  let resumen: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  let espera: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      sesion.pausar();
      cerrando = true;
      espera = setTimeout(() => (resumen = total - 1), ESPERA_RESUMEN_MS);
    }
    manosVistas = total;
  });
  $effect(() => () => {
    if (espera !== null) clearTimeout(espera);
  });

  function siguienteMano() {
    resumen = null;
    cerrando = false;
    sesion.reanudar();
  }
</script>

<div class="blackjack">
  <p class="manos" data-testid="numero-mano">
    {T.blackjack.mano(
      Math.min(vista.resultadosManos.length + 1, vista.config.manos),
      vista.config.manos,
    )}
  </p>

  <section class="banca" data-testid="banca" aria-label={T.blackjack.banca}>
    <h2>{T.blackjack.banca}</h2>
    <div class="cartas">
      {#each vista.banca as carta, i (i)}
        <span class="naipe" data-carta={carta ?? undefined}>
          {#if carta === null}<Carta />{:else}<Carta id={carta} />{/if}
        </span>
      {/each}
    </div>
    {#if vista.valorBanca !== null}
      <p class="valor" data-testid="valor-banca">{vista.valorBanca}</p>
    {/if}
  </section>

  <div class="jugadores">
    {#each orden as a (a)}
      <section
        class="jugador"
        class:propio={a === yo}
        class:activo={vista.turno === a && sesion.fin === null}
        class:fuera={!vista.activos[a]}
        data-testid="puesto-{a}"
      >
        <header>
          <b>{nombre(a)}</b>
          <span data-testid="fichas-{a}">{T.blackjack.fichas(vista.fichas[a] ?? 0)}</span>
          {#if vista.apuestas[a] !== null && vista.apuestas[a] !== undefined}
            <span class="apuesta" data-testid="apuesta-{a}">{T.blackjack.apuesta(vista.apuestas[a]!)}</span>
          {/if}
        </header>
        <div class="manos-jugador">
          {#each vista.manos[a] ?? [] as mano, m (m)}
            <div
              class="mano"
              class:jugando={vista.fase === 'juego' && vista.turno === a && vista.manoActiva === m}
              data-testid="mano-{a}-{m}"
            >
              <div class="cartas">
                {#each mano.cartas as carta (carta)}
                  <span class="naipe" data-carta={carta}><Carta id={carta} /></span>
                {/each}
              </div>
              <span class="valor" data-testid="valor-{a}-{m}">{valor(mano.cartas)}</span>
              {#if mano.doblada}<span class="marca">{T.blackjack.doblada}</span>{/if}
            </div>
          {/each}
        </div>
      </section>
    {/each}
  </div>

  <div class="abajo">
    <p class="turno" role="status" data-testid="turno">{turnoTexto}</p>
    {#if miTurno && vista.fase === 'apuesta'}
      <div class="botones apuestas">
        {#each apuestas as f (f)}
          <button data-testid="apostar-{f}" onclick={() => sesion.jugar({ tipo: 'apostar', fichas: f })}>
            {f}
          </button>
        {/each}
      </div>
    {:else if miTurno}
      <div class="botones">
        <button class="principal" data-testid="pedir" onclick={() => sesion.jugar({ tipo: 'pedir' })}>
          {T.blackjack.pedir}
        </button>
        <button data-testid="plantarse" onclick={() => sesion.jugar({ tipo: 'plantarse' })}>
          {T.blackjack.plantarse}
        </button>
        {#if puede('doblar')}
          <button data-testid="doblar" onclick={() => sesion.jugar({ tipo: 'doblar' })}>
            {T.blackjack.doblar}
          </button>
        {/if}
        {#if puede('separar')}
          <button data-testid="separar" onclick={() => sesion.jugar({ tipo: 'separar' })}>
            {T.blackjack.separar}
          </button>
        {/if}
      </div>
    {/if}
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
      <h2 id="fin-mano">{T.blackjack.finMano(resumen + 1)}</h2>
      <ResumenBlackjack resultado={vista.resultadosManos[resumen]!} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.blackjack.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .blackjack {
    --ancho-carta: min(13vw, 7dvh, 56px);
    --ancho-mini: min(10vw, 5.5dvh, 44px);
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(100%, 720px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
  }

  .manos {
    margin: 0;
    text-align: center;
    font-size: 0.85rem;
    color: var(--texto-suave);
  }

  .banca {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .banca h2 {
    margin: 0;
    font-size: 1rem;
  }

  .cartas {
    display: flex;
    gap: 4px;
  }

  .naipe {
    display: block;
    width: var(--ancho-carta);
    aspect-ratio: 100 / 140;
  }

  .jugador .naipe {
    width: var(--ancho-mini);
  }

  .jugador.propio .naipe {
    width: var(--ancho-carta);
  }

  /* Las cartas de una mano se solapan para que quepan muchas. */
  .jugador .cartas .naipe + .naipe {
    margin-left: calc(var(--ancho-mini) * -0.45);
  }

  .jugador.propio .cartas .naipe + .naipe {
    margin-left: calc(var(--ancho-carta) * -0.4);
  }

  .valor {
    margin: 0;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .jugadores {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    justify-content: flex-end;
  }

  .jugador {
    padding: 6px 8px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.18);
  }

  .jugador.activo {
    outline: 2px solid var(--acento);
  }

  .jugador.fuera {
    opacity: 0.5;
  }

  header {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 10px;
    align-items: baseline;
    margin-bottom: 4px;
    font-size: 0.9rem;
  }

  .apuesta {
    color: var(--acento);
  }

  .manos-jugador {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .mano {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 4px;
    border-radius: 8px;
  }

  .mano.jugando {
    background: rgb(255 255 255 / 0.12);
  }

  .marca {
    font-size: 0.8rem;
    color: var(--texto-suave);
  }

  .abajo {
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
    justify-content: center;
    gap: 8px;
  }

  .apuestas button {
    min-width: 2.8em;
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
</style>
