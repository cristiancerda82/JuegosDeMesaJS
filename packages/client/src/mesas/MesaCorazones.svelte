<script lang="ts">
  import type {
    AccionCorazones,
    Asiento,
    ConfigCorazones,
    EstadoCorazones,
    IdCarta,
    VistaCorazones,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { nombreNumerado } from './bazas/asientos';
  import { T } from '../textos';
  import type { VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';

  interface Props {
    sesion: SesionMesa<ConfigCorazones, EstadoCorazones, AccionCorazones, VistaCorazones>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 4;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'jugar' && a.carta === carta);
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, JUGADORES, sesion.asiento, sesion.red, T.corazones.rivalN);
  const detalle = (asiento: Asiento) =>
    T.corazones.detalle(vista.puntosMano[asiento] ?? 0, vista.totales[asiento] ?? 0);

  /** A quién pasa el jugador y de quién recibe en esta mano. */
  const destinatario = $derived((sesion.asiento + vista.direccionPase) % JUGADORES);
  const remitente = $derived((sesion.asiento - vista.direccionPase + JUGADORES) % JUGADORES);

  /** La mano ordenada por palo y valor (en la mesa y en el pase). */
  const ORDEN_PALOS = ['treboles', 'diamantes', 'picas', 'corazones'];
  const rango = (c: IdCarta) => {
    const v = Number(c.split('-')[1]);
    return v === 1 ? 14 : v;
  };
  const manoOrdenada = $derived(
    [...(vista.miMano ?? [])].sort(
      (a, b) =>
        ORDEN_PALOS.indexOf(a.split('-')[0]!) - ORDEN_PALOS.indexOf(b.split('-')[0]!) ||
        rango(a) - rango(b),
    ),
  );

  /**
   * La mano, ordenada por palo y valor; la última baza de la mano anterior se sigue viendo
   * hasta que alguien pasa.
   */
  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    config: { jugadores: JUGADORES },
    mazo: 0,
    muestra: null,
    bazas: [0, 0, 0, 0],
    ultimaBaza:
      vista.fase === 'pase' && vista.pasaron.some(Boolean) ? null : vista.ultimaBaza,
    resultadosManos: [],
  });

  // ── Pase ───────────────────────────────────────────────────────────────────

  const puedoPasar = $derived(legales.some((a) => a.tipo === 'pasar'));
  let marcadas: IdCarta[] = $state([]);
  $effect(() => {
    if (!puedoPasar) marcadas = [];
  });

  function marcar(id: IdCarta) {
    if (marcadas.includes(id)) marcadas = marcadas.filter((c) => c !== id);
    else if (marcadas.length < 3) marcadas = [...marcadas, id];
  }

  function pasar() {
    const clave = [...marcadas].sort().join();
    const accion = legales.find(
      (a) => a.tipo === 'pasar' && [...a.cartas].sort().join() === clave,
    );
    if (accion) sesion.jugar(accion);
  }

  // ── Cartas recibidas ───────────────────────────────────────────────────────

  const recibidas = $derived(
    vista.recibidas !== null && vista.recibidas.length > 0 && vista.mesa.length === 0
      ? vista.recibidas
      : null,
  );
  const aviso = $derived(recibidas ? T.corazones.recibes(nombre(remitente)) : null);

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
  jugar={(carta) => sesion.jugar({ tipo: 'jugar', carta })}
  {aviso}
  {nombre}
  {detalle}
>
  {#snippet info()}
    <span data-testid="mano-corazones">{T.corazones.mano(vista.numeroMano + 1)}</span>
    <span>
      {vista.direccionPase === 0 ? T.corazones.sinPase : T.corazones.pasasA(nombre(destinatario))}
    </span>
    {#if vista.rotos}
      <span class="rotos" data-testid="rotos">♥ {T.corazones.rotos}</span>
    {/if}
  {/snippet}

  {#snippet detalleAviso()}
    {#if recibidas}
      <span class="recibidas" data-testid="recibidas">
        {#each recibidas as id (id)}
          <span class="mini"><Carta {id} /></span>
        {/each}
      </span>
    {/if}
  {/snippet}
</MesaBazas>

{#if vista.fase === 'pase' && sesion.fin === null && resumen === null}
  <div class="velo pase">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="titulo-pase" data-testid="panel-pase">
      {#if puedoPasar}
        <h2 id="titulo-pase">{T.corazones.elige(nombre(destinatario))}</h2>
        <div class="cartas-pase">
          {#each manoOrdenada as id (id)}
            <button
              class="carta-pase"
              class:marcada={marcadas.includes(id)}
              data-testid="pase-{id}"
              aria-pressed={marcadas.includes(id)}
              onclick={() => marcar(id)}
            >
              <Carta {id} />
            </button>
          {/each}
        </div>
        <button class="principal" data-testid="pasar" disabled={marcadas.length !== 3} onclick={pasar}>
          {T.corazones.pasar(marcadas.length, nombre(destinatario))}
        </button>
      {:else}
        <h2 id="titulo-pase">{T.corazones.esperando}</h2>
        {#if vista.miPase}
          <div class="cartas-pase">
            {#each vista.miPase as id (id)}
              <span class="carta-pase"><Carta {id} /></span>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </div>
{/if}

{#if resumen !== null && vista.resultadosManos[resumen]}
  {@const r = vista.resultadosManos[resumen]!}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.corazones.finMano(resumen + 1)}</h2>
      {#if r.luna !== null}
        <p class="luna" data-testid="luna">{T.corazones.luna(nombre(r.luna))}</p>
      {/if}
      <table>
        <thead>
          <tr>
            <th scope="col">{T.corazones.jugador}</th>
            <th scope="col">{T.corazones.puntosMano}</th>
            <th scope="col">{T.corazones.total}</th>
          </tr>
        </thead>
        <tbody>
          {#each r.puntos as puntos, a (a)}
            <tr data-testid="fila-{a}">
              <th scope="row">{nombre(a)}</th>
              <td data-testid="puntos-mano-{a}">{puntos}</td>
              <td>{r.totalesTras[a]}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <p class="nota">{T.corazones.finPartida(vista.config.fin)}</p>
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.corazones.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .rotos {
    font-weight: 700;
    color: #ff8f8f;
  }

  .recibidas {
    display: inline-flex;
    gap: 2px;
  }

  .mini {
    display: block;
    width: 26px;
    aspect-ratio: 100 / 140;
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

  /* El pase deja libre la cabecera: el menú y la guía siguen a mano. */
  .velo.pase {
    top: 60px;
  }

  .dialogo {
    width: min(100%, 460px);
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    padding: 16px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.1rem;
    margin-bottom: 10px;
  }

  .cartas-pase {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px 4px;
  }

  .carta-pase {
    display: block;
    width: min(16vw, 58px);
    aspect-ratio: 100 / 140;
    padding: 0;
    border: none;
    border-radius: 7%;
    background: none;
    transition: translate 120ms;
  }

  .carta-pase.marcada {
    translate: 0 -8px;
    outline: 3px solid var(--resalte);
  }

  .dialogo > button {
    margin-top: 14px;
    width: 100%;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 4px 6px;
  }

  thead th {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--texto-suave);
  }

  tbody th {
    text-align: left;
    font-weight: 500;
  }

  .luna {
    margin: 0 0 8px;
    font-weight: 800;
    color: var(--acento);
  }

  .nota {
    margin: 8px 0 0;
    font-size: 0.85rem;
    color: var(--texto-suave);
  }
</style>
