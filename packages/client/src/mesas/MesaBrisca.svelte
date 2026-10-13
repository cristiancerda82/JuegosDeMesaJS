<script lang="ts">
  import {
    cartaDeCambio,
    type AccionBrisca,
    type Asiento,
    type ConfigBrisca,
    type EstadoBrisca,
    type IdCarta,
    type VistaBrisca,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import { Interaccion } from '../interaccion/interaccion.svelte';
  import { HUMANO, type Sesion } from '../sesion/sesion.svelte';
  import { T } from '../textos';

  interface Props {
    sesion: Sesion<ConfigBrisca, EstadoBrisca, AccionBrisca, VistaBrisca>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);

  // ── Asientos ───────────────────────────────────────────────────────────────
  // El humano abajo; el turno avanza en sentido antihorario: derecha, arriba, izquierda.

  type Lado = 'abajo' | 'derecha' | 'arriba' | 'izquierda';

  function lado(asiento: Asiento): Lado {
    if (n === 2) return asiento === HUMANO ? 'abajo' : 'arriba';
    return (['abajo', 'derecha', 'arriba', 'izquierda'] as const)[asiento]!;
  }

  function nombre(asiento: Asiento): string {
    if (asiento === HUMANO) return T.brisca.tu;
    if (n === 2) return T.brisca.rival;
    return asiento === 2 ? T.brisca.companero : T.brisca.rivalN(asiento === 1 ? 1 : 2);
  }

  const rivales = $derived(Array.from({ length: n - 1 }, (_, i) => i + 1));

  // ── Mesa y avisos ──────────────────────────────────────────────────────────

  /** Durante la pausa tras una baza se sigue viendo la baza completa. */
  const viendoBaza = $derived(
    sesion.bloqueada && sesion.pensando === null && vista.mesa.length === 0 && vista.ultimaBaza !== null,
  );
  const enMesa = $derived(viendoBaza ? vista.ultimaBaza!.cartas : vista.mesa);

  const aviso = $derived.by(() => {
    if (sesion.fin !== null) return null;
    if (viendoBaza) return T.brisca.ganaBaza(nombre(vista.ultimaBaza!.ganador));
    const ultima = vista.resultadosManos.at(-1);
    const manoNueva = vista.bazas.every((b) => b === 0) && vista.mesa.length === 0;
    if (sesion.bloqueada && sesion.pensando === null && ultima && manoNueva) {
      return T.brisca.finMano(ultima.puntos[0], ultima.puntos[1]);
    }
    return null;
  });

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    if (sesion.bloqueada) return '';
    return vista.turno === HUMANO ? T.brisca.tuTurno : T.brisca.turnoDe(nombre(vista.turno));
  });

  const cambio = $derived(legales.find((a) => a.tipo === 'cambiarMuestra'));
  const paloTriunfo = $derived(vista.triunfo);

  // ── Interacción ────────────────────────────────────────────────────────────

  const jugable = (carta: string) => legales.some((a) => a.tipo === 'jugar' && a.carta === carta);

  const interaccion = new Interaccion({
    destinos: (carta) => (jugable(carta) ? ['mesa'] : []),
    destinoObvio: (carta) => (jugable(carta) ? 'mesa' : null),
    mover(carta, destino) {
      if (destino === 'mesa') sesion.jugar({ tipo: 'jugar', carta: carta as IdCarta });
    },
    elementos: (_carta, nodo) => [nodo],
  });

  function cambiarMuestra() {
    interaccion.cancelar();
    if (cambio) sesion.jugar(cambio);
  }

  // ── Animación ──────────────────────────────────────────────────────────────

  let raiz: HTMLElement | undefined = $state();
  let previas: Posiciones = new Map();
  $effect.pre(() => {
    void vista;
    void enMesa;
    if (raiz) previas = medir(raiz);
  });
  $effect(() => {
    void vista;
    void enMesa;
    if (raiz) animar(raiz, previas);
  });
</script>

<div class="brisca" class:cuatro={n === 4} bind:this={raiz}>
  <div class="info">
    <span>{T.brisca.triunfo}: <b class="triunfo">{paloTriunfo}</b></span>
    {#if vista.config.manos > 1}
      <span>{T.brisca.manosGanadas(vista.manosGanadas[0], vista.manosGanadas[1])}</span>
    {/if}
  </div>

  {#each rivales as asiento (asiento)}
    <div
      class="asiento rival {lado(asiento)}"
      class:activo={vista.turno === asiento && sesion.fin === null}
      data-testid="asiento-{asiento}"
    >
      <div class="nombre">
        {nombre(asiento)}
        <small>{T.brisca.bazas(vista.bazas[asiento] ?? 0)}</small>
      </div>
      <div class="mano-rival" data-zona="mano-{asiento}">
        {#each { length: vista.cartasEnMano[asiento] ?? 0 }, k (k)}
          <div class="dorso"><Carta /></div>
        {/each}
      </div>
    </div>
  {/each}

  <div class="centro">
    <div class="mazo" data-zona="mazo">
      {#if vista.muestra !== null}
        <div class="muestra" data-carta={vista.muestra} data-testid="muestra" title={T.brisca.muestra}>
          <Carta id={vista.muestra} />
        </div>
      {/if}
      {#if vista.mazo > 0}
        <div class="monton"><Carta /></div>
      {/if}
      <span class="cuenta" data-testid="cartas-mazo">{T.brisca.enMazo(vista.mazo + (vista.muestra === null ? 0 : 1))}</span>
    </div>

    <div
      class="tapete"
      class:legal={interaccion.resaltados.has('mesa')}
      data-destino="mesa"
      data-testid="mesa"
      aria-label={T.brisca.mesa}
      role="button"
      tabindex="-1"
      onclick={() => interaccion.tocarDestino('mesa')}
      onkeydown={() => {}}
    >
      {#each enMesa as jugada (jugada.carta)}
        <div class="jugada {lado(jugada.asiento)}" data-carta={jugada.carta} data-desde="mano-{jugada.asiento}">
          <Carta id={jugada.carta} />
        </div>
      {/each}
      {#if aviso}
        <div class="aviso" role="status">{aviso}</div>
      {/if}
    </div>
  </div>

  <div class="asiento propio" class:activo={vista.turno === HUMANO && sesion.fin === null}>
    <div class="estado">
      <span class="nombre">{T.brisca.tu} <small>{T.brisca.bazas(vista.bazas[HUMANO] ?? 0)}</small></span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
      {#if cambio && vista.muestra}
        <button class="principal" onclick={cambiarMuestra} data-testid="cambiar-muestra">
          {T.brisca.cambiarMuestra(nombreCarta(cartaDeCambio(vista.muestra)).toLowerCase())}
        </button>
      {/if}
    </div>
    <div class="mano">
      {#each vista.miMano ?? [] as id (id)}
        <div
          class="carta-mano"
          class:jugable={jugable(id)}
          class:seleccionada={interaccion.seleccion === id}
          data-carta={id}
          data-desde="mazo"
          data-testid="mano-{id}"
          use:interaccion.origen={id}
        >
          <Carta {id} />
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .brisca {
    --ancho-carta: min(19vw, 13dvh, 104px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-rival: min(10vw, 7dvh, 54px);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas:
      'info info info'
      'arriba arriba arriba'
      'izquierda centro derecha'
      'abajo abajo abajo';
    gap: 8px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  /* Con 4 jugadores la mesa central comparte el ancho con dos rivales laterales. */
  .brisca.cuatro {
    --ancho-carta: min(16vw, 11dvh, 96px);
    --ancho-rival: min(9vw, 6dvh, 48px);
  }

  .cuatro .izquierda .nombre,
  .cuatro .derecha .nombre {
    max-width: 22vw;
    text-align: center;
    font-size: 0.85rem;
    padding: 2px 6px;
  }

  .cuatro .izquierda .nombre small,
  .cuatro .derecha .nombre small {
    display: block;
    margin: 0;
  }

  .cuatro .mazo {
    width: calc(var(--ancho-carta) * 0.7);
    height: calc(var(--alto-carta) * 0.7);
  }

  .tapete {
    min-width: calc(var(--ancho-carta) * 2.2);
  }

  .info {
    grid-area: info;
    display: flex;
    justify-content: center;
    gap: 18px;
    color: var(--texto-suave);
    font-size: 0.9rem;
  }

  .triunfo {
    color: var(--acento);
    text-transform: capitalize;
  }

  .asiento {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .asiento.arriba {
    grid-area: arriba;
  }

  .asiento.izquierda {
    grid-area: izquierda;
    align-self: center;
  }

  .asiento.derecha {
    grid-area: derecha;
    align-self: center;
  }

  .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: rgb(0 0 0 / 0.2);
  }

  .nombre small {
    font-weight: 400;
    color: var(--texto-suave);
    margin-left: 4px;
  }

  .activo .nombre {
    background: var(--acento);
    color: #2b2005;
  }

  .activo .nombre small {
    color: #5b4a12;
  }

  .mano-rival {
    display: flex;
    min-height: calc(var(--ancho-rival) * 1.4);
  }

  .izquierda .mano-rival,
  .derecha .mano-rival {
    flex-direction: column;
  }

  .dorso {
    width: var(--ancho-rival);
    aspect-ratio: 100 / 140;
    flex: none;
  }

  .mano-rival .dorso + .dorso {
    margin-left: calc(var(--ancho-rival) * -0.45);
  }

  .izquierda .mano-rival .dorso + .dorso,
  .derecha .mano-rival .dorso + .dorso {
    margin-left: 0;
    margin-top: calc(var(--ancho-rival) * -1);
  }

  .centro {
    grid-area: centro;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 3vw, 28px);
    min-width: 0;
  }

  .mazo {
    position: relative;
    flex: none;
    width: calc(var(--ancho-carta) * 0.8);
    height: calc(var(--alto-carta) * 0.8);
    margin-left: calc(var(--ancho-carta) * 0.25);
  }

  .muestra {
    position: absolute;
    width: 100%;
    height: 100%;
    left: calc(var(--ancho-carta) * -0.3);
    /* `rotate` y no `transform`, que queda libre para las animaciones FLIP. */
    rotate: -90deg;
  }

  .monton {
    position: absolute;
    inset: 0;
  }

  .cuenta {
    position: absolute;
    top: 100%;
    left: -30%;
    right: -30%;
    margin-top: 6px;
    text-align: center;
    font-size: 0.75rem;
    color: var(--texto-suave);
  }

  .tapete {
    position: relative;
    flex: 1;
    max-width: calc(var(--ancho-carta) * 3.4);
    height: calc(var(--alto-carta) * 1.9);
    border-radius: 18px;
    background: rgb(0 0 0 / 0.12);
    outline: 2px dashed rgb(255 255 255 / 0.15);
    outline-offset: -2px;
  }

  .cuatro .tapete {
    height: calc(var(--alto-carta) * 2.2);
  }

  .tapete.legal {
    outline: 3px solid var(--resalte);
    box-shadow: 0 0 18px rgb(255 224 102 / 0.45);
  }

  .jugada {
    position: absolute;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    left: 50%;
    top: 50%;
    margin-left: calc(var(--ancho-carta) / -2);
    margin-top: calc(var(--alto-carta) / -2);
  }

  .jugada.abajo {
    translate: 0 28%;
  }

  .jugada.arriba {
    translate: 0 -28%;
  }

  .cuatro .jugada.abajo {
    translate: 0 36%;
  }

  .cuatro .jugada.arriba {
    translate: 0 -36%;
  }

  .jugada.derecha {
    translate: 45% 0;
  }

  .jugada.izquierda {
    translate: -45% 0;
  }

  .aviso {
    position: absolute;
    left: 50%;
    bottom: -6px;
    transform: translate(-50%, 100%);
    padding: 4px 12px;
    border-radius: 14px;
    white-space: nowrap;
    font-weight: 700;
    background: rgb(0 0 0 / 0.55);
    z-index: 5;
  }

  .propio {
    grid-area: abajo;
  }

  .estado {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 12px;
    min-height: 44px;
  }

  .turno {
    font-weight: 600;
  }

  .mano {
    display: flex;
    justify-content: center;
    gap: clamp(4px, 2vw, 14px);
    min-height: var(--alto-carta);
    padding-top: 10px;
  }

  .carta-mano {
    width: var(--ancho-carta);
    height: var(--alto-carta);
    flex: none;
    border-radius: 7%;
    cursor: default;
    touch-action: none;
    transition: translate 120ms;
  }

  .carta-mano.jugable {
    cursor: grab;
  }

  .carta-mano.jugable:hover,
  .carta-mano.seleccionada {
    translate: 0 -8px;
  }

  .carta-mano.seleccionada {
    outline: 3px solid var(--resalte);
  }

  :global(.carta-mano.arrastrando) {
    cursor: grabbing;
    filter: drop-shadow(var(--sombra-alta));
  }
</style>
