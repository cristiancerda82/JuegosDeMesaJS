<script lang="ts">
  import {
    DENOMINACIONES_BRIDGE,
    MANOS_CICLO_BRIDGE,
    paloBridge,
    parejaBridge,
    rangoBridge,
    triunfoBridge,
    type AccionBridge,
    type Asiento,
    type ConfigBridge,
    type DeclaracionBridge,
    type EstadoBridge,
    type IdCarta,
    type VistaBridge,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenBridge from './ResumenBridge.svelte';

  interface Props {
    sesion: SesionMesa<ConfigBridge, EstadoBridge, AccionBridge, VistaBridge>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 4;
  const PALOS = ['picas', 'corazones', 'treboles', 'diamantes'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const mio = $derived(parejaBridge(yo));
  const lados: [string, string] = [T.brisca.nosotros, T.brisca.ellos];
  const triunfo = $derived(vista.contrato ? triunfoBridge(vista.contrato.denominacion) : null);

  const nombre = (asiento: Asiento) => nombreAsiento(asiento, JUGADORES, yo, sesion.red);
  const detalle = (asiento: Asiento) => {
    const marcas = [];
    if (asiento === vista.repartidor && vista.fase === 'subasta') marcas.push(T.bridge.reparte);
    if (vista.contrato?.declarante === asiento) marcas.push(T.bridge.declara);
    if (vista.contrato && vista.muerto === asiento) marcas.push(T.bridge.muerto);
    return marcas.join(' · ');
  };

  /** Por palos (el triunfo primero) y por valor. */
  const ordenar = (cartas: readonly IdCarta[]) => {
    const t = triunfo;
    const orden = t === null ? [...PALOS] : [t, ...PALOS.filter((p) => p !== t)];
    return [...cartas].sort(
      (a, b) => orden.indexOf(paloBridge(a)) - orden.indexOf(paloBridge(b)) || rangoBridge(b) - rangoBridge(a),
    );
  };

  /** Cuando juega por el muerto, las cartas jugables son las del muerto, no las suyas. */
  const accionDe = (carta: IdCarta) =>
    legales.find((a) => a.tipo === 'jugar' && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => !vista.juegaPorElMuerto && accionDe(carta) !== null;
  const jugableMuerto = (carta: IdCarta) => vista.juegaPorElMuerto && accionDe(carta) !== null;
  const jugar = (carta: IdCarta) => {
    const accion = accionDe(carta);
    if (accion) sesion.jugar(accion);
  };

  /** Le toca a quien elige: el declarante cuando juega el muerto. */
  const turnoDe = $derived(
    vista.turno !== null && vista.fase === 'carteo' && vista.contrato && vista.turno === vista.muerto
      ? vista.contrato.declarante
      : vista.turno,
  );

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    config: { jugadores: JUGADORES },
    miMano: ordenar(vista.miMano ?? []),
    turno: turnoDe,
    mazo: 0,
    muestra: null,
    resultadosManos: [],
  });

  const manoMuerto = $derived(vista.manoMuerto === null ? null : ordenar(vista.manoMuerto));

  // ── Subasta ────────────────────────────────────────────────────────────────

  const etiqueta = (d: DeclaracionBridge) => {
    if (d.tipo === 'pujar') return T.bridge.puja(d.nivel, d.denominacion);
    return d.tipo === 'pasar' ? T.bridge.pasar : d.tipo === 'doblar' ? T.bridge.doblar : T.bridge.redoblar;
  };

  /** Columnas de la subasta: desde el jugador hacia la izquierda. */
  const columnas = $derived([0, 1, 2, 3].map((k) => (yo + k) % JUGADORES));
  /** Filas de la subasta, con huecos antes del repartidor. */
  const filas = $derived.by(() => {
    const celdas: (DeclaracionBridge | null)[] = [];
    for (let k = 0; k < columnas.indexOf(vista.repartidor); k++) celdas.push(null);
    for (const d of vista.subasta) celdas.push(d.declaracion);
    const r: (DeclaracionBridge | null)[][] = [];
    for (let i = 0; i < celdas.length; i += JUGADORES) r.push(celdas.slice(i, i + JUGADORES));
    return r;
  });

  const pujando = $derived(
    vista.fase === 'subasta' && legales.length > 0 && sesion.fin === null && !sesion.bloqueada,
  );
  const pujasLegales = $derived(legales.filter((a) => a.tipo === 'pujar'));
  const nivelMinimo = $derived(
    Math.min(...pujasLegales.map((a) => (a.tipo === 'pujar' ? a.nivel : 8))),
  );
  /** Nivel elegido en la rejilla; por defecto, el más bajo que se puede pujar. */
  let nivel: number | null = $state(null);
  const nivelElegido = $derived(nivel !== null && nivel >= nivelMinimo ? nivel : nivelMinimo);
  const puedePujar = (nivel: number, denominacion: string) =>
    pujasLegales.some((a) => a.tipo === 'pujar' && a.nivel === nivel && a.denominacion === denominacion);
  const especiales = $derived(legales.filter((a) => a.tipo !== 'pujar' && a.tipo !== 'jugar'));

  const contratoTexto = $derived(
    vista.contrato
      ? T.bridge.contrato(
          `${T.bridge.puja(vista.contrato.nivel, vista.contrato.denominacion)}${T.bridge.doblado(vista.contrato.doblado)}`,
          nombre(vista.contrato.declarante),
        )
      : null,
  );

  const aviso = $derived.by(() => {
    if (sesion.fin !== null) return null;
    if (vista.repartoRepetido && vista.subasta.length === 0) return T.bridge.repartoRepetido;
    if (vista.juegaPorElMuerto && !sesion.bloqueada) return T.bridge.jugandoMuerto;
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
  {jugar}
  manoAbierta={(a) => (a === vista.muerto && a !== yo ? manoMuerto : null)}
  jugableAbierta={jugableMuerto}
  jugarAbierta={jugar}
  {nombre}
  {detalle}
  {aviso}
>
  {#snippet info()}
    <span data-testid="mano-ciclo">
      {T.bridge.mano((vista.manoDelCiclo % MANOS_CICLO_BRIDGE) + 1, MANOS_CICLO_BRIDGE)}
    </span>
    <span data-testid="vulnerabilidad">{T.bridge.vulnerables(vista.vulnerable[mio], vista.vulnerable[1 - mio]!)}</span>
    {#if contratoTexto}
      <span class="contrato" data-testid="contrato">{contratoTexto}</span>
      {#each [mio, 1 - mio] as p, i (p)}
        <span data-testid="bazas-pareja-{i}">{T.bridge.bazasPareja(lados[i]!, vista.bazas[p as 0 | 1])}</span>
      {/each}
    {/if}
    <span class="marcador" data-testid="marcador">{T.bridge.marcador(vista.puntos[mio], vista.puntos[1 - mio]!)}</span>
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if vista.fase === 'subasta' && sesion.fin === null}
      <div class="subasta" data-testid="subasta">
        <table>
          <thead>
            <tr>
              {#each columnas as a (a)}<th scope="col">{nombre(a)}</th>{/each}
            </tr>
          </thead>
          <tbody>
            {#each filas as fila, i (i)}
              <tr>
                {#each fila as d, j (j)}
                  <td class:pasa={d?.tipo === 'pasar'}>{d ? etiqueta(d) : ''}</td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
        {#if pujando}
          <div class="rejilla" aria-label={T.bridge.tuPuja}>
            {#each [1, 2, 3, 4, 5, 6, 7] as n (n)}
              <button
                type="button"
                class="nivel"
                class:elegido={n === nivelElegido}
                disabled={n < nivelMinimo}
                data-testid="nivel-{n}"
                onclick={() => (nivel = n)}>{n}</button
              >
            {/each}
          </div>
          <div class="rejilla denominaciones">
            {#each DENOMINACIONES_BRIDGE as d (d)}
              <button
                type="button"
                class="puja"
                class:roja={d === 'corazones' || d === 'diamantes'}
                disabled={!puedePujar(nivelElegido, d)}
                title={`${nivelElegido} ${T.bridge.denominacionLarga(d)}`}
                data-testid="puja-{nivelElegido}-{d}"
                onclick={() => {
                  cancelar();
                  sesion.jugar({ tipo: 'pujar', nivel: nivelElegido, denominacion: d });
                }}>{T.bridge.puja(nivelElegido, d)}</button
              >
            {/each}
          </div>
          <div class="especiales">
            {#each especiales as a (a.tipo)}
              <button
                type="button"
                class:principal={a.tipo !== 'pasar'}
                data-testid={a.tipo}
                onclick={() => {
                  cancelar();
                  sesion.jugar(a);
                }}>{etiqueta(a as DeclaracionBridge)}</button
              >
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.bridge.finMano(resumen + 1)}</h2>
      <ResumenBridge resultados={vista.resultadosManos} {lados} bando={mio} {nombre} destacar={resumen} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.bridge.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .contrato {
    font-weight: 700;
    color: var(--acento);
  }

  .marcador {
    color: var(--texto-suave);
  }

  .subasta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: min(100%, 420px);
    flex-basis: 100%;
  }

  .subasta table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    table-layout: fixed;
  }

  .subasta th {
    font-weight: 600;
    color: var(--texto-suave);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .subasta td {
    text-align: center;
    font-weight: 700;
  }

  .subasta td.pasa {
    font-weight: 400;
    color: var(--texto-suave);
  }

  .rejilla {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    width: 100%;
  }

  .rejilla.denominaciones {
    grid-template-columns: repeat(5, 1fr);
  }

  .nivel {
    min-height: 32px;
    padding: 2px;
    font-weight: 700;
  }

  .nivel.elegido {
    background: var(--acento);
    color: #2b2005;
  }

  .nivel:disabled {
    opacity: 0.35;
  }

  .puja {
    min-height: 32px;
    padding: 2px 4px;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .puja.roja {
    color: #d33;
  }

  .puja:disabled {
    opacity: 0.35;
  }

  .especiales {
    display: flex;
    gap: 6px;
  }

  .especiales button {
    min-height: 40px;
    padding: 4px 16px;
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
