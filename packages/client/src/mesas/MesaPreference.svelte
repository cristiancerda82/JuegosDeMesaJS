<script lang="ts">
  import {
    PALOS_PUJA_PREFERENCE,
    paloPreference,
    rangoPreference,
    triunfoPreference,
    type AccionPreference,
    type Asiento,
    type ConfigPreference,
    type EstadoPreference,
    type IdCarta,
    type PaloFrances,
    type PujaPreference,
    type VistaPreference,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenPreference from './ResumenPreference.svelte';

  interface Props {
    sesion: SesionMesa<ConfigPreference, EstadoPreference, AccionPreference, VistaPreference>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 3;
  const PALOS: readonly PaloFrances[] = ['picas', 'treboles', 'diamantes', 'corazones'];
  const NIVELES = [6, 7, 8, 9, 10];

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const triunfo = $derived(triunfoPreference(vista.contrato));
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);

  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, JUGADORES, yo, sesion.red, T.brisca.rivalN);
  const detalle = (asiento: Asiento) => {
    const marcas: string[] = [];
    if (asiento === vista.repartidor) marcas.push(T.preference.reparte);
    if (vista.fase === 'subasta') {
      const p = vista.pujas[asiento];
      if (p !== null && p !== undefined) marcas.push(p === 'paso' ? T.preference.paso : T.preference.pujaCorta(p));
    } else {
      if (asiento === vista.juega) marcas.push(T.preference.juega);
      if (vista.whist[asiento] === true) marcas.push(T.preference.haceWhist);
      if (vista.fase === 'bazas') marcas.push(T.brisca.bazas(vista.bazas[asiento] ?? 0));
    }
    return marcas.join(' · ');
  };

  // ── Cartas: descartar o jugar ──────────────────────────────────────────────

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => (a.tipo === 'jugar' || a.tipo === 'descartar') && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  function jugar(carta: IdCarta) {
    const accion = accionDe(carta);
    if (accion) sesion.jugar(accion);
  }

  /** La mano por palos (el triunfo primero) y por rango. */
  const manoOrdenada = $derived.by(() => {
    const orden = triunfo === null ? [...PALOS] : [triunfo, ...PALOS.filter((p) => p !== triunfo)];
    return [...(vista.miMano ?? [])].sort(
      (a, b) =>
        orden.indexOf(paloPreference(a)) - orden.indexOf(paloPreference(b)) ||
        rangoPreference(b) - rangoPreference(a),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    config: { jugadores: JUGADORES },
    miMano: manoOrdenada,
    mazo: 0,
    muestra: null,
    resultadosManos: [],
  });

  // ── Subasta y contrato ─────────────────────────────────────────────────────

  const idPuja = (p: PujaPreference) => (p.tipo === 'bazas' ? `puja-${p.bazas}-${p.palo}` : 'puja-miseria');
  /** En la subasta se puja; al declarar, el mismo panel declara el contrato. */
  const tipoPanel = $derived(vista.fase === 'contrato' ? 'declarar' : 'pujar');
  const pujasLegales = $derived(
    new Set(
      legales.flatMap((a) => (a.tipo === 'pujar' || a.tipo === 'declarar' ? [idPuja(a.puja)] : [])),
    ),
  );
  let nivelElegido: number | null = $state(null);
  const nivelMinimo = $derived(
    NIVELES.find((n) => PALOS_PUJA_PREFERENCE.some((p) => pujasLegales.has(`puja-${n}-${p}`))) ?? null,
  );
  const nivel = $derived(
    nivelElegido !== null && nivelMinimo !== null && nivelElegido >= nivelMinimo ? nivelElegido : nivelMinimo,
  );
  const puedePasar = $derived(legales.some((a) => a.tipo === 'pasar'));
  const panelPujas = $derived(miTurno && (vista.fase === 'subasta' || vista.fase === 'contrato'));
  function pujar(puja: PujaPreference) {
    nivelElegido = null;
    sesion.jugar(tipoPanel === 'declarar' ? { tipo: 'declarar', puja } : { tipo: 'pujar', puja });
  }

  const aviso = $derived.by(() => {
    if (sesion.fin !== null) return null;
    const quien = nombre(vista.turno ?? 0);
    switch (vista.fase) {
      case 'subasta':
        return vista.turno === yo ? T.preference.tuPuja : T.preference.pujando(quien);
      case 'descarte':
        return vista.turno === yo ? T.preference.descarta(2 - vista.enDescarte) : T.preference.descartando(quien);
      case 'contrato':
        return vista.turno === yo ? T.preference.declara : T.preference.declarando(quien);
      case 'whist':
        return vista.turno === yo ? T.preference.decideWhist : T.preference.decidiendoWhist(quien);
      default:
        return null;
    }
  });

  const contratoTexto = $derived.by(() => {
    if (vista.fase === 'bazas' && vista.contrato === null) return T.preference.raspasy;
    if (vista.contrato !== null && vista.juega !== null) {
      return T.preference.contrato(nombre(vista.juega), T.preference.pujaLarga(vista.contrato));
    }
    if (vista.mejor !== null) {
      return T.preference.mejor(nombre(vista.mejor.asiento), T.preference.pujaLarga(vista.mejor.puja));
    }
    return T.preference.subasta;
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
    <span class="contrato" data-testid="contrato-preference">{contratoTexto}</span>
    {#if vista.viuda !== null}
      <span class="viuda" data-testid="viuda">
        {T.preference.viuda}
        <!-- Sin data-carta: la animación de la mesa las confundiría con las de la mano. -->
        {#each vista.viuda as id (id)}<span class="mini" data-viuda={id}><Carta {id} /></span>{/each}
      </span>
    {/if}
    <span class="cuenta" data-testid="cuenta">
      {T.preference.cuenta(vista.pulka[yo] ?? 0, vista.montana[yo] ?? 0, vista.config.meta)}
    </span>
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if panelPujas}
      <div class="subasta" data-testid="subasta">
        {#if nivel !== null}
          <div class="tabla" role="group" aria-label={T.preference.bazasPuja}>
            {#each NIVELES as n (n)}
              <button
                class="nivel"
                class:elegido={n === nivel}
                data-testid="nivel-{n}"
                disabled={n < (nivelMinimo ?? 0)}
                aria-pressed={n === nivel}
                onclick={() => (nivelElegido = n)}>{n}</button
              >
            {/each}
          </div>
          <div class="tabla">
            {#each PALOS_PUJA_PREFERENCE as palo (palo)}
              {@const puja: PujaPreference = { tipo: 'bazas', bazas: nivel, palo }}
              <button
                class="puja principal"
                data-testid={idPuja(puja)}
                disabled={!pujasLegales.has(idPuja(puja))}
                onclick={() => {
                  cancelar();
                  pujar(puja);
                }}>{T.preference.pujaCorta(puja)}</button
              >
            {/each}
          </div>
        {/if}
        {#if tipoPanel === 'pujar'}
          <div class="otras">
            <button
              data-testid="puja-miseria"
              disabled={!pujasLegales.has('puja-miseria')}
              onclick={() => {
                cancelar();
                pujar({ tipo: 'miseria' });
              }}>{T.preference.miseria}</button
            >
            {#if puedePasar}
              <button
                data-testid="pasar"
                onclick={() => {
                  cancelar();
                  nivelElegido = null;
                  sesion.jugar({ tipo: 'pasar' });
                }}>{T.preference.pasar}</button
              >
            {/if}
          </div>
        {/if}
      </div>
    {:else if miTurno && vista.fase === 'whist'}
      <div class="otras" data-testid="panel-whist">
        <button
          class="principal"
          data-testid="whist"
          onclick={() => {
            cancelar();
            sesion.jugar({ tipo: 'whist' });
          }}>{T.preference.whist}</button
        >
        <button
          data-testid="pasar-whist"
          onclick={() => {
            cancelar();
            sesion.jugar({ tipo: 'pasarWhist' });
          }}>{T.preference.paso}</button
        >
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.preference.finMano(resumen + 1)}</h2>
      <ResumenPreference resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.preference.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .contrato {
    font-weight: 700;
    color: var(--acento);
  }

  .cuenta {
    color: var(--texto-suave);
  }

  .viuda {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .mini {
    width: 22px;
    aspect-ratio: 100 / 140;
  }

  .subasta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .tabla {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 56px));
    gap: 4px;
  }

  .puja,
  .nivel {
    min-height: 32px;
    padding: 2px 0;
    font-size: 0.85rem;
  }

  .nivel.elegido {
    background: var(--acento);
    color: #2b2005;
  }

  .nivel:disabled,
  .puja:disabled,
  .otras button:disabled {
    opacity: 0.3;
  }

  .otras {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .otras button {
    min-height: 36px;
    padding: 2px 10px;
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
