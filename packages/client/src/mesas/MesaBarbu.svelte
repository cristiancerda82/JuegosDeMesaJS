<script lang="ts">
  import {
    paloBarbu,
    rangoBarbu,
    type AccionBarbu,
    type Asiento,
    type ConfigBarbu,
    type EstadoBarbu,
    type IdCarta,
    type VistaBarbu,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import DominoBarbu from './DominoBarbu.svelte';
  import ResumenBarbu from './ResumenBarbu.svelte';

  interface Props {
    sesion: SesionMesa<ConfigBarbu, EstadoBarbu, AccionBarbu, VistaBarbu>;
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
    if (asiento === vista.repartidor) marcas.push(T.barbu.reparte);
    if (vista.fase === 'bazas') marcas.push(T.barbu.enMano(vista.puntosMano[asiento] ?? 0));
    return marcas.join(' · ');
  };

  /** La mano por palos (el triunfo primero) y por valor. */
  const manoOrdenada = $derived.by(() => {
    const t = vista.triunfo;
    const orden = t === null ? [...PALOS] : [t, ...PALOS.filter((p) => p !== t)];
    return [...(vista.miMano ?? [])].sort(
      (a, b) => orden.indexOf(paloBarbu(a)) - orden.indexOf(paloBarbu(b)) || rangoBarbu(b) - rangoBarbu(a),
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

  // ── Contrato y triunfo ─────────────────────────────────────────────────────

  const decisiones = $derived(legales.filter((a) => a.tipo === 'contrato' || a.tipo === 'triunfo'));
  const idDe = (a: AccionBarbu) =>
    a.tipo === 'contrato' ? `contrato-${a.contrato}` : a.tipo === 'triunfo' ? `triunfo-${a.palo}` : a.tipo;
  const etiqueta = (a: AccionBarbu) =>
    a.tipo === 'contrato' ? T.barbu.nombreContrato(a.contrato) : a.tipo === 'triunfo' ? T.barbu.palo(a.palo) : '';

  const aviso = $derived.by(() => {
    if (sesion.fin !== null) return null;
    if (vista.fase === 'contrato') {
      return vista.turno === yo ? T.barbu.eligeContrato : T.barbu.eligiendo(nombre(vista.repartidor));
    }
    if (vista.fase === 'triunfo') {
      return vista.turno === yo ? T.barbu.eligeTriunfo : T.barbu.eligiendo(nombre(vista.repartidor));
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
  <DominoBarbu {sesion} {nombre} />
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
        {T.barbu.manoRonda(Math.min(vista.resultadosManos.length + 1, vista.config.manos), vista.config.manos)}
      </span>
      {#if vista.contrato !== null}
        <span class="contrato" data-testid="contrato-barbu">{T.barbu.contrato(vista.contrato, vista.triunfo)}</span>
      {/if}
      <span class="puntos" data-testid="puntos-{yo}">{T.barbu.tusPuntos(vista.puntosMano[yo] ?? 0, vista.totales[yo] ?? 0)}</span>
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
      <h2 id="fin-mano">{T.barbu.finMano(resumen + 1)}</h2>
      <ResumenBarbu resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.barbu.siguienteMano}
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
