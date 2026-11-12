<script lang="ts">
  import {
    ladoTwentyNine,
    paloTwentyNine,
    rangoTwentyNine,
    type AccionTwentyNine,
    type Asiento,
    type ConfigTwentyNine,
    type EstadoTwentyNine,
    type IdCarta,
    type PaloFrances,
    type VistaTwentyNine,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenTwentyNine from './ResumenTwentyNine.svelte';

  interface Props {
    sesion: SesionMesa<ConfigTwentyNine, EstadoTwentyNine, AccionTwentyNine, VistaTwentyNine>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const PALOS: readonly PaloFrances[] = ['picas', 'corazones', 'treboles', 'diamantes'];

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);
  const nuestro = $derived(ladoTwentyNine(yo));

  const nombre = (asiento: Asiento) => nombreNumerado(asiento, 4, yo, sesion.red, T.brisca.rivalN);
  const detalle = (asiento: Asiento) => {
    const marcas: string[] = [];
    if (asiento === vista.repartidor) marcas.push(T.twentyNine.reparte);
    if (vista.fase === 'subasta') {
      const p = vista.pujas[asiento];
      if (p !== null && p !== undefined) marcas.push(T.twentyNine.dicho(p));
    } else if (asiento === vista.pujador) marcas.push(T.twentyNine.pujo);
    if (vista.pareja === asiento) marcas.push(T.twentyNine.pareja);
    return marcas.join(' · ');
  };

  // ── Cartas ─────────────────────────────────────────────────────────────────

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => a.tipo === 'jugarCarta' && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  function jugar(carta: IdCarta) {
    const accion = accionDe(carta);
    if (accion) sesion.jugar(accion);
  }

  /** La mano por palos (el triunfo, si se conoce, primero) y de mayor a menor. */
  const manoOrdenada = $derived.by(() => {
    const orden = vista.triunfo ? [vista.triunfo, ...PALOS.filter((p) => p !== vista.triunfo)] : PALOS;
    return [...(vista.miMano ?? [])].sort(
      (a, b) =>
        orden.indexOf(paloTwentyNine(a)) - orden.indexOf(paloTwentyNine(b)) ||
        rangoTwentyNine(b) - rangoTwentyNine(a),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    config: { jugadores: 4 },
    miMano: manoOrdenada,
    cartasEnMano: vista.cartasEnMano,
    mazo: 0,
    muestra: null,
    mesa: vista.mesa,
    turno: vista.turno,
    bazas: [0, 0, 0, 0],
    ultimaBaza: vista.ultimaBaza,
    resultadosManos: [],
  });

  // ── Acciones ───────────────────────────────────────────────────────────────

  const deTipo = <K extends AccionTwentyNine['tipo']>(tipo: K) =>
    legales.filter((a): a is Extract<AccionTwentyNine, { tipo: K }> => a.tipo === tipo);
  const pujas = $derived(deTipo('pujar'));
  const triunfos = $derived(deTipo('elegirTriunfo'));
  const otras = $derived(
    legales.filter((a) =>
      ['pasar', 'doblar', 'noDoblar', 'redoblar', 'noRedoblar', 'pedirTriunfo', 'cantarPareja'].includes(a.tipo),
    ),
  );
  const textoDe = (a: AccionTwentyNine) => {
    switch (a.tipo) {
      case 'elegirTriunfo':
        return a.palo === null ? T.twentyNine.sinTriunfo : T.twentyNine.palo(a.palo);
      case 'pujar':
        return String(a.valor);
      default:
        return T.twentyNine.acciones[a.tipo] ?? a.tipo;
    }
  };
  function hacer(accion: AccionTwentyNine, cancelar: () => void) {
    cancelar();
    sesion.jugar(accion);
  }

  // ── Información ────────────────────────────────────────────────────────────

  const textoTriunfo = $derived(
    vista.sinTriunfo
      ? T.twentyNine.sinTriunfo
      : vista.triunfo !== null
        ? T.twentyNine.palo(vista.triunfo) + (vista.descubierto ? '' : ` (${T.twentyNine.secreto})`)
        : vista.triunfoOculto
          ? T.twentyNine.oculto
          : T.twentyNine.porElegir,
  );

  const aviso = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return null;
    const quien = nombre(vista.turno);
    const mio = vista.turno === yo;
    switch (vista.fase) {
      case 'subasta':
        // En su turno, los botones de las pujas ya lo dicen (y el aviso los taparía).
        return mio ? null : T.twentyNine.pujando(quien);
      case 'triunfo':
        return mio ? T.twentyNine.eligeTriunfo : T.twentyNine.eligiendo(quien);
      case 'doblar':
        return mio ? T.twentyNine.doblarTu : T.twentyNine.doblando(quien);
      case 'redoblar':
        return mio ? T.twentyNine.redoblarTu : T.twentyNine.doblando(quien);
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
    <span data-testid="puja-twenty">
      {vista.puja === null
        ? T.twentyNine.sinPuja
        : T.twentyNine.puja(vista.puja, nombre(vista.pujador!), vista.multiplicador)}
    </span>
    <span data-testid="triunfo-twenty">{T.twentyNine.triunfo}: <b>{textoTriunfo}</b></span>
    {#if vista.fase === 'bazas'}
      <span data-testid="puntos-mano">
        {T.twentyNine.puntosMano(vista.puntosMano[nuestro]!, vista.puntosMano[1 - nuestro]!)}
      </span>
    {/if}
    <span data-testid="marcador">
      {T.twentyNine.marcador(vista.marcador[nuestro]!, vista.marcador[1 - nuestro]!)}
    </span>
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if miTurno && (pujas.length > 0 || triunfos.length > 0 || otras.length > 0)}
      <div class="decision" data-testid="panel-twenty">
        {#if pujas.length > 0}
          <div class="pujas" role="group" aria-label={T.twentyNine.subasta}>
            {#each pujas as a (a.valor)}
              <button
                class="principal"
                data-accion={a.tipo}
                data-jugada={JSON.stringify(a)}
                data-testid="puja-{a.valor}"
                onclick={() => hacer(a, cancelar)}>{textoDe(a)}</button
              >
            {/each}
          </div>
        {/if}
        {#each triunfos as a (a.palo ?? 'sin')}
          <button
            class="principal"
            data-accion={a.tipo}
            data-jugada={JSON.stringify(a)}
            data-testid="triunfo-{a.palo ?? 'sin'}"
            onclick={() => hacer(a, cancelar)}>{textoDe(a)}</button
          >
        {/each}
        {#each otras as a (a.tipo)}
          <button
            class:principal={a.tipo !== 'pasar' && !a.tipo.startsWith('no')}
            data-accion={a.tipo}
            data-jugada={JSON.stringify(a)}
            data-testid={a.tipo}
            onclick={() => hacer(a, cancelar)}>{textoDe(a)}</button
          >
        {/each}
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.twentyNine.finMano(resumen + 1)}</h2>
      <ResumenTwentyNine resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.twentyNine.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .decision {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .decision button {
    min-height: 36px;
    padding: 2px 12px;
  }

  .pujas {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
    width: min(100%, 360px);
  }

  .pujas button {
    min-width: 0;
    padding-inline: 0;
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
