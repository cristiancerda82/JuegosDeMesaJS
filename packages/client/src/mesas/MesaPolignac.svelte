<script lang="ts">
  import {
    paloPolignac,
    rangoPolignac,
    type AccionPolignac,
    type Asiento,
    type ConfigPolignac,
    type EstadoPolignac,
    type IdCarta,
    type VistaPolignac,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenPolignac from './ResumenPolignac.svelte';

  interface Props {
    sesion: SesionMesa<ConfigPolignac, EstadoPolignac, AccionPolignac, VistaPolignac>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const PALOS = ['picas', 'corazones', 'treboles', 'diamantes'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const n = $derived(vista.config.jugadores);
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => a.tipo === 'jugar' && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  // Cada uno contra todos: los rivales se numeran, sin compañero.
  const nombre = (asiento: Asiento) => nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN);

  /** Si el asiento ya ha pasado el general en esta mano (deciden desde el siguiente al que reparte). */
  const paso = (asiento: Asiento) =>
    vista.general === null && (asiento - vista.repartidor - 1 + n) % n < vista.pasados;

  const detalle = (asiento: Asiento) => {
    const marcas: string[] = [];
    if (asiento === vista.repartidor) marcas.push(T.polignac.reparte);
    if (asiento === vista.general) marcas.push(T.polignac.general);
    else if (vista.fase === 'general' && paso(asiento)) marcas.push(T.polignac.pasa);
    if (vista.fase === 'bazas') marcas.push(T.polignac.enMano(vista.puntosMano[asiento] ?? 0));
    return marcas.join(' · ');
  };

  /** La mano por palos y por valor. */
  const manoOrdenada = $derived.by(() => {
    const orden = [...PALOS];
    return [...(vista.miMano ?? [])].sort(
      (a, b) => orden.indexOf(paloPolignac(a)) - orden.indexOf(paloPolignac(b)) || rangoPolignac(b) - rangoPolignac(a),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    mazo: 0,
    muestra: null,
    resultadosManos: [],
  });

  function hacer(accion: AccionPolignac, cancelar: () => void) {
    cancelar();
    sesion.jugar(accion);
  }

  const aviso = $derived.by(() => {
    if (sesion.fin !== null || vista.fase !== 'general') return null;
    return vista.turno === yo ? T.polignac.decide : T.polignac.decidiendo(nombre(vista.turno ?? 0));
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
    <span class="mano-n" data-testid="mano-polignac">{T.polignac.manoN(vista.manoNumero)}</span>
    {#if vista.general !== null}
      <span class="general" data-testid="general-polignac">{T.polignac.juegaGeneral(nombre(vista.general))}</span>
    {/if}
    <span class="puntos" data-testid="puntos-{yo}"
      >{T.polignac.tusPuntos(vista.puntosMano[yo] ?? 0, vista.totales[yo] ?? 0, vista.config.limite)}</span
    >
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if miTurno && vista.fase === 'general'}
      <div class="otras" data-testid="panel-general">
        <button
          data-accion="general"
          data-jugada={JSON.stringify({ tipo: 'general' })}
          class="principal"
          data-testid="anunciar-general"
          onclick={() => hacer({ tipo: 'general' }, cancelar)}>{T.polignac.anunciar}</button
        >
        <button
          data-accion="pasar"
          data-jugada={JSON.stringify({ tipo: 'pasar' })}
          data-testid="pasar-general"
          onclick={() => hacer({ tipo: 'pasar' }, cancelar)}>{T.polignac.pasar}</button
        >
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.polignac.finMano(resumen + 1)}</h2>
      <ResumenPolignac resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.polignac.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .general {
    font-weight: 700;
    color: var(--acento);
  }

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
