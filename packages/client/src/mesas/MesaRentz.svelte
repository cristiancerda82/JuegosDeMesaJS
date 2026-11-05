<script lang="ts">
  import {
    paloRentz,
    rangoRentz,
    type AccionRentz,
    type Asiento,
    type ConfigRentz,
    type EstadoRentz,
    type IdCarta,
    type VistaRentz,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import DominoRentz from './DominoRentz.svelte';
  import ResumenRentz from './ResumenRentz.svelte';

  interface Props {
    sesion: SesionMesa<ConfigRentz, EstadoRentz, AccionRentz, VistaRentz>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última jugada de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 4;
  const PALOS = ['picas', 'corazones', 'treboles', 'diamantes'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => a.tipo === 'jugar' && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  // Cada uno contra todos: los rivales se numeran, sin compañero.
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, JUGADORES, yo, sesion.red, T.brisca.rivalN);
  const detalle = (asiento: Asiento) => {
    const marcas = [];
    if (asiento === vista.repartidor) marcas.push(T.rentz.reparte);
    if (vista.fase === 'bazas') marcas.push(T.rentz.enMano(vista.puntosMano[asiento] ?? 0));
    return marcas.join(' · ');
  };

  /** La mano por palos y por valor. */
  const manoOrdenada = $derived.by(() => {
    const orden = [...PALOS];
    return [...(vista.miMano ?? [])].sort(
      (a, b) => orden.indexOf(paloRentz(a)) - orden.indexOf(paloRentz(b)) || rangoRentz(b) - rangoRentz(a),
    );
  });

  /** Para el dibujo de la mesa, las bazas de la mano no se cuentan por jugador. */
  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    mazo: 0,
    muestra: null,
    bazas: [0, 0, 0, 0],
    resultadosManos: [],
  });

  // ── Contrato ───────────────────────────────────────────────────────────────

  const decisiones = $derived(legales.filter((a) => a.tipo === 'contrato'));
  const idDe = (a: AccionRentz) => (a.tipo === 'contrato' ? `contrato-${a.contrato}` : a.tipo);
  const etiqueta = (a: AccionRentz) => (a.tipo === 'contrato' ? T.rentz.nombreContrato(a.contrato) : '');

  const aviso = $derived.by(() => {
    if (sesion.fin !== null) return null;
    if (vista.fase === 'contrato') {
      return vista.turno === yo ? T.rentz.eligeContrato : T.rentz.eligiendo(nombre(vista.repartidor));
    }
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

{#if vista.fase === 'domino'}
  <DominoRentz {sesion} {nombre} />
{:else}
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
      <span class="ronda" data-testid="mano-ronda">
        {T.rentz.manoRonda(vista.manoNumero, 4 * vista.config.rondas)}
      </span>
      {#if vista.contrato !== null}
        <span class="contrato" data-testid="contrato-rentz">
          {T.rentz.eligio(nombre(vista.repartidor), T.rentz.contrato(vista.contrato))}
        </span>
      {/if}
      <span class="puntos" data-testid="puntos-{yo}">{T.rentz.tusPuntos(vista.puntosMano[yo] ?? 0, vista.totales[yo] ?? 0)}</span>
    {/snippet}
    {#snippet acciones(cancelar)}
      {#if decisiones.length > 0 && sesion.fin === null && !sesion.bloqueada}
        <div class="decisiones">
          {#each decisiones as a (idDe(a))}
            <button
              class="principal"
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
{/if}

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.rentz.finMano(resumen + 1)}</h2>
      <ResumenRentz resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.rentz.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .contrato {
    font-weight: 700;
    color: var(--acento);
  }

  .ronda,
  .puntos {
    color: var(--texto-suave);
  }

  /* Los siete contratos caben en dos filas a 360 px. */
  .decisiones {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
    max-width: 100%;
  }

  .decisiones button {
    min-height: 34px;
    padding: 2px 7px;
    font-size: 0.8rem;
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
