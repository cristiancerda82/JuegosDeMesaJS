<script lang="ts">
  import {
    parejaPicas,
    rangoPicas,
    type AccionPicas,
    type Asiento,
    type ConfigPicas,
    type EstadoPicas,
    type IdCarta,
    type VistaPicas,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenPicas from './ResumenPicas.svelte';

  interface Props {
    sesion: SesionMesa<ConfigPicas, EstadoPicas, AccionPicas, VistaPicas>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 4;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const mio = $derived(parejaPicas(sesion.asiento));
  const lados: [string, string] = [T.brisca.nosotros, T.brisca.ellos];

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'jugar' && a.carta === carta);
  const nombre = (asiento: Asiento) =>
    nombreAsiento(asiento, JUGADORES, sesion.asiento, sesion.red);
  const detalle = (asiento: Asiento) =>
    T.picas.detalle(vista.apuestas[asiento] ?? null, vista.bazas[asiento] ?? 0);

  /** Bazas de la pareja que cuentan para el contrato (sin las del que dijo Nil). */
  const bazasContrato = (pareja: 0 | 1) =>
    [0, 1, 2, 3]
      .filter((a) => parejaPicas(a) === pareja && vista.apuestas[a] !== 0)
      .reduce((s, a) => s + (vista.bazas[a] ?? 0), 0);

  /** La mano ordenada por palo (picas primero) y por valor. */
  const ORDEN_PALOS = ['picas', 'corazones', 'treboles', 'diamantes'];
  const manoOrdenada = $derived(
    [...(vista.miMano ?? [])].sort(
      (a, b) =>
        ORDEN_PALOS.indexOf(a.split('-')[0]!) - ORDEN_PALOS.indexOf(b.split('-')[0]!) ||
        rangoPicas(b) - rangoPicas(a),
    ),
  );

  /** La última baza de la mano anterior se sigue viendo hasta la primera apuesta. */
  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    mazo: 0,
    muestra: null,
    ultimaBaza:
      vista.fase === 'apuesta' && vista.apuestas.some((b) => b !== null) ? null : vista.ultimaBaza,
    resultadosManos: [],
  });

  // ── Apuesta ────────────────────────────────────────────────────────────────

  const puedoApostar = $derived(legales.some((a) => a.tipo === 'apostar'));

  // ── Resumen al terminar cada mano ──────────────────────────────────────────

  let resumen: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  let espera: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      sesion.pausar();
      // Primero se ve la última baza en la mesa y después el resumen.
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

<MesaBazas
  vista={vistaMesa}
  {sesion}
  {jugable}
  jugar={(carta) => sesion.jugar({ tipo: 'jugar', carta })}
  {nombre}
  {detalle}
>
  {#snippet info()}
    {#each [mio, 1 - mio] as p, i (p)}
      <span data-testid="contrato-{i}">
        {T.picas.contrato(lados[i]!, vista.contratos[p as 0 | 1], bazasContrato(p as 0 | 1))}
      </span>
    {/each}
    {#each [mio, 1 - mio] as p, i (p)}
      <span class="puntos" data-testid="puntos-{i}">
        {T.picas.puntos(lados[i]!, vista.puntos[p as 0 | 1], vista.sacos[p as 0 | 1])}
      </span>
    {/each}
    {#if vista.rotas}
      <span class="rotas" data-testid="rotas">♠ {T.picas.rotas}</span>
    {/if}
  {/snippet}
</MesaBazas>

{#if puedoApostar && resumen === null && sesion.fin === null}
  <div class="velo apuesta">
    <div
      class="dialogo"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-apuesta"
      data-testid="panel-apuesta"
    >
      <h2 id="titulo-apuesta">{T.picas.apostar}</h2>
      <div class="mano-apuesta">
        {#each manoOrdenada as id (id)}
          <span class="carta-apuesta"><Carta {id} /></span>
        {/each}
      </div>
      <p class="nota">
        {T.picas.yaApostaron}:
        {#each [0, 1, 2, 3].filter((a) => a !== sesion.asiento) as a, i (a)}
          {i > 0 ? ' · ' : ''}{nombre(a)}
          {vista.apuestas[a] === null ? T.picas.sinApostar : T.picas.apuesta(vista.apuestas[a]!)}
        {/each}
      </p>
      <div class="botones-apuesta">
        {#each Array.from({ length: 14 }, (_, n) => n) as n (n)}
          <button
            class:nil={n === 0}
            data-testid="apostar-{n}"
            onclick={() => sesion.jugar({ tipo: 'apostar', bazas: n })}
          >
            {T.picas.apuesta(n)}
          </button>
        {/each}
      </div>
      <p class="nota">{T.picas.apostarNota}</p>
    </div>
  </div>
{/if}

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div
      class="dialogo"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fin-mano"
      data-testid="panel-mano"
    >
      <h2 id="fin-mano">{T.picas.finMano(resumen + 1)}</h2>
      <ResumenPicas resultado={vista.resultadosManos[resumen]!} {lados} bando={mio} {nombre} />
      <p class="nota">{T.picas.finPartida}</p>
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.picas.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .puntos {
    color: var(--texto-suave);
  }

  .rotas {
    font-weight: 700;
    color: var(--acento);
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

  /* La apuesta deja libre la cabecera: el menú y la guía siguen a mano. */
  .velo.apuesta {
    top: 60px;
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

  .nota {
    margin: 0 0 8px;
    font-size: 0.9rem;
    color: var(--texto-suave);
  }

  /* Las 13 cartas en una fila que se solapa: se encogen en pantallas estrechas. */
  .mano-apuesta {
    display: flex;
    justify-content: center;
    margin: 6px 0 10px;
    padding-right: 34px;
  }

  .carta-apuesta {
    display: block;
    width: min(5.4vw, 22px);
    height: calc(min(13vw, 54px) * 1.4);
    position: relative;
  }

  .carta-apuesta :global(.carta) {
    position: absolute;
    top: 0;
    left: 0;
    width: min(13vw, 54px);
    height: calc(min(13vw, 54px) * 1.4);
  }

  .botones-apuesta {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    margin-bottom: 8px;
  }

  .botones-apuesta button {
    min-width: 0;
    padding: 8px 0;
  }

  .botones-apuesta .nil {
    grid-column: span 2;
  }
</style>
