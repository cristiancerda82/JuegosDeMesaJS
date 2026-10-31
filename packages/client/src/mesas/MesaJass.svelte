<script lang="ts">
  import {
    MULTIPLICADOR_JASS,
    eligioJass,
    paloJass,
    parejaJass,
    rangoJass,
    naturalJass,
    type AccionJass,
    type Asiento,
    type ConfigJass,
    type EstadoJass,
    type IdCarta,
    type VistaJass,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenJass from './ResumenJass.svelte';

  interface Props {
    sesion: SesionMesa<ConfigJass, EstadoJass, AccionJass, VistaJass>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 4;
  const PALOS = ['picas', 'corazones', 'treboles', 'diamantes'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const mio = $derived(parejaJass(yo));
  const lados: [string, string] = [T.brisca.nosotros, T.brisca.ellos];
  const eligiendo = $derived(vista.fase === 'eleccion');
  const bazasJugadas = $derived(vista.bazasGanadas[0] + vista.bazasGanadas[1]);

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => a.tipo === 'jugar' && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, JUGADORES, yo, sesion.red);
  const lado = (pareja: number) => lados[pareja === mio ? 0 : 1]!;
  const detalle = (asiento: Asiento) => {
    const marcas = [];
    if (asiento === vista.repartidor) marcas.push(T.jass.reparte);
    if (!eligiendo && asiento === eligioJass(vista)) marcas.push(T.jass.eligio);
    return marcas.join(' · ');
  };

  /** La mano por palos (el triunfo primero) y por orden dentro del palo. */
  const manoOrdenada = $derived.by(() => {
    const m = vista.modo;
    const orden = PALOS.includes(m as never) ? [m, ...PALOS.filter((p) => p !== m)] : [...PALOS];
    const rango = (c: IdCarta) => (m === null ? naturalJass(c) : rangoJass(c, m));
    return [...(vista.miMano ?? [])].sort(
      (a, b) => orden.indexOf(paloJass(a)) - orden.indexOf(paloJass(b)) || rango(b) - rango(a),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    mazo: 0,
    muestra: null,
    bazas: [0, 1, 2, 3].map((a) => vista.bazasGanadas[parejaJass(a)]),
    resultadosManos: [],
  });

  // ── Elegir el modo ─────────────────────────────────────────────────────────

  const decisiones = $derived(legales.filter((a) => a.tipo === 'elegir' || a.tipo === 'pasar'));
  const idDe = (a: AccionJass) => (a.tipo === 'elegir' ? `modo-${a.modo}` : a.tipo);
  const etiqueta = (a: AccionJass) => (a.tipo === 'elegir' ? T.jass.modoBoton(a.modo) : T.jass.pasar);

  const aviso = $derived.by(() => {
    if (sesion.fin !== null || !eligiendo) return null;
    if (vista.turno === yo) return vista.pasado ? T.jass.tePasan : T.jass.eligeTu;
    const quien = nombre(vista.turno ?? vista.elige);
    return vista.pasado ? T.jass.pasa(nombre(vista.elige), quien) : T.jass.eligiendo(quien);
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
    {#if vista.modo !== null}
      <span class="modo" data-testid="modo-jass">{T.jass.modo(vista.modo, MULTIPLICADOR_JASS[vista.modo])}</span>
    {/if}
    {#each [mio, 1 - mio] as p, i (p)}
      <span class="puntos" data-testid="puntos-{i}">
        {T.jass.puntos(lados[i]!, vista.puntosMano[p as 0 | 1], vista.puntos[p as 0 | 1], vista.config.meta)}
      </span>
    {/each}
    {#if vista.modo !== null && bazasJugadas === 0 && vista.misWeis.length > 0}
      <span class="weis" data-testid="mis-weis">{T.jass.misWeis(vista.misWeis.reduce((s, w) => s + w.puntos, 0))}</span>
    {/if}
    {#if vista.weis !== null}
      <span class="weis" data-testid="weis">
        {T.jass.weis(lado(vista.weis.pareja), vista.weis.declaraciones.map((d) => T.jass.unWeis(d.weis)).join(', '))}
      </span>
    {/if}
    {#if vista.stock !== null}
      <span class="weis" data-testid="stock">{T.jass.stock(nombre(vista.stock))}</span>
    {/if}
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if decisiones.length > 0 && sesion.fin === null && !sesion.bloqueada}
      <div class="decisiones">
        {#each decisiones as a (idDe(a))}
          <button
            class:principal={a.tipo !== 'pasar'}
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
      <h2 id="fin-mano">{T.jass.finMano(resumen + 1)}</h2>
      <ResumenJass resultado={vista.resultadosManos[resumen]!} {lados} bando={mio} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.jass.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .modo {
    font-weight: 700;
    color: var(--acento);
  }

  .puntos {
    color: var(--texto-suave);
  }

  .weis {
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
    padding: 4px 10px;
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
