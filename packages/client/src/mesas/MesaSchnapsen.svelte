<script lang="ts">
  import {
    paloSchnapsen,
    puntosManoSchnapsen,
    rangoSchnapsen,
    type AccionSchnapsen,
    type Asiento,
    type ConfigSchnapsen,
    type EstadoSchnapsen,
    type IdCarta,
    type VistaSchnapsen,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenSchnapsen from './ResumenSchnapsen.svelte';

  interface Props {
    sesion: SesionMesa<ConfigSchnapsen, EstadoSchnapsen, AccionSchnapsen, VistaSchnapsen>;
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

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => a.tipo === 'jugar' && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, JUGADORES, yo, sesion.red);
  const detalle = (asiento: Asiento) => {
    const reparte = asiento === vista.repartidor ? `${T.schnapsen.reparte} · ` : '';
    return `${reparte}${T.schnapsen.puntosYBazas(puntosManoSchnapsen(vista, asiento), vista.bazas[asiento] ?? 0)}`;
  };

  /** La mano por palos (el triunfo primero) y por orden dentro del palo. */
  const manoOrdenada = $derived.by(() => {
    const t = vista.triunfo;
    const orden = [t, ...PALOS.filter((p) => p !== t)];
    return [...(vista.miMano ?? [])].sort(
      (a, b) =>
        orden.indexOf(paloSchnapsen(a)) - orden.indexOf(paloSchnapsen(b)) ||
        rangoSchnapsen(b) - rangoSchnapsen(a),
    );
  });

  /** El mazo con la carta vuelta debajo; cerrado, con su rótulo. */
  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    mazo: vista.enMazo,
    muestra: vista.cartaVuelta,
    rotuloMuestra: vista.cerrado !== null ? T.schnapsen.cerrado : null,
    resultadosManos: [],
  });

  // ── Cambiar, cantar y cerrar ───────────────────────────────────────────────

  const decisiones = $derived(legales.filter((a) => a.tipo !== 'jugar'));

  function etiqueta(a: AccionSchnapsen): string {
    if (a.tipo === 'cambiar') return T.schnapsen.cambiar;
    if (a.tipo === 'cantar') return T.schnapsen.cantar(a.palo === vista.triunfo ? 40 : 20, a.palo);
    return T.schnapsen.cerrar;
  }

  function idDe(a: AccionSchnapsen): string {
    if (a.tipo === 'cantar') return `cantar-${a.palo}`;
    return a.tipo;
  }

  const aviso = $derived.by(() => {
    const hecha = vista.ultimaAccion;
    if (hecha === null || sesion.fin !== null) return null;
    const a = hecha.accion;
    const quien = nombre(hecha.asiento);
    if (a.tipo === 'cambiar') return T.schnapsen.cambia(quien);
    if (a.tipo === 'cantar') {
      return T.schnapsen.canta(quien, a.palo === vista.triunfo ? 40 : 20, a.palo);
    }
    if (a.tipo === 'cerrar') return T.schnapsen.cierra(quien);
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
  jugar={(carta) => {
    const accion = accionDe(carta);
    if (accion) sesion.jugar(accion);
  }}
  {nombre}
  {detalle}
  {aviso}
>
  {#snippet info()}
    <span class="triunfo" data-testid="triunfo">{T.schnapsen.triunfo(vista.triunfo)}</span>
    {#if vista.cerrado !== null}
      <span class="cerrado" data-testid="cerrado">{T.schnapsen.cerradoPor(nombre(vista.cerrado.asiento))}</span>
    {/if}
    <span data-testid="marcador">
      {T.schnapsen.marcador(vista.puntos[yo] ?? 0, vista.puntos[rival] ?? 0)}
    </span>
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if decisiones.length > 0 && sesion.fin === null && !sesion.bloqueada}
      <div class="decisiones">
        {#each decisiones as a (idDe(a))}
          <button
            class:principal={a.tipo !== 'cerrar'}
            data-testid={idDe(a)}
            onclick={() => {
              cancelar();
              sesion.jugar(a);
            }}>{etiqueta(a)}</button
          >
        {/each}
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.schnapsen.finMano(resumen + 1)}</h2>
      <ResumenSchnapsen resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.schnapsen.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .triunfo {
    font-weight: 700;
    color: var(--acento);
  }

  .cerrado {
    font-weight: 600;
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
