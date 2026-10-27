<script lang="ts">
  import {
    paloOhHell,
    rangoOhHell,
    type AccionOhHell,
    type Asiento,
    type ConfigOhHell,
    type EstadoOhHell,
    type IdCarta,
    type VistaOhHell,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenOhHell from './ResumenOhHell.svelte';

  interface Props {
    sesion: SesionMesa<ConfigOhHell, EstadoOhHell, AccionOhHell, VistaOhHell>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resultado. */
  const ESPERA_RESULTADO_MS = 1100 * FACTOR_PAUSAS;
  const CARTAS_BARAJA = 52;
  const PALOS = ['picas', 'corazones', 'treboles', 'diamantes'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'jugar' && a.carta === carta);
  const apuestas = $derived(legales.flatMap((a) => (a.tipo === 'apostar' ? [a.bazas] : [])));

  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, sesion.asiento, sesion.red, T.ohHell.rivalN);
  const detalle = (asiento: Asiento) =>
    T.ohHell.detalle(vista.apuestas[asiento] ?? null, vista.bazas[asiento] ?? 0, vista.puntos[asiento] ?? 0);

  const sumaApuestas = $derived(vista.apuestas.reduce<number>((s, a) => s + (a ?? 0), 0));

  /** La mano por palos (el triunfo primero) y por rango. */
  const manoOrdenada = $derived.by(() => {
    const orden = [vista.triunfo, ...PALOS.filter((p) => p !== vista.triunfo)];
    return [...(vista.miMano ?? [])].sort(
      (a, b) =>
        orden.indexOf(paloOhHell(a)) - orden.indexOf(paloOhHell(b)) || rangoOhHell(b) - rangoOhHell(a),
    );
  });

  /**
   * Lo que necesita la mesa de bazas: el mazo con la carta del triunfo. La última baza de la mano
   * anterior se sigue viendo hasta que alguien apuesta.
   */
  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    mazo: CARTAS_BARAJA - n * vista.cartasMano - 1,
    muestra: vista.cartaTriunfo,
    ultimaBaza:
      vista.fase === 'apostar' && vista.apuestas.some((a) => a !== null) ? null : vista.ultimaBaza,
    resultadosManos: [],
  });

  const aviso = $derived.by(() => {
    const hecha = vista.ultimaAccion;
    if (hecha === null || sesion.fin !== null || hecha.accion.tipo !== 'apostar') return null;
    if (vista.fase !== 'apostar' && vista.mesa.length > 0) return null;
    return T.ohHell.apuesta(nombre(hecha.asiento), hecha.accion.bazas);
  });

  // ── Resultado al terminar cada mano ────────────────────────────────────────

  let resumen: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  let espera: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      sesion.pausar();
      // Primero se ve la última baza en la mesa y después el resultado.
      espera = setTimeout(() => (resumen = total - 1), ESPERA_RESULTADO_MS);
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
  {aviso}
  {nombre}
  {detalle}
>
  {#snippet info()}
    <span data-testid="triunfo">{T.ohHell.triunfo(vista.triunfo)}</span>
    <span data-testid="mano-oh-hell">
      {T.ohHell.mano(vista.indiceMano + 1, vista.totalManos, vista.cartasMano)}
    </span>
    {#if vista.fase === 'apostar'}
      <span data-testid="suma-apuestas">{T.ohHell.sumaApuestas(sumaApuestas, vista.cartasMano)}</span>
    {/if}
    <span>{T.ohHell.reparte(nombre(vista.repartidor))}</span>
  {/snippet}

  {#snippet acciones(cancelar: () => void)}
    {#if apuestas.length > 0}
      <div class="apuestas" role="group" aria-label={T.ohHell.apuestaTitulo}>
        <span class="pregunta">{T.ohHell.apuestaTitulo}</span>
        {#each apuestas as b (b)}
          <button
            class="principal"
            data-testid="apostar-{b}"
            onclick={() => {
              cancelar();
              sesion.jugar({ tipo: 'apostar', bazas: b });
            }}
          >
            {b}
          </button>
        {/each}
        {#if vista.apuestaProhibida !== null}
          <span class="prohibida" data-testid="apuesta-prohibida">{T.ohHell.noPuedes(vista.apuestaProhibida)}</span>
        {/if}
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.ohHell.finMano(resumen + 1, vista.totalManos)}</h2>
      <ResumenOhHell resultado={vista.resultadosManos[resumen]!} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.ohHell.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .apuestas {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .apuestas button {
    min-width: 40px;
    padding-inline: 8px;
  }

  .pregunta {
    font-weight: 600;
  }

  .prohibida {
    flex-basis: 100%;
    text-align: center;
    font-size: 0.85rem;
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
    margin-bottom: 8px;
  }

  .dialogo > button {
    margin-top: 14px;
    width: 100%;
  }
</style>
