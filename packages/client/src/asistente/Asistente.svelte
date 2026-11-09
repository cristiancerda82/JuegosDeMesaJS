<script lang="ts">
  import { cartasDeAccion } from '@juegos/engine';
  import { tick } from 'svelte';
  import { nombreAsiento, nombreNumerado } from '../mesas/bazas/asientos';
  import type { IdJuego } from '../sesion/juegos';
  import type { Lectura, SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { porParejas } from './contexto';
  import {
    consejoDe,
    fraseComentario,
    fraseLectura,
    fraseMotivo,
    TEXTOS_ASISTENTE as TA,
  } from './textos';

  /**
   * Modo asistido en la mesa (spec modo-asistido): interruptor, consejo de fase, sugerencia con
   * su explicación y comentario de la jugada. Resalta lo que habría que tocar con la misma clase
   * que la pista de los solitarios. No juega nada por el jugador.
   */
  interface Props {
    juego: IdJuego;
    sesion: SesionMesa<unknown, unknown, unknown, unknown>;
    /** Donde se buscan las cartas y los botones que resaltar. */
    raiz: HTMLElement | undefined;
    /**
     * El interruptor va en la cabecera de la partida y los avisos encima de la mesa: así, con el
     * modo desactivado, la mesa se ve exactamente igual que sin modo asistido.
     */
    parte: 'interruptor' | 'avisos';
  }

  let { juego, sesion, raiz, parte }: Props = $props();

  const CLASE = 'pista-resaltada';
  /** Lo que dura el comentario antes de irse solo. */
  const DURACION_COMENTARIO_MS = 7000;

  const asistencia = $derived(sesion.asistido ? sesion.asistencia : null);
  const frase = $derived(
    asistencia ? fraseMotivo(asistencia.motivo.codigo, asistencia.motivo.datos, juego) : null,
  );
  const consejo = $derived(
    sesion.asistido && sesion.consejo ? consejoDe(juego, sesion.consejo) : null,
  );
  /** El rival como lo nombra la mesa: «Compañero» en los juegos por parejas, «Rival 2»… */
  const nombre = ({ asiento, jugadores }: Lectura) =>
    porParejas(juego, jugadores)
      ? nombreAsiento(asiento, jugadores, sesion.asiento, sesion.red)
      : nombreNumerado(asiento, jugadores, sesion.asiento, sesion.red, T.brisca.rivalN, T.brisca.rival);
  const lecturas = $derived(
    sesion.asistido
      ? sesion.lecturas.map((l) => fraseLectura(l.motivo.codigo, l.motivo.datos, nombre(l), juego))
      : [],
  );
  const comentario = $derived(
    sesion.asistido && sesion.comentario
      ? fraseComentario(sesion.comentario.codigo, sesion.comentario.datos)
      : null,
  );

  /**
   * Lo que hay que tocar: las cartas de la acción y su botón, el de la jugada exacta
   * (`data-jugada`) si lo hay o, si no, el de su tipo (`data-accion`).
   */
  function aResaltar(contenedor: HTMLElement, accion: unknown): Element[] {
    const cartas = cartasDeAccion(accion).flatMap((c) => [
      `[data-carta="${c}"]`,
      `[data-testid="mano-${c}"]`,
    ]);
    const json = JSON.stringify(accion);
    const exactos = [...contenedor.querySelectorAll('[data-jugada]')].filter(
      (el) => el.getAttribute('data-jugada') === json,
    );
    const tipo = (accion as { readonly tipo?: unknown } | null)?.tipo;
    const porTipo = exactos.length === 0 && typeof tipo === 'string' ? [`[data-accion="${tipo}"]`] : [];
    const sel = [...cartas, ...porTipo];
    return [...exactos, ...(sel.length > 0 ? contenedor.querySelectorAll(sel.join(',')) : [])];
  }

  // Resalta la sugerencia; cualquier cambio en la mesa la vuelve a poner o la quita.
  $effect(() => {
    const a = asistencia;
    void sesion.vista;
    const contenedor = raiz;
    let vivo = true;
    void tick().then(() => {
      if (!vivo || !contenedor || !a) return;
      for (const el of aResaltar(contenedor, a.sugerida)) el.classList.add(CLASE);
    });
    return () => {
      vivo = false;
      for (const el of contenedor?.querySelectorAll(`.${CLASE}`) ?? []) el.classList.remove(CLASE);
    };
  });

  // El comentario se va solo al cabo de unos segundos.
  $effect(() => {
    if (!comentario) return;
    const t = setTimeout(() => sesion.cerrarComentario(), DURACION_COMENTARIO_MS);
    return () => clearTimeout(t);
  });
</script>

{#if sesion.puedeAsistir && parte === 'interruptor'}
  <span class="asistente" class:activo={sesion.asistido}>
    <button
      class="interruptor"
      aria-pressed={sesion.asistido}
      aria-label={sesion.asistido ? TA.desactivar : TA.activar}
      title={sesion.asistido ? TA.desactivar : TA.activar}
      onclick={() => sesion.alternarAsistido()}
      data-testid="alternar-asistido"
    >
      <span class="punto" aria-hidden="true"></span><span class="texto">{TA.activo}</span>
    </button>
  </span>
{:else if sesion.puedeAsistir && sesion.asistido && parte === 'avisos'}
      <div class="avisos" aria-live="polite">
        <!-- El consejo y el comentario flotan bajo la cabecera: son pasajeros y así no empujan la mesa. -->
        <div class="flotantes">
        {#if consejo}
          <div class="aviso consejo" data-testid="consejo">
            <b>{TA.consejo}</b>
            <span>{consejo}</span>
            <button class="cerrar" aria-label={TA.cerrar} onclick={() => sesion.cerrarConsejo()} data-testid="cerrar-consejo"
              >×</button
            >
          </div>
        {/if}
        {#if comentario}
          <button class="aviso comentario" onclick={() => sesion.cerrarComentario()} data-testid="comentario">
            <b>{TA.comentario}</b>
            <span>{comentario}</span>
          </button>
        {/if}
        </div>
        {#if lecturas.length > 0}
          <div class="aviso lecturas" data-testid="lecturas">
            <b>{TA.lecturas}</b>
            <ul>
              {#each lecturas as l, i (i)}
                <li data-testid="lectura">{l}</li>
              {/each}
            </ul>
          </div>
        {/if}
        {#if frase}
          <div class="aviso sugerencia" data-testid="sugerencia">
            <b>{TA.sugerencia}</b>
            <span>{frase}</span>
          </div>
        {:else if sesion.pensandoSugerencia}
          <div class="aviso sugerencia pensando" data-testid="sugerencia-pensando">
            <span>{TA.pensando}</span>
          </div>
        {/if}
      </div>
{/if}

<style>
  .asistente {
    margin-left: auto;
  }

  .interruptor {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 0.15rem 0.8rem;
    border-radius: 16px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  @media (max-width: 420px) {
    .texto {
      display: none;
    }

    .interruptor {
      width: 40px;
      min-height: 40px;
      justify-content: center;
      padding: 0;
      border-radius: 50%;
    }
  }

  .punto {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--texto-suave);
  }

  .activo .interruptor {
    background: var(--acento);
    color: #2b2005;
  }

  .activo .punto {
    background: #2b2005;
  }

  /* Por encima de los paneles de las mesas (subasta, descarte…: 1500), por debajo del fin (2000). */
  .avisos {
    position: relative;
    z-index: 1600;
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 860px;
    margin: 0 auto;
    padding: 0 8px 4px;
  }

  .flotantes {
    position: fixed;
    top: calc(56px + env(safe-area-inset-top));
    left: 50%;
    translate: -50% 0;
    z-index: 1600;
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: min(calc(100% - 16px), 844px);
    pointer-events: none;
  }



  .aviso {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 2px 8px;
    align-items: baseline;
    width: 100%;
    padding: 5px 10px;
    border-radius: 12px;
    text-align: left;
    font-size: 0.85rem;
    line-height: 1.3;
    background: rgb(0 0 0 / 0.35);
    border-left: 4px solid var(--acento);
  }

  .aviso b {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--acento);
  }

  .consejo {
    padding-right: 40px;
    border-left-color: #8ec5ff;
  }

  .consejo b {
    color: #8ec5ff;
  }

  .comentario {
    border-left-color: #ff9f80;
    font-weight: 400;
    cursor: pointer;
  }

  .comentario b {
    color: #ff9f80;
  }

  .lecturas {
    border-left-color: #c9a7ff;
  }

  .lecturas b {
    color: #c9a7ff;
  }

  .lecturas ul {
    flex-basis: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* En el móvil solo la última: la mesa necesita el sitio. */
  @media (max-width: 420px) {
    .lecturas li:not(:last-child) {
      display: none;
    }
  }

  .pensando {
    color: var(--texto-suave);
    font-style: italic;
  }

  .cerrar {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 32px;
    min-height: 32px;
    padding: 0;
    border-radius: 50%;
    font-size: 1.1rem;
    line-height: 1;
  }

  /* Opacos y con sombra: tapan lo que hay debajo mientras se leen. */
  .flotantes .aviso {
    pointer-events: auto;
    background: #0c2818;
    box-shadow: 0 6px 18px rgb(0 0 0 / 0.5);
  }
</style>
