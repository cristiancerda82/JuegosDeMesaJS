<script lang="ts">
  import {
    PALOS_FRANCESES,
    paloDurak,
    rangoDurak,
    type AccionDurak,
    type Asiento,
    type ConfigDurak,
    type EstadoDurak,
    type IdCarta,
    type VistaDurak,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import { Interaccion } from '../interaccion/interaccion.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado } from './bazas/asientos';
  import ManoPropia from './bazas/ManoPropia.svelte';

  interface Props {
    sesion: SesionMesa<ConfigDurak, EstadoDurak, AccionDurak, VistaDurak>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  // Los rivales en el orden de juego, empezando por el siguiente al jugador.
  const rivales = $derived(Array.from({ length: n - 1 }, (_, i) => (yo + i + 1) % n));

  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);
  const activo = (asiento: Asiento) => vista.turno === asiento && sesion.fin === null;
  const salido = (asiento: Asiento) => vista.salidos.includes(asiento);
  const enRonda = $derived(sesion.fin === null);

  /** La mano por palos, con el triunfo al final, y por rango dentro de cada palo. */
  const mano = $derived.by(() => {
    const orden = (c: IdCarta) => {
      const palo = paloDurak(c);
      return palo === vista.triunfo ? 4 : PALOS_FRANCESES.indexOf(palo);
    };
    return [...(vista.miMano ?? [])].sort(
      (a, b) => orden(a) - orden(b) || rangoDurak(a) - rangoDurak(b),
    );
  });

  // ── Jugar ──────────────────────────────────────────────────────────────────

  const jugadaDe = (carta: IdCarta) =>
    legales.find((a) => (a.tipo === 'atacar' || a.tipo === 'defender') && a.carta === carta) ??
    null;
  const jugable = (carta: IdCarta) => jugadaDe(carta) !== null;
  const puedeTomar = $derived(legales.some((a) => a.tipo === 'tomar'));
  const puedePasar = $derived(legales.some((a) => a.tipo === 'pasar'));

  function jugar(accion: AccionDurak) {
    interaccion.cancelar();
    sesion.jugar(accion);
  }

  const interaccion = new Interaccion({
    destinos: (carta) => (jugable(carta as IdCarta) ? ['mesa'] : []),
    destinoObvio: (carta) => (jugable(carta as IdCarta) ? 'mesa' : null),
    mover(carta, destino) {
      const accion = jugadaDe(carta as IdCarta);
      if (destino === 'mesa' && accion) jugar(accion);
    },
    elementos: (_carta, nodo) => [nodo],
  });

  // ── Turno y avisos ─────────────────────────────────────────────────────────

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (salido(yo)) return T.durak.hasSalido;
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (sesion.bloqueada) return '';
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    if (puedeTomar) return T.durak.tuDefensa;
    if (puedePasar) return T.durak.echar;
    return T.durak.tuAtaque;
  });

  const aviso = $derived.by(() => {
    const hecha = vista.ultimaAccion;
    if (hecha === null || sesion.fin !== null) return null;
    const quien = nombre(hecha.asiento);
    const a = hecha.accion;
    if (a.tipo === 'tomar') return T.durak.seLasLleva(quien);
    if (a.tipo === 'pasar') return T.durak.pasa(quien);
    const carta = nombreCarta(a.carta).toLowerCase();
    return a.tipo === 'atacar' ? T.durak.ataque(quien, carta) : T.durak.defensa(quien, carta);
  });

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

{#snippet papel(asiento: Asiento)}
  {#if salido(asiento)}
    <small class="papel salido">{T.durak.salido}</small>
  {:else if enRonda && vista.atacante === asiento}
    <small class="papel" data-testid="ataca-{asiento}">{T.durak.ataca}</small>
  {:else if enRonda && vista.defensor === asiento}
    <small class="papel defiende" data-testid="defiende-{asiento}">{T.durak.defiende}</small>
  {/if}
{/snippet}

<div class="durak" bind:this={raiz} style:--en-mano={Math.max(1, mano.length)}>
  <div class="rivales">
    {#each rivales as asiento (asiento)}
      <div
        class="rival"
        class:activo={activo(asiento)}
        class:fuera={salido(asiento)}
        data-testid="asiento-{asiento}"
        data-zona="mano-{asiento}"
      >
        <span class="dorso"><Carta /></span>
        <span class="datos">
          <b>{nombre(asiento)}</b>
          <small data-testid="cartas-{asiento}">{T.durak.cartas(vista.cartasEnMano[asiento] ?? 0)}</small>
          {@render papel(asiento)}
        </span>
      </div>
    {/each}
  </div>

  <div class="centro">
    <div class="lado">
      {#if vista.mazo > 0}
        <div class="mazo" data-zona="mazo" title={T.durak.enMazo(vista.mazo)}>
          <div class="triunfo-girado" data-carta={vista.cartaTriunfo}><Carta id={vista.cartaTriunfo} /></div>
          {#if vista.mazo > 1}
            <div class="dorso-mazo"><Carta /></div>
          {/if}
          <span class="cuenta" data-testid="cartas-mazo" aria-label={T.durak.enMazo(vista.mazo)}>{vista.mazo}</span>
        </div>
      {/if}
      <span class="triunfo" data-testid="triunfo">{T.durak.triunfo(vista.triunfo)}</span>
      <span class="descarte" data-testid="descarte">{T.durak.descarte(vista.descarte.length)}</span>
    </div>

    <div
      class="mesa"
      class:legal={interaccion.resaltados.has('mesa')}
      data-destino="mesa"
      data-testid="mesa"
      aria-label={T.durak.mesa}
      role="button"
      tabindex="-1"
      onclick={() => interaccion.tocarDestino('mesa')}
      onkeydown={() => {}}
    >
      {#each vista.mesa as par, i (par.ataque)}
        <div class="par" data-testid="par-{i}">
          <div class="ataque" data-carta={par.ataque}><Carta id={par.ataque} /></div>
          {#if par.defensa}
            <div class="defensa" data-carta={par.defensa}><Carta id={par.defensa} /></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  {#if aviso}
    <p class="aviso" role="status" data-testid="aviso">{aviso}</p>
  {/if}

  <div class="propio" class:activo={activo(yo)}>
    <div class="estado">
      <span class="nombre">{T.brisca.tu} {@render papel(yo)}</span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
      {#if puedeTomar && activo(yo)}
        <button data-testid="tomar" onclick={() => jugar({ tipo: 'tomar' })}>{T.durak.tomar}</button>
      {/if}
      {#if puedePasar && activo(yo)}
        <button data-testid="paso" onclick={() => jugar({ tipo: 'pasar' })}>{T.durak.paso}</button>
      {/if}
    </div>
    <ManoPropia cartas={mano} {jugable} {interaccion} />
  </div>
</div>

<style>
  .durak {
    --ancho-mesa: min(15vw, 10dvh, 80px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
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

  .rival.fuera {
    opacity: 0.55;
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
    opacity: 0.85;
  }

  .papel {
    font-weight: 700;
  }

  .papel.defiende {
    color: #ffb4a8;
  }

  .activo .papel.defiende {
    color: #7a1d10;
  }

  .centro {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 2vw, 20px);
    width: 100%;
    min-width: 0;
  }

  .lado {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--texto-suave);
    max-width: calc(var(--ancho-mesa) * 1.5);
    text-align: center;
  }

  .mazo {
    position: relative;
    width: calc(var(--ancho-mesa) * 1.4);
    height: calc(var(--ancho-mesa) * 1.1);
  }

  /* La carta del triunfo, girada debajo del mazo y asomando por la derecha. */
  .triunfo-girado {
    position: absolute;
    top: 50%;
    left: 50%;
    width: calc(var(--ancho-mesa) * 0.75);
    aspect-ratio: 100 / 140;
    transform: translate(-30%, -50%) rotate(90deg);
  }

  .dorso-mazo {
    position: absolute;
    top: 0;
    left: 0;
    width: calc(var(--ancho-mesa) * 0.78);
    aspect-ratio: 100 / 140;
  }

  .cuenta {
    position: absolute;
    left: 3px;
    bottom: 3px;
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--texto);
    background: rgb(0 0 0 / 0.55);
    z-index: 1;
  }

  .triunfo {
    font-weight: 700;
    color: var(--texto);
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
    gap: 10px 8px;
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

  /* La defensa, encima de su ataque y algo desplazada para que se vean las dos. */
  .par {
    position: relative;
    width: calc(var(--ancho-mesa) * 1.2);
    height: calc(var(--ancho-mesa) * 1.4 * 1.25);
  }

  .ataque,
  .defensa {
    position: absolute;
    width: var(--ancho-mesa);
    aspect-ratio: 100 / 140;
  }

  .ataque {
    top: 0;
    left: 0;
  }

  .defensa {
    right: 0;
    bottom: 0;
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

  .propio :global(.ranura) {
    margin-right: 0;
  }

  .estado {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 12px;
    min-height: 44px;
  }

  .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: rgb(0 0 0 / 0.2);
  }

  .nombre .papel {
    margin-left: 4px;
    font-size: 0.8rem;
  }

  .activo .nombre {
    background: var(--acento);
    color: #2b2005;
  }

  .turno {
    font-weight: 600;
  }
</style>
