<script lang="ts">
  import {
    paloEcarte,
    rangoEcarte,
    type AccionEcarte,
    type Asiento,
    type ConfigEcarte,
    type EstadoEcarte,
    type IdCarta,
    type VistaEcarte,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenEcarte from './ResumenEcarte.svelte';

  interface Props {
    sesion: SesionMesa<ConfigEcarte, EstadoEcarte, AccionEcarte, VistaEcarte>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 2;
  const PALOS = ['picas', 'corazones', 'treboles', 'diamantes'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const rival = $derived(yo === 0 ? 1 : 0);

  /** Tocar una carta: descartarla en el cambio o jugarla en las bazas. */
  const accionDe = (carta: IdCarta) =>
    legales.find((a) => (a.tipo === 'jugarCarta' || a.tipo === 'descartar') && a.carta === carta) ??
    null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, JUGADORES, yo, sesion.red);
  const detalle = (asiento: Asiento) => (asiento === vista.repartidor ? T.ecarte.reparte : T.ecarte.mano);

  /** La mano por palos y, dentro de cada uno, de mayor a menor. */
  const manoOrdenada = $derived(
    [...(vista.miMano ?? [])].sort(
      (a, b) =>
        PALOS.indexOf(paloEcarte(a) as (typeof PALOS)[number]) -
          PALOS.indexOf(paloEcarte(b) as (typeof PALOS)[number]) || rangoEcarte(b) - rangoEcarte(a),
    ),
  );

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    config: { jugadores: JUGADORES },
    miMano: manoOrdenada,
    mazo: vista.enMonton,
    muestra: vista.vuelta,
    rotuloMuestra: T.ecarte.montonVuelta(vista.enMonton),
    bazas: [vista.bazas[0], vista.bazas[1]],
    resultadosManos: [],
  });

  // ── Cambio ─────────────────────────────────────────────────────────────────

  const decido = $derived(legales.length > 0 && sesion.fin === null && !sesion.bloqueada);
  const puede = (tipo: AccionEcarte['tipo']) => decido && legales.some((a) => a.tipo === tipo);

  const aviso = $derived.by(() => {
    if (sesion.fin !== null || vista.fase === 'bazas') return null;
    if (vista.turno !== yo) return T.ecarte.piensa(nombre(vista.turno ?? rival));
    if (vista.fase === 'cambio') return T.ecarte.proponerOJugar;
    if (vista.fase === 'respuesta') return T.ecarte.teProponen(nombre(rival));
    return T.ecarte.descarta(vista.cambiando, Math.min(5, vista.enMonton), yo !== vista.repartidor);
  });

  function hacer(accion: AccionEcarte, cancelar: () => void) {
    cancelar();
    sesion.jugar(accion);
  }

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
    <span data-testid="marcador">
      {T.ecarte.marcador(vista.puntos[yo as 0 | 1], vista.puntos[rival], vista.config.meta)}
    </span>
    <span data-testid="triunfo-ecarte">{T.ecarte.triunfo(paloEcarte(vista.vuelta))}</span>
    {#if vista.reyVuelto}
      <span class="prima" data-testid="rey-vuelto">{T.ecarte.reyVuelto(nombre(vista.repartidor))}</span>
    {/if}
    {#if vista.rey !== null}
      <span class="prima" data-testid="rey">{T.ecarte.rey(nombre(vista.rey))}</span>
    {/if}
    {#if vista.autoridad !== null}
      <span data-testid="autoridad">{T.ecarte.autoridad(nombre(vista.autoridad))}</span>
    {/if}
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if puede('proponer') || puede('aceptar') || puede('robar')}
      <div class="decisiones">
        {#if puede('proponer')}
          <button data-accion="proponer" class="principal" data-testid="proponer" onclick={() => hacer({ tipo: 'proponer' }, cancelar)}
            >{T.ecarte.proponer}</button
          >
          <button data-accion="jugar" data-testid="jugar" onclick={() => hacer({ tipo: 'jugar' }, cancelar)}>{T.ecarte.jugar}</button>
        {:else if puede('aceptar')}
          <button data-accion="aceptar" class="principal" data-testid="aceptar" onclick={() => hacer({ tipo: 'aceptar' }, cancelar)}
            >{T.ecarte.aceptar}</button
          >
          <button data-accion="rehusar" data-testid="rehusar" onclick={() => hacer({ tipo: 'rehusar' }, cancelar)}>{T.ecarte.rehusar}</button>
        {:else}
          <button data-accion="robar" class="principal" data-testid="robar" onclick={() => hacer({ tipo: 'robar' }, cancelar)}
            >{vista.cambiando === 0 ? T.ecarte.noCambiar : T.ecarte.cambiar(vista.cambiando)}</button
          >
        {/if}
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.ecarte.finMano}</h2>
      <ResumenEcarte resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.ecarte.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .prima {
    font-weight: 700;
    color: var(--acento);
  }

  .decisiones {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .decisiones button {
    min-height: 40px;
    padding: 4px 12px;
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
