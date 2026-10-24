<script lang="ts">
  import type {
    AccionHoldem,
    Asiento,
    ConfigHoldem,
    EstadoHoldem,
    VistaHoldem,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado } from './bazas/asientos';
  import ResumenHoldem from './ResumenHoldem.svelte';

  interface Props {
    sesion: SesionMesa<ConfigHoldem, EstadoHoldem, AccionHoldem, VistaHoldem>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver las cartas del showdown antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 700 * FACTOR_PAUSAS;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);
  const rivales = $derived(Array.from({ length: n }, (_, a) => (yo + 1 + a) % n).slice(0, n - 1));

  // ── Acciones ───────────────────────────────────────────────────────────────

  let cerrando = $state(false);
  const miTurno = $derived(
    vista.turno === yo && sesion.fin === null && !sesion.bloqueada && !cerrando,
  );
  const puede = (tipo: AccionHoldem['tipo']) => legales.some((a) => a.tipo === tipo);
  const subidas = $derived(
    legales.flatMap((a) => (a.tipo === 'subir' ? [a.hasta] : [])),
  );
  const minimo = $derived(subidas[0] ?? 0);
  const maximo = $derived(subidas.at(-1) ?? 0);
  const aIgualar = $derived(Math.min(vista.apuestaMaxima - (vista.apuestas[yo] ?? 0), vista.fichas[yo] ?? 0));
  const bote = $derived(vista.aportado.reduce((s, x) => s + x, 0));

  let cantidad = $state(0);
  // Al cambiar las acciones posibles, la cantidad vuelve al mínimo legal.
  $effect(() => {
    cantidad = minimo;
  });
  const ajustar = (x: number) => (cantidad = Math.max(minimo, Math.min(maximo, Math.round(x))));
  /** Subir lo que hay en el bote después de igualar. */
  const subidaBote = (fraccion: number) => vista.apuestaMaxima + (bote + aIgualar) * fraccion;

  function jugar(accion: AccionHoldem | undefined) {
    if (accion) sesion.jugar(accion);
  }
  const subir = () => jugar(legales.find((a) => a.tipo === 'subir' && a.hasta === cantidad));

  const turnoTexto = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    return T.holdem.tuTurno;
  });

  const avisoRival = $derived.by(() => {
    const u = vista.ultimaAccion;
    if (u === null || u.asiento === yo) return null;
    return T.holdem.accion(nombre(u.asiento), u.tipo, u.cantidad);
  });

  const estado = (a: Asiento) => {
    if (vista.eliminados[a]) return T.holdem.eliminado;
    if (vista.retirados[a]) return T.holdem.retirado;
    if (vista.allIn[a]) return T.holdem.allIn;
    return '';
  };

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

<div class="holdem" class:muchos={n >= 5}>
  <p class="info" data-testid="info-mano">
    {T.holdem.mano(vista.numeroMano)} · {T.holdem.ciegas(vista.ciegas[0], vista.ciegas[1])}
  </p>

  <div class="rivales">
    {#each rivales as a (a)}
      <section
        class="puesto"
        class:activo={vista.turno === a && sesion.fin === null}
        class:fuera={vista.eliminados[a] || vista.retirados[a]}
        data-testid="puesto-{a}"
      >
        <header>
          <b>{nombre(a)}</b>
          {#if vista.boton === a}<span class="boton" title={T.holdem.botonTitulo}>D</span>{/if}
        </header>
        <div class="cartas-rival">
          {#each { length: vista.cartasEnMano[a] ?? 0 }, k (k)}
            <span class="mini"><Carta /></span>
          {/each}
        </div>
        <span class="fichas" data-testid="fichas-{a}">{T.holdem.fichas(vista.fichas[a] ?? 0)}</span>
        {#if (vista.apuestas[a] ?? 0) > 0}
          <span class="apuesta" data-testid="apuesta-{a}">{T.holdem.apuesta(vista.apuestas[a]!)}</span>
        {/if}
        {#if estado(a)}<span class="estado">{estado(a)}</span>{/if}
      </section>
    {/each}
  </div>

  <div class="centro">
    <div class="comunes" data-testid="comunes">
      {#each { length: 5 }, i (i)}
        {@const carta = vista.comunes[i]}
        <span class="naipe" class:hueco={!carta} data-carta={carta}>
          {#if carta}<Carta id={carta} />{/if}
        </span>
      {/each}
    </div>
    <p class="botes" data-testid="botes">
      {#each vista.botes as b, i (i)}
        <span>{i === 0 ? T.holdem.bote(b.cantidad) : T.holdem.boteN(i + 1, b.cantidad)}</span>
      {:else}
        <span>{T.holdem.bote(0)}</span>
      {/each}
    </p>
    {#if avisoRival}<p class="aviso" role="status" data-testid="aviso">{avisoRival}</p>{/if}
  </div>

  <section class="propio" class:activo={miTurno} data-testid="puesto-{yo}">
    <div class="estado-propio">
      <span class="nombre">{T.brisca.tu}</span>
      {#if vista.boton === yo}<span class="boton">D</span>{/if}
      <span data-testid="fichas-{yo}">{T.holdem.fichas(vista.fichas[yo] ?? 0)}</span>
      <span data-testid="apuesta-{yo}">{T.holdem.apuesta(vista.apuestas[yo] ?? 0)}</span>
      {#if estado(yo)}<span class="estado">{estado(yo)}</span>{/if}
    </div>
    <div class="mis-cartas" data-testid="mano">
      {#each vista.miMano ?? [] as carta (carta)}
        <span class="naipe grande" data-carta={carta}><Carta id={carta} /></span>
      {/each}
    </div>
    <p class="turno" role="status" data-testid="turno">{turnoTexto}</p>
    {#if miTurno}
      <div class="botones">
        <button data-testid="retirarse" onclick={() => jugar({ tipo: 'retirarse' })}>{T.holdem.retirarse}</button>
        {#if puede('pasar')}
          <button data-testid="pasar" onclick={() => jugar({ tipo: 'pasar' })}>{T.holdem.pasar}</button>
        {:else}
          <button data-testid="igualar" onclick={() => jugar({ tipo: 'igualar' })}>{T.holdem.igualar(aIgualar)}</button>
        {/if}
      </div>
      {#if subidas.length > 0}
        <div class="subir">
          {#if subidas.length > 1}
            <input
              type="range"
              min={minimo}
              max={maximo}
              step="1"
              bind:value={cantidad}
              data-testid="cantidad"
              aria-label={T.holdem.cantidad}
            />
          {/if}
          <div class="atajos">
            <button data-testid="atajo-minimo" onclick={() => ajustar(minimo)}>{T.holdem.minimo}</button>
            <button data-testid="atajo-medio" onclick={() => ajustar(subidaBote(0.5))}>{T.holdem.medioBote}</button>
            <button data-testid="atajo-bote" onclick={() => ajustar(subidaBote(1))}>{T.holdem.boteAtajo}</button>
            <button data-testid="atajo-allin" onclick={() => ajustar(maximo)}>{T.holdem.allInAtajo}</button>
          </div>
          <button class="principal" data-testid="subir" onclick={subir}>
            {vista.apuestaMaxima === 0 ? T.holdem.apostar(cantidad) : T.holdem.subir(cantidad)}
          </button>
        </div>
      {/if}
    {/if}
  </section>
</div>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.holdem.finMano(vista.resultadosManos[resumen]!.numeroMano)}</h2>
      <ResumenHoldem resultado={vista.resultadosManos[resumen]!} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.holdem.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .holdem {
    --ancho-carta: min(14vw, 8dvh, 64px);
    --ancho-mini: min(6vw, 3.6dvh, 26px);
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(100%, 760px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
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

  .puesto.activo,
  .propio.activo {
    outline: 2px solid var(--acento);
  }

  .puesto.fuera {
    opacity: 0.5;
  }

  header {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .boton {
    display: inline-grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 0.7rem;
    font-weight: 800;
    color: #2b2005;
    background: #f5f0e1;
  }

  .cartas-rival {
    display: flex;
    gap: 2px;
    min-height: calc(var(--ancho-mini) * 1.4);
  }

  .mini {
    display: block;
    width: var(--ancho-mini);
    aspect-ratio: 100 / 140;
  }

  .apuesta {
    color: var(--acento);
    font-weight: 700;
  }

  .estado {
    font-size: 0.75rem;
    color: var(--texto-suave);
  }

  .centro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
    justify-content: center;
  }

  .comunes {
    display: flex;
    gap: 4px;
  }

  .naipe {
    display: block;
    width: var(--ancho-carta);
    aspect-ratio: 100 / 140;
    border-radius: 7%;
  }

  .naipe.hueco {
    outline: 2px dashed rgb(255 255 255 / 0.18);
    outline-offset: -2px;
  }

  .botes {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px 12px;
    margin: 0;
    font-weight: 700;
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

  .mis-cartas {
    display: flex;
    gap: 6px;
  }

  .naipe.grande {
    width: calc(var(--ancho-carta) * 1.25);
  }

  .turno {
    margin: 0;
    min-height: 1.3em;
    font-weight: 600;
    text-align: center;
  }

  .botones,
  .atajos {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .subir {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    width: min(100%, 360px);
  }

  .atajos button {
    padding: 0.3rem 0.6rem;
    font-size: 0.85rem;
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
