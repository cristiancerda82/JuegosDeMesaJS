<script lang="ts">
  import {
    paloBelleLucie,
    type AccionBelleLucie,
    type ConfigBelleLucie,
    type EstadoBelleLucie,
    type IdCarta,
    type PaloFrances,
    type VistaBelleLucie,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AvisoAtasco from './AvisoAtasco.svelte';
  import BotonPista, { type Resalte } from './BotonPista.svelte';
  import { formatoTiempo } from './tiempo';

  interface Props {
    sesion: SesionMesa<ConfigBelleLucie, EstadoBelleLucie, AccionBelleLucie, VistaBelleLucie>;
  }

  let { sesion }: Props = $props();

  const PALOS: readonly PaloFrances[] = ['picas', 'corazones', 'diamantes', 'treboles'];

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const puede = (tipo: AccionBelleLucie['tipo']) => legales.some((a) => a.tipo === tipo);

  // ── Selección ──────────────────────────────────────────────────────────────

  /** El abanico cuya carta de arriba está marcada. */
  let seleccion: number | null = $state(null);
  /** Tras tocar «Merci», se elige la carta de debajo. */
  let modoMerci = $state(false);

  const subir = (i: number) =>
    legales.find((a) => a.tipo === 'fundacion' && a.abanico === i) ?? null;
  const moverA = (desde: number, hasta: number) =>
    legales.find((a) => a.tipo === 'mover' && a.desde === desde && a.hasta === hasta) ?? null;
  const tieneJugada = (i: number) =>
    legales.some((a) => (a.tipo === 'fundacion' && a.abanico === i) || (a.tipo === 'mover' && a.desde === i));
  const esDestino = (i: number) => seleccion !== null && moverA(seleccion, i) !== null;
  const fundacionDestino = (palo: PaloFrances) => {
    if (seleccion === null || subir(seleccion) === null) return false;
    return paloBelleLucie(vista.abanicos[seleccion]!.at(-1)!) === palo;
  };

  function hacer(accion: AccionBelleLucie | null) {
    if (accion === null) return;
    seleccion = null;
    modoMerci = false;
    sesion.jugar(accion);
  }

  function tocarCarta(i: number, k: number) {
    const abanico = vista.abanicos[i]!;
    if (modoMerci) {
      if (k < abanico.length - 1) {
        hacer(legales.find((a) => a.tipo === 'merci' && a.abanico === i && a.indice === k) ?? null);
      }
      return;
    }
    if (seleccion === i) {
      // Segundo toque: a la fundación si se puede.
      const a = subir(i);
      if (a) hacer(a);
      else seleccion = null;
      return;
    }
    if (seleccion !== null && moverA(seleccion, i)) return hacer(moverA(seleccion, i));
    seleccion = k === abanico.length - 1 && tieneJugada(i) ? i : null;
  }

  function tocarFundacion(palo: PaloFrances) {
    if (fundacionDestino(palo)) hacer(subir(seleccion!));
  }

  function accion(tipo: 'deshacer' | 'rebarajar') {
    seleccion = null;
    modoMerci = false;
    sesion.jugar({ tipo });
  }

  function abandonar() {
    if (confirm(T.partida.confirmarAbandono)) sesion.jugar({ tipo: 'abandonar' });
  }

  /** Qué resaltar para una pista. */
  function resalte(pista: AccionBelleLucie): Resalte {
    switch (pista.tipo) {
      case 'fundacion': {
        const carta = vista.abanicos[pista.abanico]!.at(-1)!;
        return { cartas: [carta], pilas: [`fundacion-${paloBelleLucie(carta)}`] };
      }
      case 'mover':
        return { cartas: [vista.abanicos[pista.desde]!.at(-1)!], pilas: [`abanico-${pista.hasta}`] };
      case 'merci':
        return { cartas: [vista.abanicos[pista.abanico]![pista.indice]!], pilas: ['merci'] };
      default:
        return { cartas: [], pilas: ['rebarajar'] };
    }
  }

  let mesaEntera: HTMLElement | undefined = $state();

  // ── Tiempo ─────────────────────────────────────────────────────────────────

  let tiempo = $state('');
  $effect(() => {
    const actualizar = () => (tiempo = formatoTiempo(sesion.tiempoMs()));
    actualizar();
    const reloj = setInterval(actualizar, 500);
    return () => clearInterval(reloj);
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

  const cartaFundacion = (palo: PaloFrances): IdCarta | null =>
    vista.fundaciones[palo] === 0 ? null : (`${palo}-${vista.fundaciones[palo]}` as IdCarta);
  const SIMBOLO: Record<PaloFrances, string> = { picas: '♠', corazones: '♥', diamantes: '♦', treboles: '♣' };
</script>

<div class="lucie" bind:this={mesaEntera}>
  <div class="barra">
    <span class="dato"><span class="etiqueta">{T.partida.movimientos}</span> <b data-testid="movimientos">{vista.movimientos}</b></span>
    <span class="dato"><span class="etiqueta">{T.partida.tiempo}</span> <b>{tiempo}</b></span>
    <span class="acciones">
      <button onclick={() => accion('rebarajar')} disabled={!puede('rebarajar')} data-testid="rebarajar">
        {T.belleLucie.rebarajar(vista.rebarajes)}
      </button>
      {#if vista.merci === 'disponible'}
        <button class:activo={modoMerci} onclick={() => ((modoMerci = !modoMerci), (seleccion = null))} data-testid="merci">
          {T.belleLucie.merci}
        </button>
      {/if}
      <BotonPista {sesion} raiz={mesaEntera} {resalte} />
      <button onclick={() => accion('deshacer')} disabled={!puede('deshacer')} data-testid="deshacer">{T.partida.deshacer}</button>
      <button onclick={abandonar} disabled={!puede('abandonar')}>{T.partida.abandonar}</button>
    </span>
  </div>

  {#if modoMerci}
    <p class="aviso" data-testid="aviso-merci">{T.belleLucie.eligeMerci}</p>
  {/if}

  <div class="mesa" bind:this={raiz}>
    <div class="fundaciones">
      {#each PALOS as palo (palo)}
        {@const carta = cartaFundacion(palo)}
        <button
          type="button"
          class="fundacion"
          class:legal={fundacionDestino(palo)}
          data-testid="fundacion-{palo}"
          aria-label={T.belleLucie.fundacion(palo)}
          onclick={() => tocarFundacion(palo)}
        >
          {#if carta}
            <span class="carta" data-carta={carta}><Carta id={carta} /></span>
          {:else}
            <span class="hueco">{SIMBOLO[palo]}</span>
          {/if}
        </button>
      {/each}
    </div>

    <div class="abanicos">
      {#each vista.abanicos as abanico, i (i)}
        <div class="abanico" class:legal={esDestino(i)} data-testid="abanico-{i}">
          {#each abanico as id, k (id)}
            <button
              type="button"
              class="carta"
              class:seleccionada={seleccion === i && k === abanico.length - 1}
              class:merci={modoMerci && k < abanico.length - 1}
              style:left="calc({k} * var(--paso))"
              data-carta={id}
              data-testid="carta-{id}"
              onclick={() => tocarCarta(i, k)}
            >
              <Carta {id} />
            </button>
          {/each}
          {#if abanico.length === 0}<span class="hueco"></span>{/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<AvisoAtasco
  {legales}
  terminada={sesion.fin !== null}
  deshacer={() => accion('deshacer')}
  abandonar={() => sesion.jugar({ tipo: 'abandonar' })}
/>

<style>
  .lucie {
    --ancho-carta: min(calc((100vw - 40px) / 4 / 1.9), 7dvh, 64px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --paso: calc(var(--ancho-carta) * 0.45);
    width: min(100%, 880px);
    margin: 0 auto;
    padding: 0 8px 24px;
  }

  .barra {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 12px;
    padding: 6px 0 10px;
  }

  .dato {
    font-variant-numeric: tabular-nums;
  }

  .etiqueta {
    color: var(--texto-suave);
    font-size: 0.85rem;
  }

  .acciones {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-left: auto;
  }

  .acciones button {
    padding: 0.3rem 0.6rem;
    font-size: 0.85rem;
  }

  .acciones button.activo {
    background: var(--acento);
    color: #2b2005;
  }

  .aviso {
    margin: 0 0 8px;
    text-align: center;
    font-weight: 600;
  }

  .mesa {
    display: flex;
    flex-direction: column;
    gap: 10px;
    user-select: none;
    -webkit-user-select: none;
  }

  .fundaciones {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .fundacion {
    width: var(--ancho-carta);
    height: var(--alto-carta);
    padding: 0;
    border: none;
    background: none;
    border-radius: 7%;
  }

  .fundacion .carta {
    position: static;
    display: block;
  }

  .hueco {
    display: grid;
    place-items: center;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    border-radius: 7%;
    outline: 2px dashed rgb(255 255 255 / 0.18);
    outline-offset: -2px;
    color: rgb(255 255 255 / 0.35);
    font-size: 1.4rem;
  }

  .abanicos {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(calc(var(--ancho-carta) + 2 * var(--paso)), 1fr));
    gap: 8px 6px;
  }

  .abanico {
    position: relative;
    height: var(--alto-carta);
    width: calc(var(--ancho-carta) + 2 * var(--paso));
    justify-self: center;
    border-radius: 7%;
  }

  .carta {
    position: absolute;
    top: 0;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    padding: 0;
    border: none;
    background: none;
    border-radius: 7%;
  }

  .carta.seleccionada {
    outline: 3px solid var(--resalte);
    transform: translateY(-4px);
    z-index: 1;
  }

  .carta.merci {
    cursor: pointer;
    outline: 2px dashed var(--acento);
  }

  .legal {
    outline: 3px solid var(--resalte) !important;
    outline-offset: 1px;
    box-shadow: 0 0 14px rgb(255 224 102 / 0.55);
  }
</style>
