<script lang="ts">
  import type {
    AccionSpiteMalice,
    ConfigSpiteMalice,
    EstadoSpiteMalice,
    IdCarta,
    OrigenSpite,
    VistaSpiteMalice,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento } from './bazas/asientos';

  interface Props {
    sesion: SesionMesa<ConfigSpiteMalice, EstadoSpiteMalice, AccionSpiteMalice, VistaSpiteMalice>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const rival = $derived(yo === 0 ? 1 : 0);
  const nombre = (asiento: number) => nombreAsiento(asiento, 2, yo, sesion.red);
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);

  // ── Selección de origen y destino ──────────────────────────────────────────

  /** La carta de origen marcada; en la mano, también su posición. */
  let origen: (OrigenSpite & { indice?: number }) | null = $state(null);
  $effect(() => {
    if (!miTurno) origen = null;
  });

  const mismoOrigen = (a: OrigenSpite, b: OrigenSpite) =>
    a.tipo === b.tipo &&
    (a.tipo !== 'mano' || (b.tipo === 'mano' && a.carta === b.carta)) &&
    (a.tipo !== 'descarte' || (b.tipo === 'descarte' && a.pila === b.pila));

  const accionesDe = (o: OrigenSpite) =>
    legales.filter(
      (a) =>
        (a.tipo === 'jugar' && mismoOrigen(a.desde, o)) ||
        (a.tipo === 'descartar' && o.tipo === 'mano' && a.carta === o.carta),
    );
  const puedeOrigen = (o: OrigenSpite) => miTurno && accionesDe(o).length > 0;
  const marcado = (o: OrigenSpite) => origen !== null && mismoOrigen(origen, o);

  function elegir(o: OrigenSpite & { indice?: number }) {
    if (!puedeOrigen(o)) return;
    origen = origen !== null && mismoOrigen(origen, o) && origen.indice === o.indice ? null : o;
  }

  /** La jugada a una escalera; las libres valen todas igual, como la que ofrece el motor. */
  function aEscalera(e: number): AccionSpiteMalice | null {
    if (origen === null) return null;
    const libre = vista.escaleras[e]!.length === 0;
    return (
      accionesDe(origen).find(
        (a) =>
          a.tipo === 'jugar' &&
          (a.escalera === e || (libre && vista.escaleras[a.escalera]!.length === 0)),
      ) ?? null
    );
  }

  function aDescarte(p: number): AccionSpiteMalice | null {
    if (origen === null) return null;
    return accionesDe(origen).find((a) => a.tipo === 'descartar' && a.pila === p) ?? null;
  }

  function hacer(accion: AccionSpiteMalice | null) {
    if (accion === null) return;
    origen = null;
    sesion.jugar(accion);
  }

  const pasar = $derived(legales.find((a) => a.tipo === 'pasar') ?? null);

  // ── Textos ─────────────────────────────────────────────────────────────────

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (vista.turno !== yo) return T.spite.turnoDe(nombre(vista.turno));
    if (origen === null) return T.spite.elige;
    return origen.tipo === 'mano' ? T.spite.destinoMano : T.spite.destino;
  });

  const aviso = $derived.by(() => {
    const hecha = vista.ultimaAccion;
    if (hecha === null || hecha.asiento === yo) return null;
    const quien = nombre(hecha.asiento);
    const a = hecha.accion;
    if (a.tipo === 'pasar') return T.spite.pasa(quien);
    if (a.tipo === 'descartar') return T.spite.descarta(quien, nombreCarta(a.carta));
    return T.spite.juega(quien, nombreCarta(hecha.carta!), a.desde.tipo === 'monton');
  });

  const valorEscalera = (cartas: readonly IdCarta[]) => cartas.length;
</script>

<div class="spite">
  <!-- El rival -->
  <section class="lado rival" class:activo={vista.turno === rival} data-testid="asiento-{rival}">
    <div class="cabecera">
      <span class="nombre">{nombre(rival)}</span>
      <small data-testid="cartas-rival">{T.spite.enMano(vista.cartasEnMano[rival] ?? 0)}</small>
    </div>
    <div class="fila">
      <div class="hueco monton" data-testid="monton-rival">
        <span class="carta"><Carta id={vista.montones[rival]!.arriba} /></span>
        <span class="cuenta">{vista.montones[rival]!.cartas}</span>
      </div>
      {#each vista.descartes[rival]! as pila, p (p)}
        <div class="hueco" data-testid="descarte-rival-{p}">
          {#if pila.length > 0}
            <span class="carta"><Carta id={pila.at(-1)!} /></span>
            <span class="cuenta">{pila.length}</span>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <!-- El centro -->
  <section class="centro">
    <div class="fila">
      <div class="hueco mazo" data-testid="mazo" title={T.spite.mazo}>
        {#if vista.enMazo > 0}<span class="carta"><Carta /></span>{/if}
        <span class="cuenta">{vista.enMazo}</span>
      </div>
      {#each vista.escaleras as escalera, e (e)}
        {@const accion = aEscalera(e)}
        <button
          class="hueco escalera"
          class:destino={accion !== null}
          disabled={accion === null}
          data-testid="escalera-{e}"
          aria-label={T.spite.escalera(e + 1, valorEscalera(escalera))}
          onclick={() => hacer(accion)}
        >
          {#if escalera.length > 0}
            <span class="carta"><Carta id={escalera.at(-1)!} /></span>
            <span class="cuenta">{T.spite.va(valorEscalera(escalera))}</span>
          {/if}
        </button>
      {/each}
    </div>
    <p class="completas" data-testid="completas">{T.spite.completas(vista.completas.length)}</p>
    {#if aviso}<p class="aviso" role="status" data-testid="aviso">{aviso}</p>{/if}
  </section>

  <!-- El jugador -->
  <section class="lado propio" class:activo={vista.turno === yo}>
    <div class="fila">
      <button
        class="hueco monton"
        class:jugable={puedeOrigen({ tipo: 'monton' })}
        class:marcado={marcado({ tipo: 'monton' })}
        data-testid="monton-propio"
        onclick={() => elegir({ tipo: 'monton' })}
      >
        <span class="carta"><Carta id={vista.montones[yo]!.arriba} /></span>
        <span class="cuenta">{vista.montones[yo]!.cartas}</span>
      </button>
      {#each vista.descartes[yo]! as pila, p (p)}
        {@const descarte = aDescarte(p)}
        <button
          class="hueco"
          class:jugable={pila.length > 0 && puedeOrigen({ tipo: 'descarte', pila: p })}
          class:marcado={marcado({ tipo: 'descarte', pila: p })}
          class:destino={descarte !== null}
          data-testid="descarte-propio-{p}"
          onclick={() => (descarte !== null ? hacer(descarte) : elegir({ tipo: 'descarte', pila: p }))}
        >
          {#if pila.length > 0}
            <span class="carta"><Carta id={pila.at(-1)!} /></span>
            <span class="cuenta">{pila.length}</span>
          {/if}
        </button>
      {/each}
    </div>
    <div class="estado">
      <span class="nombre">{nombre(yo)}</span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
      {#if pasar && miTurno}
        <button data-testid="pasar" onclick={() => hacer(pasar)}>{T.spite.pasar}</button>
      {/if}
    </div>
    <div class="mano" data-testid="mano">
      {#each vista.miMano ?? [] as carta, i (i)}
        <button
          class="carta-mano"
          class:jugable={puedeOrigen({ tipo: 'mano', carta })}
          class:marcado={origen?.tipo === 'mano' && origen.indice === i}
          data-testid="mano-{i}"
          data-carta={carta}
          onclick={() => elegir({ tipo: 'mano', carta, indice: i })}
        >
          <Carta id={carta} />
        </button>
      {/each}
    </div>
  </section>
</div>

<style>
  .spite {
    --ancho: min(16vw, 10dvh, 74px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: min(100%, 640px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    user-select: none;
    -webkit-user-select: none;
  }

  .lado,
  .centro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
  }

  .propio {
    margin-top: auto;
  }

  .cabecera,
  .estado {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 12px;
    min-height: 32px;
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

  .fila {
    display: flex;
    justify-content: center;
    gap: 6px;
  }

  .hueco {
    position: relative;
    width: var(--ancho);
    aspect-ratio: 100 / 140;
    padding: 0;
    border: 1.5px dashed rgb(255 255 255 / 0.25);
    border-radius: 8px;
    background: rgb(0 0 0 / 0.12);
    min-height: 0;
  }

  .hueco.monton {
    border-style: solid;
    border-color: rgb(255 255 255 / 0.45);
  }

  .hueco .carta {
    position: absolute;
    inset: 0;
  }

  .cuenta {
    position: absolute;
    right: -4px;
    bottom: -6px;
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.72rem;
    font-weight: 700;
    background: rgb(0 0 0 / 0.65);
    color: #fff;
  }

  .jugable {
    outline: 2px solid rgb(255 255 255 / 0.55);
    outline-offset: 1px;
  }

  .marcado {
    outline: 3px solid var(--acento);
    transform: translateY(-4px);
  }

  .destino {
    outline: 3px dashed var(--acento);
    outline-offset: 2px;
  }

  .completas {
    margin: 0;
    font-size: 0.8rem;
    color: var(--texto-suave);
  }

  .aviso {
    margin: 0;
    padding: 4px 12px;
    border-radius: 14px;
    font-size: 0.9rem;
    font-weight: 600;
    background: rgb(0 0 0 / 0.3);
  }

  .mano {
    display: flex;
    justify-content: center;
    gap: 4px;
  }

  .carta-mano {
    width: min(18vw, 12dvh, 84px);
    aspect-ratio: 100 / 140;
    padding: 0;
    border: none;
    border-radius: 7%;
    background: none;
    min-height: 0;
  }
</style>
