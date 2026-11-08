<script lang="ts">
  import {
    paloBourre,
    rangoBourre,
    type AccionBourre,
    type Asiento,
    type ConfigBourre,
    type EstadoBourre,
    type IdCarta,
    type VistaBourre,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenBourre from './ResumenBourre.svelte';

  interface Props {
    sesion: SesionMesa<ConfigBourre, EstadoBourre, AccionBourre, VistaBourre>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 5;
  const PALOS = ['picas', 'corazones', 'treboles', 'diamantes'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const triunfo = $derived(paloBourre(vista.vuelta));
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);

  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, JUGADORES, yo, sesion.red, T.brisca.rivalN);
  const detalle = (asiento: Asiento) => {
    const marcas: string[] = [];
    if (asiento === vista.repartidor) marcas.push(T.bourre.reparte);
    if (!vista.activos[asiento]) marcas.push(T.bourre.fuera);
    else if (vista.juega[asiento] === true) marcas.push(T.bourre.juega);
    else if (vista.juega[asiento] === false) marcas.push(T.bourre.pasa);
    const cambio = vista.cambiadas[asiento];
    if (vista.fase === 'cambio' && cambio !== null && cambio !== undefined) {
      marcas.push(T.bourre.cambio(cambio));
    }
    if (vista.fase === 'bazas' && vista.juega[asiento] === true) {
      marcas.push(T.brisca.bazas(vista.bazas[asiento] ?? 0));
    }
    if (asiento !== yo) marcas.push(T.bourre.fichasCortas(vista.fichas[asiento] ?? 0));
    return marcas.join(' · ');
  };

  // ── Cartas: descartar o jugar ──────────────────────────────────────────────

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => (a.tipo === 'jugarCarta' || a.tipo === 'descartar') && a.carta === carta) ??
    null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  function jugar(carta: IdCarta) {
    const accion = accionDe(carta);
    if (accion) sesion.jugar(accion);
  }

  /** La mano con el triunfo primero, y cada palo de mayor a menor. */
  const manoOrdenada = $derived.by(() => {
    const orden = [triunfo, ...PALOS.filter((p) => p !== triunfo)];
    return [...(vista.miMano ?? [])].sort(
      (a, b) => orden.indexOf(paloBourre(a)) - orden.indexOf(paloBourre(b)) || rangoBourre(b) - rangoBourre(a),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    config: { jugadores: JUGADORES },
    miMano: manoOrdenada,
    mazo: vista.enMazo,
    // La vuelta es del que reparte: se enseña en la barra, no como muestra suelta.
    muestra: null,
    resultadosManos: [],
  });

  const puede = (tipo: AccionBourre['tipo']) => legales.some((a) => a.tipo === tipo);
  function hacer(accion: AccionBourre, cancelar: () => void) {
    cancelar();
    sesion.jugar(accion);
  }

  const aviso = $derived.by(() => {
    if (sesion.fin !== null) return null;
    const quien = nombre(vista.turno ?? 0);
    switch (vista.fase) {
      case 'decidir':
        return vista.turno === yo ? T.bourre.decide : T.bourre.decidiendo(quien);
      case 'cambio':
        return vista.turno === yo ? T.bourre.cambia(vista.cambiando) : T.bourre.cambiando(quien);
      default:
        return null;
    }
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

<MesaBazas vista={vistaMesa} {sesion} {jugable} {jugar} {nombre} {detalle} {aviso}>
  {#snippet info()}
    <span class="mano-n" data-testid="mano-bourre">{T.bourre.mano(vista.manoNumero, vista.config.manos)}</span>
    <span class="vuelta" data-testid="triunfo-bourre">
      <!-- Sin data-carta: la animación de la mesa la confundiría con la de la mano. -->
      <span class="mini"><Carta id={vista.vuelta} /></span>
      {T.bourre.triunfo(triunfo)}
    </span>
    <span class="bote" data-testid="bote">{T.bourre.bote(vista.bote)}</span>
    <span class="cuenta" data-testid="fichas">{T.bourre.fichas(vista.fichas[yo] ?? 0)}</span>
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if miTurno && vista.fase === 'decidir'}
      <div class="otras" data-testid="panel-decidir">
        <button data-accion="jugar" class="principal" data-testid="jugar" onclick={() => hacer({ tipo: 'jugar' }, cancelar)}
          >{T.bourre.jugar}</button
        >
        <button data-accion="pasar" data-testid="pasar" onclick={() => hacer({ tipo: 'pasar' }, cancelar)}>{T.bourre.pasar}</button>
      </div>
    {:else if miTurno && vista.fase === 'cambio' && puede('robar')}
      <div class="otras" data-testid="panel-cambio">
        <button data-accion="robar" class="principal" data-testid="robar" onclick={() => hacer({ tipo: 'robar' }, cancelar)}>
          {vista.cambiando === 0 ? T.bourre.noCambiar : T.bourre.cambiar(vista.cambiando)}
        </button>
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.bourre.finMano(resumen + 1)}</h2>
      <ResumenBourre resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.bourre.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .bote {
    font-weight: 700;
    color: var(--acento);
  }

  .cuenta,
  .mano-n {
    color: var(--texto-suave);
  }

  .vuelta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .mini {
    width: 22px;
    aspect-ratio: 100 / 140;
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
