<script lang="ts">
  import {
    paloBurroBazas,
    rangoBurroBazas,
    type AccionBurroBazas,
    type Asiento,
    type ConfigBurroBazas,
    type EstadoBurroBazas,
    type IdCarta,
    type VistaBurroBazas,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenBurroBazas from './ResumenBurroBazas.svelte';

  interface Props {
    sesion: SesionMesa<ConfigBurroBazas, EstadoBurroBazas, AccionBurroBazas, VistaBurroBazas>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const PALOS = ['oros', 'copas', 'espadas', 'bastos'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const n = $derived(vista.config.jugadores);
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => a.tipo === 'jugar' && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  /** Robar o pasar, cuando no se tiene el palo de salida. */
  const sinPalo = $derived(legales.find((a) => a.tipo !== 'jugar') ?? null);
  // Cada uno contra todos: los rivales se numeran, sin compañero.
  const nombre = (asiento: Asiento) => nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN);

  /** Durante la pausa tras una baza, lo que robó y pasó cada uno es lo de esa baza. */
  const enBaza = $derived(
    sesion.bloqueada && vista.mesa.length === 0 && vista.ultimaBaza !== null
      ? vista.ultimaBaza
      : vista,
  );

  const detalle = (asiento: Asiento) => {
    const marcas: string[] = [];
    if (asiento === vista.repartidor) marcas.push(T.burroBazas.reparte);
    if ((vista.cartasEnMano[asiento] ?? 0) === 0) marcas.push(T.burroBazas.sinCartas);
    const robadas = enBaza.robadas[asiento] ?? 0;
    if (robadas > 0) marcas.push(T.burroBazas.robo(robadas));
    if (enBaza.pasaron.includes(asiento)) marcas.push(T.burroBazas.pasa);
    const penas = vista.penalizaciones[asiento] ?? 0;
    if (penas > 0) marcas.push(T.burroBazas.penalizacionesCortas(penas));
    return marcas.join(' · ');
  };

  /** La mano por palos y, dentro de cada palo, del Rey al As. */
  const manoOrdenada = $derived(
    [...(vista.miMano ?? [])].sort(
      (a, b) =>
        PALOS.indexOf(paloBurroBazas(a)) - PALOS.indexOf(paloBurroBazas(b)) ||
        rangoBurroBazas(b) - rangoBurroBazas(a),
    ),
  );

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    muestra: null,
    resultadosManos: [],
  });

  function hacer(accion: AccionBurroBazas, cancelar: () => void) {
    cancelar();
    sesion.jugar(accion);
  }

  const aviso = $derived.by(() => {
    if (sesion.fin !== null || sesion.bloqueada) return null;
    if (miTurno && sinPalo !== null) {
      return sinPalo.tipo === 'robar' ? T.burroBazas.debesRobar : T.burroBazas.debesPasar;
    }
    if ((vista.cartasEnMano[yo] ?? 0) === 0) return T.burroBazas.teHasLibrado;
    return null;
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
  jugar={(carta) => {
    const accion = accionDe(carta);
    if (accion) sesion.jugar(accion);
  }}
  {nombre}
  {detalle}
  {aviso}
>
  {#snippet info()}
    <span class="mano-n" data-testid="mano-burro-bazas">{T.burroBazas.manoN(vista.manoNumero)}</span>
    <span class="puntos" data-testid="penalizaciones-{yo}"
      >{T.burroBazas.tusPenalizaciones(vista.penalizaciones[yo] ?? 0, vista.config.limite)}</span
    >
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if miTurno && sinPalo !== null}
      <div class="otras" data-testid="panel-sin-palo">
        <button
          class="principal"
          data-accion={sinPalo.tipo}
          data-jugada={JSON.stringify(sinPalo)}
          data-testid={sinPalo.tipo === 'robar' ? 'robar' : 'pasar'}
          onclick={() => sinPalo && hacer(sinPalo, cancelar)}
          >{sinPalo.tipo === 'robar' ? T.burroBazas.robar : T.burroBazas.pasar}</button
        >
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.burroBazas.finMano(resumen + 1)}</h2>
      <ResumenBurroBazas resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.burroBazas.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .mano-n,
  .puntos {
    color: var(--texto-suave);
  }

  .otras {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .otras button {
    min-height: 36px;
    padding: 2px 12px;
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
