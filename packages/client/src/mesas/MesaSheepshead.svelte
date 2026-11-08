<script lang="ts">
  import {
    fuerzaSheepshead,
    paloEfectivoSheepshead,
    type AccionSheepshead,
    type Asiento,
    type ConfigSheepshead,
    type EstadoSheepshead,
    type IdCarta,
    type PaloEfectivoSheepshead,
    type VistaSheepshead,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenSheepshead from './ResumenSheepshead.svelte';

  interface Props {
    sesion: SesionMesa<ConfigSheepshead, EstadoSheepshead, AccionSheepshead, VistaSheepshead>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 5;
  const ORDEN: readonly PaloEfectivoSheepshead[] = ['triunfo', 'treboles', 'picas', 'corazones'];

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);

  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, JUGADORES, yo, sesion.red, T.brisca.rivalN);
  const detalle = (asiento: Asiento) => {
    const marcas: string[] = [];
    if (asiento === vista.repartidor) marcas.push(T.sheepshead.reparte);
    if (vista.fase === 'coger') {
      if (vista.pasados[asiento]) marcas.push(T.sheepshead.pasa);
    } else {
      if (asiento === vista.picker) marcas.push(T.sheepshead.picker);
      if (vista.companero === asiento && asiento !== vista.picker) marcas.push(T.sheepshead.companero);
      if (vista.fase === 'bazas') marcas.push(T.sheepshead.puntosMano(vista.puntosMano[asiento] ?? 0));
    }
    if (asiento !== yo) marcas.push(`${vista.marcador[asiento]}`);
    return marcas.join(' · ');
  };

  // ── Cartas: enterrar o jugar ───────────────────────────────────────────────

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => (a.tipo === 'jugar' || a.tipo === 'enterrar') && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  function jugar(carta: IdCarta) {
    const accion = accionDe(carta);
    if (accion) sesion.jugar(accion);
  }

  /** La mano con los triunfos primero, y cada palo de mayor a menor. */
  const manoOrdenada = $derived(
    [...(vista.miMano ?? [])].sort(
      (a, b) =>
        ORDEN.indexOf(paloEfectivoSheepshead(a)) - ORDEN.indexOf(paloEfectivoSheepshead(b)) ||
        fuerzaSheepshead(b) - fuerzaSheepshead(a),
    ),
  );

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    config: { jugadores: JUGADORES },
    miMano: manoOrdenada,
    mazo: 0,
    muestra: null,
    resultadosManos: [],
  });

  const aviso = $derived.by(() => {
    if (sesion.fin !== null) return null;
    const quien = nombre(vista.turno ?? 0);
    switch (vista.fase) {
      case 'coger':
        return vista.turno === yo ? T.sheepshead.tuTurnoCoger : T.sheepshead.decidiendo(quien);
      case 'enterrar':
        return vista.turno === yo ? T.sheepshead.entierra(2 - vista.enterradas) : T.sheepshead.enterrando(quien);
      default:
        return null;
    }
  });

  const bando = $derived.by(() => {
    if (vista.leaster) return T.sheepshead.leaster;
    if (vista.picker === null) return null;
    const picker = T.sheepshead.pickerDe(nombre(vista.picker));
    if (vista.companero === null) return `${picker} · ${T.sheepshead.companeroOculto}`;
    if (vista.companero === vista.picker) return `${picker} · ${T.sheepshead.solo}`;
    return `${picker} · ${T.sheepshead.companeroDe(nombre(vista.companero))}`;
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
    <span class="mano-n" data-testid="mano-sheepshead">{T.sheepshead.mano(vista.manoNumero, vista.config.manos)}</span>
    {#if bando !== null}<span class="bando" data-testid="bando">{bando}</span>{/if}
    {#if vista.enBlind > 0}
      <span class="blind" data-testid="blind">
        {T.sheepshead.blind}
        {#each Array.from({ length: vista.enBlind }, (_, i) => i) as i (i)}<span class="mini"><Carta /></span>{/each}
      </span>
    {/if}
    <span class="cuenta" data-testid="marcador">{T.sheepshead.marcador(vista.marcador[yo] ?? 0)}</span>
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if miTurno && vista.fase === 'coger'}
      <div class="otras" data-testid="panel-coger">
        <button data-accion="coger"
          class="principal"
          data-testid="coger"
          onclick={() => {
            cancelar();
            sesion.jugar({ tipo: 'coger' });
          }}>{T.sheepshead.coger}</button
        >
        <button data-accion="pasar"
          data-testid="pasar"
          onclick={() => {
            cancelar();
            sesion.jugar({ tipo: 'pasar' });
          }}>{T.sheepshead.pasar}</button
        >
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.sheepshead.finMano(resumen + 1)}</h2>
      <ResumenSheepshead resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.sheepshead.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .bando {
    font-weight: 700;
    color: var(--acento);
  }

  .cuenta,
  .mano-n {
    color: var(--texto-suave);
  }

  .blind {
    display: inline-flex;
    align-items: center;
    gap: 2px;
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
