<script lang="ts">
  import {
    bandoCasino,
    cartasRecogidas,
    recogidaCasino,
    type AccionCasino,
    type Asiento,
    type ConfigCasino,
    type EstadoCasino,
    type IdCarta,
    type VistaCasino,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import { Interaccion } from '../interaccion/interaccion.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import ManoPropia from './bazas/ManoPropia.svelte';
  import { nombreCasino, nombresBandoCasino } from './casino';
  import ResumenCasino from './ResumenCasino.svelte';

  interface Props {
    sesion: SesionMesa<ConfigCasino, EstadoCasino, AccionCasino, VistaCasino>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  // Los rivales en el orden de juego, empezando por el siguiente al jugador.
  const rivales = $derived(Array.from({ length: n - 1 }, (_, i) => (yo + i + 1) % n));
  const nombre = (asiento: Asiento) => nombreCasino(vista.config, asiento, yo, sesion.red);
  const nombres = $derived(nombresBandoCasino(vista.config, yo, sesion.red));
  const miBando = $derived(bandoCasino(vista.config, yo));
  // El bando del jugador, el primero.
  const bandos = $derived(
    nombres.map((_, b) => b).sort((a, b) => Number(b === miBando) - Number(a === miBando)),
  );
  const activo = (asiento: Asiento) => vista.turno === asiento && sesion.fin === null;

  // ── Jugadas de una carta ───────────────────────────────────────────────────

  const jugadasDe = (carta: IdCarta | null) =>
    carta === null ? [] : legales.filter((a) => a.carta === carta);
  const jugable = (carta: IdCarta) => jugadasDe(carta).length > 0;

  /** Carta soltada en la mesa con varias jugadas: su panel sigue abierto. */
  let soltada: IdCarta | null = $state(null);
  /** Jugada del panel que se está mirando: sus cartas de la mesa se resaltan. */
  let mirada = $state(0);

  function jugar(accion: AccionCasino) {
    soltada = null;
    mirada = 0;
    interaccion.cancelar();
    sesion.jugar(accion);
  }

  const interaccion = new Interaccion({
    destinos: (carta) => (jugable(carta as IdCarta) ? ['mesa'] : []),
    destinoObvio: (carta) => (jugadasDe(carta as IdCarta).length === 1 ? 'mesa' : null),
    mover(carta, destino) {
      if (destino !== 'mesa') return;
      const jugadas = jugadasDe(carta as IdCarta);
      if (jugadas.length === 1) jugar(jugadas[0]!);
      else if (jugadas.length > 1) soltada = carta as IdCarta;
    },
    elementos: (_carta, nodo) => [nodo],
  });

  const elegida = $derived((interaccion.seleccion as IdCarta | null) ?? soltada);
  const jugadas = $derived(jugadasDe(elegida));
  $effect(() => {
    if (interaccion.seleccion !== null) soltada = null;
  });
  $effect(() => {
    void elegida;
    mirada = 0;
  });

  /** Lo que usa de la mesa una jugada: cartas sueltas y construcciones (como `c<id>`). */
  function usa(accion: AccionCasino): Set<string> {
    if (accion.tipo === 'recoger') {
      const r = recogidaCasino(vista.mesa, accion.carta);
      return new Set([...(r?.sueltas ?? []), ...(r?.construcciones ?? []).map((id) => `c${id}`)]);
    }
    if (accion.tipo === 'construir') {
      return new Set([
        ...accion.cartas,
        ...(accion.construccion === null ? [] : [`c${accion.construccion}`]),
      ]);
    }
    return new Set();
  }
  const resaltadas = $derived.by(() => {
    const jugada = jugadas[mirada];
    return jugada ? usa(jugada) : new Set<string>();
  });

  function etiqueta(accion: AccionCasino): string {
    if (accion.tipo === 'recoger') {
      const r = recogidaCasino(vista.mesa, accion.carta);
      return T.casino.recoger(r ? cartasRecogidas(vista.mesa, r).length + 1 : 1);
    }
    if (accion.tipo === 'dejar') return T.casino.dejar;
    if (accion.construccion === null) return T.casino.construir(accion.valor);
    const base = vista.mesa.find(
      (el) => el.tipo === 'construccion' && el.id === accion.construccion,
    );
    return base?.tipo === 'construccion' && base.valor === accion.valor
      ? T.casino.hacerMultiple(accion.valor)
      : T.casino.subir(accion.valor);
  }

  // ── Turno y avisos ─────────────────────────────────────────────────────────

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (sesion.bloqueada) return '';
    return vista.turno === yo ? T.casino.tuTurno : T.brisca.turnoDe(nombre(vista.turno));
  });

  const aviso = $derived.by(() => {
    const hecha = vista.ultimaAccion;
    if (hecha === null || sesion.fin !== null) return null;
    const quien = nombre(hecha.asiento);
    const a = hecha.accion;
    if (a.tipo === 'recoger') {
      return hecha.barrida ? T.casino.barrida(quien) : T.casino.recoge(quien, hecha.recogidas.length + 1);
    }
    if (a.tipo === 'construir') return T.casino.construye(quien, a.valor);
    return T.casino.deja(quien, nombreCarta(a.carta).toLowerCase());
  });

  // ── Resumen al terminar cada mano ──────────────────────────────────────────

  let resultado: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      resultado = total - 1;
      sesion.pausar();
    }
    manosVistas = total;
  });

  function siguienteMano() {
    resultado = null;
    sesion.reanudar();
  }

  // ── Animación ──────────────────────────────────────────────────────────────

  let raiz: HTMLElement | undefined = $state();
  let previas: Posiciones = new Map();
  $effect.pre(() => {
    void vista;
    if (raiz) previas = medir(raiz);
  });
  $effect(() => {
    void vista;
    if (raiz) animar(raiz, previas);
  });
</script>

<div class="casino" bind:this={raiz} style:--en-mano={Math.max(1, vista.miMano?.length ?? 1)}>
  <div class="marcador">
    {#each bandos as b (b)}
      <span data-testid="bando-{b}">
        <b>{nombres[b]}</b>
        {T.casino.puntos(vista.puntos[b] ?? 0)} ·
        <span data-testid="recogidas-{b}">{T.casino.recogidas(vista.recogidas[b]?.length ?? 0)}</span>
        {#if (vista.barridas[b] ?? 0) > 0}
          · <b class="barridas">{T.casino.barridas(vista.barridas[b]!)}</b>
        {/if}
      </span>
    {/each}
  </div>

  <div class="rivales">
    {#each rivales as asiento (asiento)}
      <div class="rival" class:activo={activo(asiento)} data-testid="asiento-{asiento}" data-zona="mano-{asiento}">
        <span class="dorso"><Carta /></span>
        <span class="datos">
          <b>{nombre(asiento)}</b>
          <small data-testid="cartas-{asiento}">{T.casino.cartas(vista.cartasEnMano[asiento] ?? 0)}</small>
        </span>
      </div>
    {/each}
  </div>

  <div class="centro">
    {#if vista.mazo > 0}
      <div class="mazo" data-zona="mazo">
        <Carta />
        <span
          class="cuenta"
          data-testid="cartas-mazo"
          title={T.brisca.enMazo(vista.mazo)}
          aria-label={T.brisca.enMazo(vista.mazo)}>{vista.mazo}</span
        >
      </div>
    {/if}

    <div
      class="mesa"
      class:legal={interaccion.resaltados.has('mesa')}
      data-destino="mesa"
      data-testid="mesa"
      aria-label={T.casino.mesa}
      role="button"
      tabindex="-1"
      onclick={() => interaccion.tocarDestino('mesa')}
      onkeydown={() => {}}
    >
      {#each vista.mesa as el (el.tipo === 'carta' ? el.carta : `c${el.id}`)}
        {#if el.tipo === 'carta'}
          <div
            class="carta-mesa"
            class:resaltada={resaltadas.has(el.carta)}
            data-carta={el.carta}
            data-testid="mesa-{el.carta}"
          >
            <Carta id={el.carta} />
          </div>
        {:else}
          <div
            class="construccion"
            class:resaltada={resaltadas.has(`c${el.id}`)}
            class:mia={el.duenio === yo}
            data-testid="construccion-{el.id}"
            aria-label={T.casino.construccion(el.valor)}
            style:--en-monton={el.cartas.length}
            style:--paso={el.cartas.length > 1 ? Math.min(0.22, 1 / (el.cartas.length - 1)) : 0}
          >
            <div class="monton">
              {#each el.cartas as id, i (id)}
                <div class="en-monton" style:--i={i} data-carta={id}><Carta {id} /></div>
              {/each}
            </div>
            <span class="rotulo">
              <b data-testid="valor-{el.id}">{el.valor}</b>
              {T.casino.de(nombre(el.duenio))}{el.multiple ? ` · ${T.casino.multiple}` : ''}
            </span>
          </div>
        {/if}
      {/each}
    </div>
  </div>

  {#if aviso}
    <p class="aviso" role="status" data-testid="aviso">{aviso}</p>
  {/if}

  <div class="propio" class:activo={activo(yo)}>
    <div class="estado">
      <span class="nombre">{T.brisca.tu}</span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
    </div>
    {#if elegida !== null && jugadas.length > 0}
      <div class="jugadas" data-testid="jugadas">
        {#each jugadas as jugada, i (i)}
          <button
            class:principal={jugada.tipo === 'recoger'}
            class:mirada={i === mirada}
            data-testid="jugada-{i}"
            data-tipo={jugada.tipo}
            onpointerenter={() => (mirada = i)}
            onfocus={() => (mirada = i)}
            onclick={() => jugar(jugada)}>{etiqueta(jugada)}</button
          >
        {/each}
      </div>
    {/if}
    <ManoPropia cartas={vista.miMano ?? []} {jugable} {interaccion} />
  </div>
</div>

{#if resultado !== null && vista.resultadosManos[resultado]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.casino.finMano(resultado + 1)}</h2>
      <ResumenCasino resultado={vista.resultadosManos[resultado]!} {nombres} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.casino.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .casino {
    --ancho-mesa: min(14vw, 9dvh, 76px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .marcador {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px 14px;
    color: var(--texto-suave);
    font-size: 0.85rem;
  }

  .marcador b {
    color: var(--texto);
  }

  .marcador .barridas {
    color: var(--acento);
  }

  .rivales {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .rival {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px 4px 4px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.2);
  }

  .rival.activo {
    background: var(--acento);
    color: #2b2005;
  }

  .rival .dorso {
    width: 26px;
    aspect-ratio: 100 / 140;
  }

  .datos {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }

  .datos small {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .centro {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 2vw, 16px);
    width: 100%;
    min-width: 0;
  }

  .mazo {
    position: relative;
    flex: none;
    width: calc(var(--ancho-mesa) * 0.8);
    aspect-ratio: 100 / 140;
  }

  .cuenta {
    position: absolute;
    right: 3px;
    bottom: 3px;
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    background: rgb(0 0 0 / 0.55);
  }

  .mesa {
    flex: 1;
    min-width: 0;
    min-height: calc(var(--ancho-mesa) * 1.4 * 2 + 40px);
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    align-items: flex-start;
    justify-content: center;
    gap: 8px 6px;
    padding: 10px;
    border-radius: 18px;
    background: rgb(0 0 0 / 0.12);
    outline: 2px dashed rgb(255 255 255 / 0.15);
    outline-offset: -2px;
  }

  .mesa.legal {
    outline: 3px solid var(--resalte);
    box-shadow: 0 0 18px rgb(255 224 102 / 0.45);
  }

  .carta-mesa {
    flex: none;
    width: var(--ancho-mesa);
    aspect-ratio: 100 / 140;
    border-radius: 7%;
    transition: translate 120ms;
  }

  .resaltada {
    outline: 3px solid var(--resalte);
    outline-offset: 1px;
    translate: 0 -4px;
    box-shadow: 0 0 14px rgb(255 224 102 / 0.6);
  }

  .construccion {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 3px;
    border-radius: 10px;
    background: rgb(0 0 0 / 0.22);
    transition: translate 120ms;
  }

  .construccion.mia {
    background: rgb(255 224 102 / 0.16);
  }

  .monton {
    position: relative;
    /* Cada carta del montón asoma un 22 % (o menos, si son muchas) por debajo de la siguiente. */
    width: calc(var(--ancho-mesa) * (1 + var(--paso) * (var(--en-monton) - 1)));
    height: calc(var(--ancho-mesa) * 1.4);
  }

  .en-monton {
    position: absolute;
    top: 0;
    left: calc(var(--ancho-mesa) * var(--paso) * var(--i));
    width: var(--ancho-mesa);
    aspect-ratio: 100 / 140;
  }

  .rotulo {
    font-size: 0.72rem;
    line-height: 1.1;
    white-space: nowrap;
  }

  .rotulo b {
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.85rem;
    background: var(--acento);
    color: #2b2005;
  }

  .aviso {
    margin: 0;
    padding: 4px 12px;
    border-radius: 14px;
    font-size: 0.9rem;
    font-weight: 600;
    background: rgb(0 0 0 / 0.3);
  }

  .propio {
    /* La mano entera cabe: cada carta deja a la vista al menos un 30 % de su ancho. */
    --ancho-carta: min(19vw, 13dvh, 96px, calc((100vw - 24px) / (0.3 * (var(--en-mano) - 1) + 1)));
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
    margin-top: auto;
  }

  .estado {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 12px;
    min-height: 36px;
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
    font-weight: 600;
  }

  .jugadas {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .jugadas button.mirada {
    outline: 2px solid var(--resalte);
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
    width: min(100%, 440px);
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    padding: 18px 12px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.2rem;
    margin-bottom: 6px;
  }

  .dialogo > button {
    margin-top: 14px;
    width: 100%;
  }
</style>
