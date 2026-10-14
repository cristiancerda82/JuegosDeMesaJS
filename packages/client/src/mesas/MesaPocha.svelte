<script lang="ts">
  import type {
    AccionPocha,
    Asiento,
    ConfigPocha,
    EstadoPocha,
    IdCarta,
    VistaPocha,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import { HUMANO, type Sesion } from '../sesion/sesion.svelte';
  import { T } from '../textos';
  import type { VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';

  interface Props {
    sesion: Sesion<ConfigPocha, EstadoPocha, AccionPocha, VistaPocha>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resultado. */
  const ESPERA_RESULTADO_MS = 1100 * FACTOR_PAUSAS;
  const CARTAS_BARAJA = 40;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'jugar' && a.carta === carta);
  const apuestas = $derived(legales.flatMap((a) => (a.tipo === 'apostar' ? [a.bazas] : [])));

  const nombre = (asiento: Asiento) =>
    asiento === HUMANO ? T.brisca.tu : T.pocha.rivalN(asiento);
  const detalle = (asiento: Asiento) =>
    T.pocha.detalle(
      vista.apuestas[asiento] ?? null,
      vista.bazas[asiento] ?? 0,
      vista.totales[asiento] ?? 0,
    );

  const sumaApuestas = $derived(vista.apuestas.reduce<number>((s, a) => s + (a ?? 0), 0));

  /**
   * Lo que necesita la mesa de bazas. La última baza de la mano anterior se sigue viendo hasta
   * que alguien apuesta, y el resultado de la mano lo muestra el panel propio.
   */
  const vistaMesa: VistaBazas = $derived({
    ...vista,
    mazo: vista.muestra === null ? 0 : CARTAS_BARAJA - n * vista.cartasMano - 1,
    ultimaBaza:
      vista.fase === 'apostar' && vista.apuestas.some((a) => a !== null) ? null : vista.ultimaBaza,
    resultadosManos: [],
  });

  const cartaVisible = (asiento: Asiento) =>
    asiento === vista.repartidor ? vista.cartaTriunfo : null;

  // ── Aviso de las apuestas de la IA ─────────────────────────────────────────

  let anunciado: { asiento: Asiento; bazas: number } | null = $state(null);
  let apuestasVistas: readonly (number | null)[] = [];
  $effect(() => {
    const actuales = vista.apuestas;
    const nueva = actuales.findIndex((a, i) => a !== null && (apuestasVistas[i] ?? null) === null);
    if (actuales.every((a) => a === null)) anunciado = null;
    else if (nueva !== -1 && nueva !== HUMANO) anunciado = { asiento: nueva, bazas: actuales[nueva]! };
    apuestasVistas = actuales;
  });

  const enPausa = $derived(sesion.bloqueada && sesion.pensando === null);
  const aviso = $derived.by(() => {
    const a = anunciado;
    const sinBazas = vista.bazas.every((b) => b === 0) && vista.mesa.length === 0;
    if (!enPausa || a === null || !sinBazas) return null;
    return T.pocha.apuesta(nombre(a.asiento), a.bazas);
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
  {cartaVisible}
  {aviso}
  {nombre}
  {detalle}
>
  {#snippet info()}
    <span>{T.brisca.triunfo}: <b class="triunfo">{vista.triunfo}</b></span>
    <span data-testid="mano-pocha">
      {T.pocha.mano(vista.indiceMano + 1, vista.totalManos, vista.cartasMano)}
    </span>
    {#if vista.fase === 'apostar'}
      <span data-testid="suma-apuestas">{T.pocha.sumaApuestas(sumaApuestas, vista.cartasMano)}</span>
    {/if}
    <span>{nombre(vista.repartidor)} {T.pocha.reparte}</span>
  {/snippet}

  {#snippet acciones(cancelar: () => void)}
    {#if apuestas.length > 0}
      <div class="apuestas" role="group" aria-label={T.pocha.apuestaTitulo}>
        <span class="pregunta">{T.pocha.apuestaTitulo}</span>
        {#each apuestas as b (b)}
          <button class="principal" data-testid="apostar-{b}" onclick={() => {
              cancelar();
              sesion.jugar({ tipo: 'apostar', bazas: b });
            }}>
            {b}
          </button>
        {/each}
        {#if vista.apuestaProhibida !== null}
          <span class="prohibida" data-testid="apuesta-prohibida">{T.pocha.noPuedes(vista.apuestaProhibida)}</span>
        {/if}
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  {@const r = vista.resultadosManos[resumen]!}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.pocha.finMano(resumen + 1, vista.totalManos)}</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">{T.pocha.jugador}</th>
            <th scope="col">{T.pocha.apuestaCol}</th>
            <th scope="col">{T.pocha.bazasCol}</th>
            <th scope="col">{T.pocha.puntosCol}</th>
            <th scope="col">{T.pocha.totalCol}</th>
          </tr>
        </thead>
        <tbody>
          {#each r.apuestas as apuesta, a (a)}
            {@const acierta = apuesta === r.bazas[a]}
            <tr class:acierta data-testid="fila-{a}" data-acierta={acierta}>
              <th scope="row">
                <span class="marca" aria-label={acierta ? T.pocha.acierto : T.pocha.fallo}>{acierta ? '✓' : '✗'}</span>
                {nombre(a)}
              </th>
              <td>{apuesta}</td>
              <td>{r.bazas[a]}</td>
              <td data-testid="puntos-mano-{a}">{T.pocha.puntos(r.puntos[a]!)}</td>
              <td>{r.totalesTras[a]}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.pocha.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .triunfo {
    color: var(--acento);
    text-transform: capitalize;
  }

  .apuestas {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .apuestas button {
    min-width: 44px;
    padding-inline: 10px;
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

  table {
    width: 100%;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 4px 6px;
  }

  thead th {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--texto-suave);
  }

  tbody th {
    text-align: left;
    font-weight: 500;
    white-space: nowrap;
  }

  .marca {
    display: inline-block;
    width: 1.2em;
    color: #f08080;
  }

  .acierta .marca {
    color: #8fe08f;
  }

  .acierta td {
    font-weight: 700;
  }

  .dialogo > button {
    margin-top: 14px;
    width: 100%;
  }
</style>
