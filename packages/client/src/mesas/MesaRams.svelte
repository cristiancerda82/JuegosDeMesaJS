<script lang="ts">
  import {
    fuerza,
    VALORES_RAMS,
    type AccionRams,
    type Asiento,
    type ConfigRams,
    type EstadoRams,
    type IdCarta,
    type VistaRams,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenRams from './ResumenRams.svelte';

  interface Props {
    sesion: SesionMesa<ConfigRams, EstadoRams, AccionRams, VistaRams>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const PALOS = ['picas', 'corazones', 'treboles', 'diamantes'];

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const n = $derived(vista.config.jugadores);

  const accion = (tipo: AccionRams['tipo']) => legales.find((a) => a.tipo === tipo);
  const jugable = (carta: IdCarta) =>
    legales.some((a) => (a.tipo === 'jugar' || a.tipo === 'descartar') && a.carta === carta);
  const jugar = (carta: IdCarta) =>
    sesion.jugar(
      vista.fase === 'descartar' ? { tipo: 'descartar', carta } : { tipo: 'jugar', carta },
    );
  const nombre = (asiento: Asiento) => nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN);

  const detalle = (asiento: Asiento) => {
    if (!vista.enJuego[asiento]) return T.rams.sinFichas;
    const marcas = [T.rams.fichas(vista.fichas[asiento] ?? 0)];
    if (asiento === vista.repartidor) marcas.push(T.rams.reparte);
    const d = vista.dichos[asiento];
    if (d === 'paso') marcas.push(T.rams.pasa);
    else if (d === 'nina') marcas.push(T.rams.nina);
    else if (d === 'rams' && vista.fase === 'jugar') marcas.push(T.rams.bazas(vista.bazas[asiento] ?? 0));
    return marcas.join(' · ');
  };

  /** El pinte se ve en la mano del que reparte desde que se lo queda hasta que lo juega. */
  const pinteJugado = $derived(
    vista.mesa.some((j) => j.carta === vista.pinte) ||
      vista.bazasJugadas.some((b) => b.cartas.some((j) => j.carta === vista.pinte)),
  );
  const cartaVisible = (asiento: Asiento) =>
    asiento === vista.repartidor && vista.pinteCogido && !pinteJugado ? vista.pinte : null;

  /** La mano por palos alternando colores y, dentro de cada palo, de la más baja al As. */
  const manoOrdenada = $derived(
    [...(vista.miMano ?? [])].sort(
      (a, b) =>
        PALOS.indexOf(a.split('-')[0]!) - PALOS.indexOf(b.split('-')[0]!) ||
        fuerza(a, VALORES_RAMS) - fuerza(b, VALORES_RAMS),
    ),
  );

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    rotuloMuestra: T.rams.pinte,
    resultadosManos: [],
  });

  /** Mientras se habla, el último que ha hablado; al descartar, lo que hay que hacer. */
  const aviso = $derived.by(() => {
    if (vista.fase === 'descartar' && vista.turno === yo) return T.rams.descarta;
    if (vista.fase !== 'hablar' || vista.mesa.length > 0) return null;
    const hablado = [...vista.dichos.entries()]
      .filter(([a, d]) => d !== null && a !== vista.repartidor)
      .map(([a]) => a);
    if (hablado.length === 0) return vista.turno === yo ? T.rams.habla : null;
    // El último en hablar es el más cercano antes del que habla ahora.
    const turno = vista.turno ?? 0;
    const ultimo = [...hablado].sort((a, b) => ((turno - a + n) % n) - ((turno - b + n) % n))[0]!;
    return T.rams.dice(nombre(ultimo), vista.dichos[ultimo]!);
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

<MesaBazas
  vista={vistaMesa}
  {sesion}
  {jugable}
  {jugar}
  {cartaVisible}
  {nombre}
  {detalle}
  {aviso}
>
  {#snippet info()}
    <span data-testid="triunfo-rams"
      >{T.rams.triunfo}: <b class="triunfo">{T.cartas.palos[vista.triunfo] ?? vista.triunfo}</b></span
    >
    <span class="suave" data-testid="mano-rams">{T.rams.manoN(vista.manoNumero)}</span>
    <span class="suave" data-testid="fichas-propias">{T.rams.tusFichas(vista.fichas[yo] ?? 0)}</span>
    <span class="suave" data-testid="canasta">{T.rams.canasta(vista.canasta)}</span>
  {/snippet}
  {#snippet acciones(cancelar)}
    {#each [['rams', T.rams.rams], ['paso', T.rams.paso], ['nina', T.rams.cogerNina]] as const as [tipo, texto] (tipo)}
      {@const a = accion(tipo)}
      {#if a}
        <button
          data-accion={a.tipo}
          data-jugada={JSON.stringify(a)}
          class:principal={tipo === 'rams'}
          data-testid="hablar-{tipo}"
          onclick={() => {
            cancelar();
            sesion.jugar(a);
          }}>{texto}</button
        >
      {/if}
    {/each}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.burroBazas.finMano(resumen + 1)}</h2>
      <ResumenRams resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.burroBazas.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .triunfo {
    color: var(--acento);
    text-transform: capitalize;
  }

  .suave {
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
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    padding: 14px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.2rem;
    margin-bottom: 8px;
  }

  .dialogo > button {
    margin-top: 14px;
    width: 100%;
  }
</style>
