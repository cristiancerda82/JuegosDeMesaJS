<script lang="ts">
  import {
    COMODIN_FIVE_HUNDRED,
    PALOS_PUJA_FIVE_HUNDRED,
    paloEfectivo,
    parejaFiveHundred,
    rangoFiveHundred,
    triunfoDe,
    type AccionFiveHundred,
    type Asiento,
    type ConfigFiveHundred,
    type EstadoFiveHundred,
    type IdCarta,
    type PaloFrances,
    type PujaFiveHundred,
    type VistaFiveHundred,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenFiveHundred from './ResumenFiveHundred.svelte';

  interface Props {
    sesion: SesionMesa<ConfigFiveHundred, EstadoFiveHundred, AccionFiveHundred, VistaFiveHundred>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 4;
  const PALOS: readonly PaloFrances[] = ['picas', 'corazones', 'treboles', 'diamantes'];
  const NIVELES = [6, 7, 8, 9, 10];

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const mio = $derived(parejaFiveHundred(yo));
  const lados: [string, string] = [T.brisca.nosotros, T.brisca.ellos];
  const lado = (pareja: number) => lados[pareja === mio ? 0 : 1]!;
  const triunfo = $derived(triunfoDe(vista.mejor?.puja ?? null));
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);

  const nombre = (asiento: Asiento) => nombreAsiento(asiento, JUGADORES, yo, sesion.red);
  const detalle = (asiento: Asiento) => {
    const marcas = [];
    if (asiento === vista.repartidor) marcas.push(T.fiveHundred.reparte);
    const p = vista.pujas[asiento];
    if (vista.fase === 'subasta' && p !== null && p !== undefined) marcas.push(T.fiveHundred.puja(p));
    if (vista.fase !== 'subasta' && vista.mejor?.asiento === asiento) marcas.push(T.fiveHundred.juega);
    return marcas.join(' · ');
  };

  // ── Cartas: descartar o jugar ──────────────────────────────────────────────

  const accionesDe = (carta: IdCarta) =>
    legales.filter((a) => (a.tipo === 'jugar' || a.tipo === 'descartar') && a.carta === carta);
  const jugable = (carta: IdCarta) => accionesDe(carta).length > 0;
  /** Al salir con el comodín sin triunfo, se nombra el palo. */
  let nombrando = $state(false);
  $effect(() => {
    if (!miTurno) nombrando = false;
  });

  function jugar(carta: IdCarta) {
    const acciones = accionesDe(carta);
    if (acciones.length === 1) sesion.jugar(acciones[0]!);
    else if (acciones.length > 1) nombrando = true;
  }

  /** La mano por palos (el triunfo primero, con sus Jotas y el comodín) y por rango. */
  const manoOrdenada = $derived.by(() => {
    const orden: (PaloFrances | null)[] = triunfo === null ? [...PALOS] : [triunfo, ...PALOS.filter((p) => p !== triunfo)];
    const palo = (c: IdCarta) => (c === COMODIN_FIVE_HUNDRED ? -1 : orden.indexOf(paloEfectivo(c, triunfo)));
    return [...(vista.miMano ?? [])].sort(
      (a, b) => palo(a) - palo(b) || rangoFiveHundred(b, triunfo) - rangoFiveHundred(a, triunfo),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    mazo: 0,
    muestra: null,
    bazas: [0, 1, 2, 3].map((a) => vista.bazasGanadas[parejaFiveHundred(a)]),
    resultadosManos: [],
  });

  // ── Subasta ────────────────────────────────────────────────────────────────

  const idPuja = (p: PujaFiveHundred) => (p.tipo === 'bazas' ? `puja-${p.bazas}-${p.palo}` : `puja-${p.tipo}`);
  const pujasLegales = $derived(
    new Set(legales.flatMap((a) => (a.tipo === 'pujar' ? [idPuja(a.puja)] : []))),
  );
  const pujar = (puja: PujaFiveHundred) => sesion.jugar({ tipo: 'pujar', puja });
  /** El número de bazas elegido en la subasta: por defecto, el más bajo que aún se puede pujar. */
  let nivelElegido: number | null = $state(null);
  const nivelMinimo = $derived(
    NIVELES.find((n) => PALOS_PUJA_FIVE_HUNDRED.some((p) => pujasLegales.has(`puja-${n}-${p}`))) ?? null,
  );
  const nivel = $derived(
    nivelElegido !== null && nivelMinimo !== null && nivelElegido >= nivelMinimo ? nivelElegido : nivelMinimo,
  );
  const puedePasar = $derived(legales.some((a) => a.tipo === 'pasar'));

  const aviso = $derived.by(() => {
    if (sesion.fin !== null) return null;
    if (vista.fase === 'subasta') {
      return vista.turno === yo ? T.fiveHundred.tuPuja : T.fiveHundred.pujando(nombre(vista.turno ?? 0));
    }
    if (vista.fase === 'descarte') {
      const faltan = 3 - vista.misDescartes.length;
      return vista.turno === yo ? T.fiveHundred.descarta(faltan) : T.fiveHundred.descartando(nombre(vista.turno ?? 0));
    }
    if (nombrando) return T.fiveHundred.nombraPalo;
    if (vista.paloNombrado !== null && vista.mesa.length > 0) return T.fiveHundred.nombrado(vista.paloNombrado);
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

<MesaBazas vista={vistaMesa} {sesion} {jugable} {jugar} {nombre} {detalle} {aviso}>
  {#snippet info()}
    {#if vista.mejor !== null && vista.fase !== 'subasta'}
      <span class="contrato" data-testid="contrato-500">
        {T.fiveHundred.contrato(vista.mejor.puja, lado(parejaFiveHundred(vista.mejor.asiento)))}
      </span>
    {:else if vista.mejor !== null}
      <span class="contrato" data-testid="contrato-500">{T.fiveHundred.mejor(vista.mejor.puja, nombre(vista.mejor.asiento))}</span>
    {/if}
    {#each [mio, 1 - mio] as p, i (p)}
      <span class="puntos" data-testid="puntos-{i}">
        {T.fiveHundred.puntos(lados[i]!, vista.bazasGanadas[p as 0 | 1], vista.puntos[p as 0 | 1])}
      </span>
    {/each}
    {#if vista.abiertas !== null && vista.mejor !== null && vista.mejor.asiento !== yo}
      <span class="abiertas" data-testid="abiertas">
        {T.fiveHundred.abiertas(nombre(vista.mejor.asiento))}
        {#each vista.abiertas as id (id)}<span class="mini" data-carta={id}><Carta {id} /></span>{/each}
      </span>
    {/if}
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if miTurno && vista.fase === 'subasta'}
      <div class="subasta" data-testid="subasta">
        {#if nivel !== null}
          <div class="tabla" role="group" aria-label={T.fiveHundred.bazasPuja}>
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
            {#each PALOS_PUJA_FIVE_HUNDRED as palo (palo)}
              {@const puja: PujaFiveHundred = { tipo: 'bazas', bazas: nivel, palo }}
              <button data-accion={puja.tipo} data-jugada={JSON.stringify(puja)}
                class="puja principal"
                data-testid={idPuja(puja)}
                disabled={!pujasLegales.has(idPuja(puja))}
                onclick={() => {
                  cancelar();
                  pujar(puja);
                }}>{T.fiveHundred.pujaCorta(puja)}</button
              >
            {/each}
          </div>
        {/if}
        <div class="otras">
          {#each [{ tipo: 'misere' }, { tipo: 'misereAbierto' }] as const as puja (puja.tipo)}
            <button data-accion={puja.tipo} data-jugada={JSON.stringify(puja)}
              data-testid={idPuja(puja)}
              disabled={!pujasLegales.has(idPuja(puja))}
              onclick={() => {
                cancelar();
                pujar(puja);
              }}>{T.fiveHundred.pujaCorta(puja)}</button
            >
          {/each}
          {#if puedePasar}
            <button data-accion="pasar"
              data-testid="pasar"
              onclick={() => {
                cancelar();
                sesion.jugar({ tipo: 'pasar' });
              }}>{T.fiveHundred.pasar}</button
            >
          {/if}
        </div>
      </div>
    {:else if miTurno && nombrando}
      <div class="otras">
        {#each PALOS as palo (palo)}
          <button data-accion="jugar"
            class="principal"
            data-testid="palo-{palo}"
            onclick={() => {
              cancelar();
              nombrando = false;
              sesion.jugar({ tipo: 'jugar', carta: COMODIN_FIVE_HUNDRED, palo });
            }}>{T.fiveHundred.palo(palo)}</button
          >
        {/each}
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.fiveHundred.finMano(resumen + 1)}</h2>
      <ResumenFiveHundred resultado={vista.resultadosManos[resumen]!} {lados} bando={mio} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.fiveHundred.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .contrato {
    font-weight: 700;
    color: var(--acento);
  }

  .puntos {
    color: var(--texto-suave);
  }

  .abiertas {
    display: inline-flex;
    flex-wrap: wrap;
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
