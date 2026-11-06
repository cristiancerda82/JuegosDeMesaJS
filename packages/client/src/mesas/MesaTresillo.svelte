<script lang="ts">
  import {
    esTriunfoTresillo,
    paloTresillo,
    rangoTresillo,
    type AccionTresillo,
    type Asiento,
    type ConfigTresillo,
    type EstadoTresillo,
    type IdCarta,
    type PaloEspanol,
    type VistaTresillo,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenTresillo from './ResumenTresillo.svelte';

  interface Props {
    sesion: SesionMesa<ConfigTresillo, EstadoTresillo, AccionTresillo, VistaTresillo>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 3;
  const PALOS: readonly PaloEspanol[] = ['oros', 'copas', 'espadas', 'bastos'];

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const triunfo = $derived(vista.triunfo);
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);

  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, JUGADORES, yo, sesion.red, T.brisca.rivalN);
  const detalle = (asiento: Asiento) => {
    const marcas: string[] = [];
    if (asiento === vista.repartidor) marcas.push(T.tresillo.reparte);
    if (vista.hombre === asiento) marcas.push(T.tresillo.hombre);
    else if (vista.fase === 'subasta') {
      const puja = vista.pujas[asiento];
      if (puja) marcas.push(T.tresillo.puja(puja));
    }
    const cambio = vista.cambiadas[asiento];
    if (vista.fase === 'cambio' && cambio !== null && cambio !== undefined) {
      marcas.push(T.tresillo.cambio(cambio));
    }
    if (vista.fase === 'bazas') marcas.push(T.brisca.bazas(vista.bazas[asiento] ?? 0));
    if (asiento !== yo) marcas.push(T.tresillo.fichasCortas(vista.fichas[asiento] ?? 0));
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

  /** La mano con los triunfos primero (de mayor a menor) y luego cada palo. */
  const manoOrdenada = $derived.by(() => {
    const t = triunfo;
    const grupo = (c: IdCarta) =>
      t && esTriunfoTresillo(c, t) ? -1 : PALOS.indexOf(paloTresillo(c));
    const fuerza = (c: IdCarta) => rangoTresillo(c, t ?? 'oros');
    return [...(vista.miMano ?? [])].sort((a, b) => grupo(a) - grupo(b) || fuerza(b) - fuerza(a));
  });

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    config: { jugadores: JUGADORES },
    miMano: manoOrdenada,
    mazo: vista.enMonte,
    // La vuelta se enseña en la barra, no como muestra suelta.
    muestra: null,
    resultadosManos: [],
  });

  const pujables = $derived(
    legales.flatMap((a) => (a.tipo === 'pujar' ? [a.contrato] : [])),
  );
  const puede = (tipo: AccionTresillo['tipo']) => legales.some((a) => a.tipo === tipo);
  function hacer(accion: AccionTresillo, cancelar: () => void) {
    cancelar();
    sesion.jugar(accion);
  }

  const aviso = $derived.by(() => {
    if (sesion.fin !== null) return null;
    const quien = nombre(vista.turno ?? 0);
    const mio = vista.turno === yo;
    switch (vista.fase) {
      case 'subasta':
        return mio ? T.tresillo.puja_tu : T.tresillo.pujando(quien);
      case 'triunfo':
        return mio ? T.tresillo.eligeTriunfo : T.tresillo.eligiendo(quien);
      case 'cambio':
        if (!mio) return T.tresillo.cambiando(quien);
        return puede('robar') ? T.tresillo.cambia(vista.descartando) : T.tresillo.debeDescartar;
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
    <span class="mano-n" data-testid="mano-tresillo">{T.tresillo.mano(vista.manoNumero, vista.config.manos)}</span>
    <span class="contrato" data-testid="contrato-tresillo">
      {#if vista.vuelta}
        <!-- Sin data-carta: la animación de la mesa la confundiría con la de la mano. -->
        <span class="mini"><Carta id={vista.vuelta} /></span>
      {/if}
      {vista.contrato === null
        ? T.tresillo.subasta
        : T.tresillo.contrato(vista.contrato, triunfo ? T.cartas.palos[triunfo]! : null)}
    </span>
    <span class="cuenta" data-testid="monte">{T.tresillo.monte(vista.enMonte)}</span>
    <span class="bote" data-testid="bote">{T.tresillo.bote(vista.bote)}</span>
    <span class="cuenta" data-testid="fichas">{T.tresillo.fichas(vista.fichas[yo] ?? 0)}</span>
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if miTurno && vista.fase === 'subasta'}
      <div class="otras" data-testid="panel-subasta">
        {#each pujables as contrato (contrato)}
          <button
            class="principal"
            data-testid="pujar-{contrato}"
            onclick={() => hacer({ tipo: 'pujar', contrato }, cancelar)}>{T.tresillo.nombreContrato(contrato)}</button
          >
        {/each}
        <button data-testid="pasar" onclick={() => hacer({ tipo: 'pasar' }, cancelar)}>{T.tresillo.paso}</button>
      </div>
    {:else if miTurno && vista.fase === 'triunfo'}
      <div class="otras" data-testid="panel-triunfo">
        {#each PALOS as palo (palo)}
          <button data-testid="triunfo-{palo}" onclick={() => hacer({ tipo: 'triunfo', palo }, cancelar)}
            >{T.tresillo.palo(palo)}</button
          >
        {/each}
      </div>
    {:else if miTurno && vista.fase === 'cambio' && puede('robar')}
      <div class="otras" data-testid="panel-cambio">
        <button class="principal" data-testid="robar" onclick={() => hacer({ tipo: 'robar' }, cancelar)}>
          {vista.descartando === 0 ? T.tresillo.noCambiar : T.tresillo.cambiar(vista.descartando)}
        </button>
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.tresillo.finMano(resumen + 1)}</h2>
      <ResumenTresillo resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.tresillo.siguienteMano}
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

  .contrato {
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
