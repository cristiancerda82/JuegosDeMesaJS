<script lang="ts">
  import {
    esEsquinaKings,
    type AccionKingsCorner,
    type ConfigKingsCorner,
    type EstadoKingsCorner,
    type IdCarta,
    type VistaKingsCorner,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado } from './bazas/asientos';

  interface Props {
    sesion: SesionMesa<ConfigKingsCorner, EstadoKingsCorner, AccionKingsCorner, VistaKingsCorner>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const n = $derived(vista.config.jugadores);
  const nombre = (asiento: number) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);
  const rivales = $derived(Array.from({ length: n - 1 }, (_, k) => (yo + 1 + k) % n));

  /** La cruz en una rejilla de 3 × 3: esquinas, laterales y el mazo en el centro. */
  const REJILLA: (number | 'mazo')[] = [4, 0, 5, 3, 'mazo', 1, 7, 2, 6];

  // ── Selección de origen y destino ──────────────────────────────────────────

  type Origen = { tipo: 'carta'; carta: IdCarta; indice: number } | { tipo: 'pila'; pila: number };
  let origen: Origen | null = $state(null);
  $effect(() => {
    if (!miTurno) origen = null;
  });

  const accionesDe = (o: Origen) =>
    legales.filter((a) =>
      o.tipo === 'carta'
        ? a.tipo === 'jugar' && a.carta === o.carta
        : a.tipo === 'mover' && a.desde === o.pila,
    );
  const destinoDe = (a: AccionKingsCorner) =>
    a.tipo === 'jugar' ? a.pila : a.tipo === 'mover' ? a.a : -1;
  const accionHacia = (pila: number) =>
    origen === null ? null : (accionesDe(origen).find((a) => destinoDe(a) === pila) ?? null);
  const puedeCarta = (carta: IdCarta) =>
    miTurno && legales.some((a) => a.tipo === 'jugar' && a.carta === carta);
  const puedePila = (pila: number) =>
    miTurno && legales.some((a) => a.tipo === 'mover' && a.desde === pila);

  function hacer(accion: AccionKingsCorner | null) {
    if (accion === null) return;
    origen = null;
    sesion.jugar(accion);
  }

  function tocarPila(pila: number) {
    const accion = accionHacia(pila);
    if (accion) return hacer(accion);
    if (puedePila(pila)) {
      origen = origen?.tipo === 'pila' && origen.pila === pila ? null : { tipo: 'pila', pila };
    }
  }

  function tocarCarta(carta: IdCarta, indice: number) {
    if (!puedeCarta(carta)) return;
    origen =
      origen?.tipo === 'carta' && origen.indice === indice ? null : { tipo: 'carta', carta, indice };
  }

  const pasar = $derived(legales.find((a) => a.tipo === 'pasar') ?? null);

  // ── Avisos ─────────────────────────────────────────────────────────────────

  const aviso = $derived.by(() => {
    const u = vista.ultimaAccion;
    if (u === null || sesion.fin !== null) return null;
    const quien = nombre(u.asiento);
    if (u.accion.tipo === 'pasar') return T.kings.pasa(quien);
    if (u.accion.tipo === 'mover') return T.kings.mueve(quien);
    return T.kings.juega(quien);
  });

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    if (vista.turno !== yo) return T.kings.turnoDe(nombre(vista.turno));
    return origen === null ? T.kings.tuTurno : T.kings.eligeDestino;
  });
</script>

<div class="mesa-kings">
  <div class="rivales">
    {#each rivales as a (a)}
      <div class="rival" class:activo={vista.turno === a && sesion.fin === null} data-testid="asiento-{a}">
        <span class="nombre">{nombre(a)}</span>
        <span class="dorsos">
          {#each { length: Math.min(vista.cartasEnMano[a]!, 10) }, k (k)}
            <span class="dorso"><Carta /></span>
          {/each}
        </span>
        <small>{T.kings.cartas(vista.cartasEnMano[a]!)}</small>
      </div>
    {/each}
  </div>

  <div class="cruz">
    {#each REJILLA as sitio (sitio)}
      {#if sitio === 'mazo'}
        <div class="sitio mazo" data-testid="mazo">
          {#if vista.enMazo > 0}<span class="carta"><Carta /></span>{/if}
          <small>{T.kings.mazo(vista.enMazo)}</small>
        </div>
      {:else}
        {@const pila = vista.pilas[sitio]!}
        <button
          type="button"
          class="sitio pila"
          class:esquina={esEsquinaKings(sitio)}
          class:vacia={pila.length === 0}
          class:destino={accionHacia(sitio) !== null}
          class:movible={puedePila(sitio)}
          class:marcada={origen?.tipo === 'pila' && origen.pila === sitio}
          aria-label={T.kings.pila(sitio)}
          data-testid="pila-{sitio}"
          data-cartas={pila.length}
          onclick={() => tocarPila(sitio)}
        >
          {#if pila.length === 0}
            <span class="hueco">{esEsquinaKings(sitio) ? 'K' : ''}</span>
          {:else}
            <span class="carta" data-carta={pila[0]}><Carta id={pila[0]!} /></span>
            {#if pila.length > 1}
              <span class="carta arriba" data-carta={pila.at(-1)}><Carta id={pila.at(-1)!} /></span>
            {/if}
          {/if}
        </button>
      {/if}
    {/each}
  </div>

  {#if aviso}
    <p class="aviso" role="status" data-testid="aviso">{aviso}</p>
  {/if}

  <div class="propio">
    <div class="estado">
      <span class="nombre" class:activo={vista.turno === yo && sesion.fin === null}>{T.brisca.tu}</span>
      <span class="turno" data-testid="turno">{turno}</span>
      {#if pasar && miTurno}
        <button type="button" data-testid="pasar" onclick={() => hacer(pasar)}>{T.kings.pasar}</button>
      {/if}
    </div>
    <div class="mano" data-testid="mano">
      {#each vista.miMano ?? [] as id, i (`${id}-${i}`)}
        <button
          type="button"
          class="carta-mano"
          class:jugable={puedeCarta(id)}
          class:marcada={origen?.tipo === 'carta' && origen.indice === i}
          data-carta={id}
          data-testid="mano-{id}"
          onclick={() => tocarCarta(id, i)}
        >
          <Carta {id} />
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .mesa-kings {
    --ancho-carta: min(15vw, 10dvh, 80px);
    --ancho-rival: min(5vw, 4dvh, 28px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
  }

  .rivales {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .rival {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 8px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.2);
    border: 2px solid transparent;
  }

  .rival.activo {
    border-color: var(--acento);
  }

  .rival small {
    color: var(--texto-suave);
  }

  .nombre {
    font-weight: 600;
  }

  .dorsos {
    display: flex;
    min-height: calc(var(--ancho-rival) * 1.4);
  }

  .dorso {
    display: block;
    width: var(--ancho-rival);
    aspect-ratio: 100 / 140;
  }

  .dorso + .dorso {
    margin-left: calc(var(--ancho-rival) * -0.55);
  }

  .cruz {
    display: grid;
    grid-template-columns: repeat(3, var(--ancho-carta));
    gap: 8px clamp(8px, 4vw, 24px);
    justify-content: center;
  }

  .sitio {
    position: relative;
    width: var(--ancho-carta);
    height: calc(var(--ancho-carta) * 1.4 * 1.3);
    padding: 0;
    border: none;
    background: none;
    border-radius: 8px;
  }

  .sitio .carta {
    position: absolute;
    left: 0;
    top: 0;
    width: var(--ancho-carta);
    aspect-ratio: 100 / 140;
  }

  .sitio .carta.arriba {
    top: calc(var(--ancho-carta) * 1.4 * 0.3);
  }

  .mazo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    color: var(--texto-suave);
  }

  .hueco {
    display: grid;
    place-items: center;
    width: var(--ancho-carta);
    aspect-ratio: 100 / 140;
    border-radius: 8px;
    border: 2px dashed rgb(255 255 255 / 0.25);
    color: rgb(255 255 255 / 0.3);
    font-weight: 700;
    font-size: 1.4rem;
  }

  .pila.destino {
    outline: 3px solid var(--resalte);
    outline-offset: 2px;
    cursor: pointer;
  }

  .pila.movible {
    cursor: pointer;
  }

  .pila.marcada {
    outline: 3px solid var(--acento);
    outline-offset: 2px;
  }

  .aviso {
    margin: 0;
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: 600;
    background: rgb(0 0 0 / 0.3);
  }

  .propio {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 100%;
  }

  .estado {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 12px;
    min-height: 44px;
  }

  .estado .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.2);
  }

  .estado .nombre.activo {
    background: var(--acento);
    color: #2b2005;
  }

  .turno {
    font-weight: 600;
  }

  .mano {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px 0;
    width: 100%;
  }

  .carta-mano {
    width: var(--ancho-carta);
    aspect-ratio: 100 / 140;
    padding: 0;
    border: none;
    background: none;
    border-radius: 7%;
    cursor: default;
  }

  .carta-mano + .carta-mano {
    margin-left: calc(var(--ancho-carta) * -0.4);
  }

  .carta-mano.jugable {
    cursor: pointer;
  }

  .carta-mano.jugable:hover {
    translate: 0 -6px;
  }

  .carta-mano.marcada {
    translate: 0 -10px;
    outline: 3px solid var(--resalte);
    z-index: 1;
  }
</style>
