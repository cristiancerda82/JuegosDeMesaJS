<script lang="ts">
  import {
    compararCulo,
    MANOS_CULO,
    rangoCulo,
    type AccionCulo,
    type Asiento,
    type ConfigCulo,
    type EstadoCulo,
    type IdCarta,
    type VistaCulo,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado } from './bazas/asientos';
  import ResumenCulo from './ResumenCulo.svelte';

  interface Props {
    sesion: SesionMesa<ConfigCulo, EstadoCulo, AccionCulo, VistaCulo>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última jugada antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 700 * FACTOR_PAUSAS;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);
  const rivales = $derived(Array.from({ length: n }, (_, a) => (yo + 1 + a) % n).slice(0, n - 1));
  const mano = $derived(vista.miMano ?? []);

  let cerrando = $state(false);
  const miTurno = $derived(
    vista.turno === yo && sesion.fin === null && !sesion.bloqueada && !cerrando,
  );

  // ── Selección de cartas ────────────────────────────────────────────────────

  let marcadas: IdCarta[] = $state([]);
  // Cada vez que cambia la mesa o el turno, la selección se vacía.
  $effect(() => {
    void vista.jugadas.length;
    void vista.turno;
    void vista.fase;
    void vista.numeroMano;
    marcadas = [];
  });

  /** En el intercambio, cuántas cartas devuelve; si no, `null`. */
  const aDevolver = $derived.by(() => {
    if (vista.fase !== 'intercambio') return null;
    const a = legales.find((x) => x.tipo === 'devolver');
    return a && a.tipo === 'devolver' ? a.cartas.length : null;
  });

  function tocar(c: IdCarta) {
    if (!miTurno) return;
    if (marcadas.includes(c)) {
      // Al superar, se desmarca el grupo entero; si no, solo esa carta.
      marcadas = vista.mesa !== null && aDevolver === null ? [] : marcadas.filter((x) => x !== c);
      return;
    }
    if (aDevolver !== null) {
      marcadas = [...marcadas, c].slice(-aDevolver);
      return;
    }
    const iguales = mano.filter((x) => rangoCulo(x) === rangoCulo(c) && x !== c);
    if (vista.mesa !== null) {
      // Marca también otras de su valor hasta el número que pide la ronda.
      marcadas = [c, ...iguales].slice(0, vista.mesa.cartas.length);
      return;
    }
    const mismoValor = marcadas.every((x) => rangoCulo(x) === rangoCulo(c));
    marcadas = mismoValor ? [...marcadas, c] : [c];
  }

  const clave = (cartas: readonly IdCarta[]) => [...cartas].sort(compararCulo).join(',');
  /** La acción legal que hacen las cartas marcadas, si la hay. */
  const accionMarcada = $derived(
    marcadas.length === 0
      ? undefined
      : legales.find((a) => a.tipo !== 'pasar' && clave(a.cartas) === clave(marcadas)),
  );
  const puedePasar = $derived(legales.some((a) => a.tipo === 'pasar'));

  function hacer() {
    if (accionMarcada) sesion.jugar(accionMarcada);
  }

  // ── Textos ─────────────────────────────────────────────────────────────────

  const turnoTexto = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    if (aDevolver !== null) return T.culo.eligeDevolver(aDevolver);
    if (vista.mesa === null) return T.culo.tuTurnoAbrir;
    return T.culo.tuTurnoSuperar(vista.mesa.cartas.length);
  });

  const avisoRival = $derived.by(() => {
    const u = vista.ultimaAccion;
    if (u === null || u.asiento === yo) return null;
    return T.culo.accion(nombre(u.asiento), u.tipo, u.cartas.length, u.tipo === 'jugar' && u.limpia);
  });

  /** Lo que se ve en el centro cuando la ronda está limpia: la última jugada, si la cortó. */
  const ultimaJugada = $derived(vista.jugadas.at(-1) ?? null);

  const cargo = (a: Asiento) => (vista.cargos ? T.culo.cargos[vista.cargos[a]!] : '');
  const puesto = (a: Asiento) => vista.salidos.indexOf(a);

  /** Lo que el jugador dio y recibió en el intercambio de esta mano. */
  const misCambios = $derived(vista.misIntercambios);

  // ── Resumen al terminar cada mano ──────────────────────────────────────────

  let resumen: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  let espera: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      sesion.pausar();
      cerrando = true;
      espera = setTimeout(() => (resumen = total - 1), ESPERA_RESUMEN_MS);
    }
    manosVistas = total;
  });
  $effect(() => () => {
    if (espera !== null) clearTimeout(espera);
  });

  function siguienteMano() {
    resumen = null;
    cerrando = false;
    sesion.reanudar();
  }
</script>

<div class="culo" class:muchos={n >= 5}>
  <p class="info" data-testid="info-mano">{T.culo.mano(vista.numeroMano, MANOS_CULO)}</p>

  <div class="rivales">
    {#each rivales as a (a)}
      <section
        class="puesto"
        class:activo={vista.turno === a && sesion.fin === null}
        class:fuera={puesto(a) >= 0}
        data-testid="puesto-{a}"
      >
        <b class="nombre-rival">{nombre(a)}</b>
        {#if cargo(a)}<span class="cargo" data-testid="cargo-{a}">{cargo(a)}</span>{/if}
        <span class="dorso">
          <Carta />
          <span class="cuenta" data-testid="cartas-{a}">{vista.cartasEnMano[a]}</span>
        </span>
        {#if puesto(a) >= 0}
          <span class="estado">{T.culo.puesto(puesto(a) + 1)}</span>
        {:else if vista.pasados.includes(a)}
          <span class="estado">{T.culo.pasa}</span>
        {/if}
      </section>
    {/each}
  </div>

  <div class="centro">
    {#if vista.fase === 'intercambio'}
      {@const pendiente = vista.intercambios.find((x) => !x.hecho)}
      <div class="intercambio" data-testid="intercambio">
        {#if pendiente && pendiente.recibe !== yo}
          <p>{T.culo.esperaDevolver(nombre(pendiente.recibe))}</p>
        {/if}
        {#each misCambios as x (x.da)}
          <p>{x.recibe === yo ? T.culo.hasRecibido : T.culo.hasDado}</p>
          <div class="abanico pequeno">
            {#each x.dadas as c (c)}<span class="naipe" data-carta={c}><Carta id={c} /></span>{/each}
          </div>
        {/each}
      </div>
    {:else}
      <div class="mesa" data-testid="mesa">
        {#if vista.mesa}
          <div class="abanico">
            {#each vista.mesa.cartas as c (c)}<span class="naipe" data-carta={c}><Carta id={c} /></span>{/each}
          </div>
          <p class="autor">{T.culo.deQuien(nombre(vista.mesa.asiento))}</p>
        {:else}
          {#if ultimaJugada && vista.ultimaAccion?.limpia}
            <div class="abanico apagado">
              {#each ultimaJugada.cartas as c (c)}<span class="naipe"><Carta id={c} /></span>{/each}
            </div>
          {:else}
            <div class="hueco"></div>
          {/if}
          {#if vista.turno !== null && sesion.fin === null}
            <p class="autor">{T.culo.abre(nombre(vista.turno))}</p>
          {/if}
        {/if}
      </div>
    {/if}
    {#if avisoRival}<p class="aviso" role="status" data-testid="aviso">{avisoRival}</p>{/if}
  </div>

  <section class="propio" class:activo={miTurno} data-testid="puesto-{yo}">
    <div class="estado-propio">
      <span class="nombre">{T.brisca.tu}</span>
      {#if cargo(yo)}<span class="cargo" data-testid="cargo-{yo}">{cargo(yo)}</span>{/if}
      {#if puesto(yo) >= 0}<span>{T.culo.puesto(puesto(yo) + 1)}</span>{/if}
      {#if vista.pasados.includes(yo)}<span>{T.culo.pasa}</span>{/if}
    </div>
    <p class="turno" role="status" data-testid="turno">{turnoTexto}</p>
    {#if miTurno}
      <div class="botones">
        {#if aDevolver !== null}
          <button class="principal" data-testid="devolver" disabled={!accionMarcada} onclick={hacer}>
            {T.culo.devolver(aDevolver)}
          </button>
        {:else}
          {#if puedePasar}
            <button data-testid="pasar" onclick={() => sesion.jugar({ tipo: 'pasar' })}>{T.culo.pasar}</button>
          {/if}
          <button class="principal" data-testid="jugar" disabled={!accionMarcada} onclick={hacer}>
            {T.culo.jugar}
          </button>
        {/if}
      </div>
    {/if}
    <div class="mano" data-testid="mano">
      {#each mano as c (c)}
        <button
          class="carta-mano"
          class:seleccionada={marcadas.includes(c)}
          data-testid="mano-{c}"
          data-carta={c}
          aria-pressed={marcadas.includes(c)}
          disabled={!miTurno}
          onclick={() => tocar(c)}
        >
          <Carta id={c} />
        </button>
      {/each}
    </div>
  </section>
</div>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.culo.finMano(resumen + 1)}</h2>
      <ResumenCulo resultado={vista.resultadosManos[resumen]!} numero={resumen + 1} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.culo.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .culo {
    --ancho-carta: min(15vw, 9dvh, 70px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-mini: min(7vw, 4.5dvh, 30px);
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(100%, 760px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    user-select: none;
    -webkit-user-select: none;
  }

  .info {
    margin: 0;
    text-align: center;
    font-size: 0.85rem;
    color: var(--texto-suave);
  }

  .rivales {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    gap: 6px;
  }

  .muchos .rivales {
    grid-template-columns: repeat(auto-fit, minmax(62px, 1fr));
  }

  .puesto {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 4px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.18);
    font-size: 0.82rem;
    min-width: 0;
  }

  .nombre-rival {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .puesto.activo,
  .propio.activo {
    outline: 2px solid var(--acento);
  }

  .puesto.fuera {
    opacity: 0.55;
  }

  .cargo {
    padding: 0 6px;
    border-radius: 8px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #2b2005;
    background: var(--acento);
  }

  .dorso {
    position: relative;
    display: block;
    width: var(--ancho-mini);
    aspect-ratio: 100 / 140;
  }

  .cuenta {
    position: absolute;
    right: -6px;
    bottom: -4px;
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    background: rgb(0 0 0 / 0.65);
  }

  .estado {
    font-size: 0.75rem;
    color: var(--texto-suave);
  }

  .centro {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 1;
    text-align: center;
  }

  .mesa,
  .intercambio {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .intercambio p {
    margin: 0;
  }

  .abanico {
    display: flex;
    gap: 4px;
  }

  .abanico.apagado {
    opacity: 0.45;
  }

  .naipe {
    display: block;
    width: var(--ancho-carta);
    aspect-ratio: 100 / 140;
  }

  .pequeno .naipe {
    width: calc(var(--ancho-carta) * 0.7);
  }

  .hueco {
    width: var(--ancho-carta);
    height: var(--alto-carta);
    border-radius: 7%;
    outline: 2px dashed rgb(255 255 255 / 0.2);
    outline-offset: -2px;
  }

  .autor {
    margin: 0;
    font-size: 0.9rem;
  }

  .aviso {
    margin: 0;
    padding: 4px 12px;
    border-radius: 14px;
    font-size: 0.9rem;
    background: rgb(0 0 0 / 0.35);
  }

  .propio {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 8px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.12);
  }

  .estado-propio {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 2px 10px;
    font-size: 0.9rem;
  }

  .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: rgb(0 0 0 / 0.2);
  }

  .activo .nombre {
    background: var(--acento);
    color: #2b2005;
  }

  .turno {
    margin: 0;
    min-height: 1.3em;
    font-weight: 600;
    text-align: center;
  }

  .botones {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .mano {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 6px;
    width: 100%;
    padding: 10px calc(var(--ancho-carta) * 0.55) 0 0;
  }

  .carta-mano {
    position: relative;
    width: calc(var(--ancho-carta) * 0.45);
    height: var(--alto-carta);
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    transition: translate 120ms;
  }

  .carta-mano:disabled {
    opacity: 1;
    cursor: default;
  }

  .carta-mano :global(.carta) {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--ancho-carta);
    height: var(--alto-carta);
  }

  .carta-mano.seleccionada {
    translate: 0 -10px;
  }

  .carta-mano.seleccionada :global(.carta) {
    outline: 3px solid var(--resalte);
    border-radius: 7%;
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
    font-size: 1.15rem;
    margin-bottom: 6px;
  }

  .dialogo > button {
    margin-top: 12px;
    width: 100%;
  }
</style>
