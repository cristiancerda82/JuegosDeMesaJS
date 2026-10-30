<script lang="ts">
  import {
    parejaSueca,
    rangoSueca,
    type AccionSueca,
    type Asiento,
    type ConfigSueca,
    type EstadoSueca,
    type IdCarta,
    type VistaSueca,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenSueca from './ResumenSueca.svelte';

  interface Props {
    sesion: SesionMesa<ConfigSueca, EstadoSueca, AccionSueca, VistaSueca>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 4;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const mio = $derived(parejaSueca(sesion.asiento));
  const lados: [string, string] = [T.brisca.nosotros, T.brisca.ellos];

  const jugable = (carta: IdCarta) => legales.some((a) => a.carta === carta);
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, JUGADORES, sesion.asiento, sesion.red);
  const detalle = (asiento: Asiento) =>
    `${asiento === vista.repartidor ? `${T.sueca.reparte} · ` : ''}${T.sueca.bazasDe(vista.bazas[asiento] ?? 0)}`;

  /** La mano ordenada por palo (el triunfo primero) y por valor. */
  const manoOrdenada = $derived.by(() => {
    const orden = [vista.triunfo, ...['picas', 'corazones', 'treboles', 'diamantes'].filter((p) => p !== vista.triunfo)];
    return [...(vista.miMano ?? [])].sort(
      (a, b) =>
        orden.indexOf(a.split('-')[0]!) - orden.indexOf(b.split('-')[0]!) || rangoSueca(b) - rangoSueca(a),
    );
  });

  /** La carta del triunfo se ve junto al mazo mientras está en la mano de otro. */
  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    mazo: 0,
    muestra: vista.repartidor !== sesion.asiento ? vista.cartaTriunfo : null,
    rotuloMuestra: T.sueca.cartaTriunfo,
    resultadosManos: [],
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
    <span class="triunfo" data-testid="triunfo">{T.sueca.triunfo(vista.triunfo)}</span>
    {#each [mio, 1 - mio] as p, i (p)}
      <span class="puntos" data-testid="puntos-{i}">
        {T.sueca.puntos(lados[i]!, vista.puntosMano[p as 0 | 1], vista.juegos[p as 0 | 1])}
      </span>
    {/each}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.sueca.finMano(resumen + 1)}</h2>
      <ResumenSueca resultado={vista.resultadosManos[resumen]!} {lados} bando={mio} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.sueca.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .triunfo {
    font-weight: 700;
    color: var(--acento);
  }

  .puntos {
    color: var(--texto-suave);
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

  .dialogo > button {
    margin-top: 10px;
    width: 100%;
  }
</style>
