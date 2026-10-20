<script lang="ts">
  import {
    puntosTuteSubastado,
    type AccionTuteSubastado,
    type Asiento,
    type ConfigTuteSubastado,
    type EstadoTuteSubastado,
    type IdCarta,
    type VistaTuteSubastado,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenTuteSubastado from './ResumenTuteSubastado.svelte';

  interface Props {
    sesion: SesionMesa<
      ConfigTuteSubastado,
      EstadoTuteSubastado,
      AccionTuteSubastado,
      VistaTuteSubastado
    >;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'jugar' && a.carta === carta);
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, 4, sesion.asiento, sesion.red, T.tuteSubastado.rivalN);
  const detalle = (asiento: Asiento) =>
    vista.fase === 'bazas'
      ? T.tuteSubastado.detalleBazas(
          asiento === vista.pujador,
          vista.bazas[asiento] ?? 0,
          vista.fichas[asiento] ?? 0,
        )
      : T.tuteSubastado.detalle(vista.dichos[asiento] ?? null, vista.fichas[asiento] ?? 0);

  const pujas = $derived(legales.flatMap((a) => (a.tipo === 'pujar' ? [a.puntos] : [])));
  const puedoHablar = $derived(legales.some((a) => a.tipo === 'pasar'));
  const palos = $derived(legales.flatMap((a) => (a.tipo === 'triunfo' ? [a.palo] : [])));
  const cantes = $derived(
    legales.filter(
      (a): a is Extract<AccionTuteSubastado, { tipo: 'cantar' }> => a.tipo === 'cantar',
    ),
  );
  const tute = $derived(legales.find((a) => a.tipo === 'cantarTute'));
  const puntosCante = (palo: string) => (palo === vista.triunfo ? 40 : 20);

  /** Lo que lleva el pujador en la mano: bazas, cantes y últimas. */
  const lleva = $derived(
    vista.pujador === null ? 0 : puntosTuteSubastado(vista, vista.pujador).pujador,
  );

  /** La última baza se ve hasta que empieza la subasta de la mano siguiente. */
  const vistaMesa: VistaBazas = $derived({
    config: { jugadores: 4 },
    miMano: vista.miMano,
    cartasEnMano: vista.cartasEnMano,
    mazo: 0,
    muestra: null,
    mesa: vista.mesa,
    turno: vista.turno,
    bazas: vista.bazas,
    ultimaBaza:
      vista.fase === 'bazas' || vista.dichos.every((d) => d === null) ? vista.ultimaBaza : null,
    resultadosManos: [],
  });

  // ── Avisos de lo que dicen y cantan los demás ──────────────────────────────

  let anunciado: string | null = $state(null);
  let antes: VistaTuteSubastado | null = null;
  $effect(() => {
    const ahora = vista;
    const previa = antes;
    antes = ahora;
    if (previa === null || previa.turno === null) return;
    const quien = previa.turno;
    if (ahora.cantes.length > previa.cantes.length) {
      const c = ahora.cantes.at(-1)!;
      anunciado = T.tute.canta(nombre(c.asiento), c.puntos, c.palo);
    } else if (previa.fase === 'subasta' && ahora.todosPasaron) {
      anunciado = T.tuteSubastado.todosPasaron;
    } else if (previa.fase === 'subasta' && ahora.fase === 'triunfo') {
      anunciado = T.tuteSubastado.gana(nombre(ahora.pujador!), ahora.puja!);
    } else if (previa.fase === 'subasta' && quien !== sesion.asiento) {
      const dicho = ahora.dichos[quien];
      anunciado =
        dicho === 'paso'
          ? T.tuteSubastado.pasa(nombre(quien))
          : typeof dicho === 'number'
            ? T.tuteSubastado.puja2(nombre(quien), dicho)
            : null;
    } else if (previa.fase === 'triunfo' && ahora.triunfo !== null) {
      anunciado = T.tuteSubastado.eligio(nombre(quien), ahora.triunfo);
    } else if (ahora.mesa.length > 0) {
      anunciado = null;
    }
  });

  const enPausa = $derived(sesion.bloqueada && sesion.pensando === null);
  const aviso = $derived(enPausa && vista.mesa.length === 0 ? anunciado : null);

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
    {#if vista.puja === null}
      <span data-testid="puja-vigente">{T.tuteSubastado.sinPuja}</span>
    {:else if vista.fase === 'bazas'}
      <b class="lleva" data-testid="lleva">{T.tuteSubastado.lleva(lleva, vista.puja)}</b>
    {:else}
      <span data-testid="puja-vigente">
        {T.tuteSubastado.puja(vista.puja, nombre(vista.pujador!))}
      </span>
    {/if}
    <span data-testid="triunfo">
      {T.tuteSubastado.triunfo}:
      {#if vista.triunfo === null}
        {T.tuteSubastado.sinTriunfo}
      {:else}
        <b class="triunfo">{vista.triunfo}</b>
      {/if}
    </span>
    {#if vista.cantes.length > 0}
      <span data-testid="cantes">
        {T.tute.cantes}:
        {#each vista.cantes as c, i (c.palo)}
          {i > 0 ? ' · ' : ''}{T.tute.cante(nombre(c.asiento), c.puntos, c.palo)}
        {/each}
      </span>
    {/if}
    <span data-testid="mano-subastado">
      {T.tuteSubastado.mano(Math.min(vista.numeroMano + 1, vista.config.manos), vista.config.manos)}
    </span>
  {/snippet}

  {#snippet acciones(cancelar: () => void)}
    {#if palos.length > 0}
      <div class="decision" role="group" aria-label={T.tuteSubastado.eligeTriunfo}>
        <span class="pregunta">{T.tuteSubastado.eligeTriunfo}</span>
        {#each palos as palo (palo)}
          <button
            class="principal"
            data-testid="triunfo-{palo}"
            onclick={() => {
              cancelar();
              sesion.jugar({ tipo: 'triunfo', palo });
            }}>{T.tuteSubastado.palo(palo)}</button
          >
        {/each}
      </div>
    {/if}
    {#if tute}
      <button
        class="principal"
        data-testid="cantar-tute"
        onclick={() => {
          cancelar();
          sesion.jugar(tute);
        }}>{T.tute.cantarTute}</button
      >
    {/if}
    {#each cantes as c (c.palo)}
      <button
        class="principal"
        data-testid="cantar-{c.palo}"
        onclick={() => {
          cancelar();
          sesion.jugar(c);
        }}>{T.tute.cantar(puntosCante(c.palo), c.palo)}</button
      >
    {/each}
  {/snippet}
</MesaBazas>

{#if puedoHablar && resumen === null && sesion.fin === null}
  <div class="velo subasta">
    <div
      class="dialogo"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-subasta"
      data-testid="panel-subasta"
    >
      <h2 id="titulo-subasta">{T.tuteSubastado.subasta}</h2>
      <p class="nota">{T.tuteSubastado.tuTurno(vista.puja)}</p>
      <div class="mano-subasta" aria-hidden="true">
        {#each vista.miMano ?? [] as id (id)}
          <span class="mini"><Carta {id} /></span>
        {/each}
      </div>
      <ul class="dichos">
        {#each [0, 1, 2, 3].filter((a) => a !== sesion.asiento) as a (a)}
          <li>{nombre(a)}: {T.tuteSubastado.detalle(vista.dichos[a] ?? null, vista.fichas[a] ?? 0)}</li>
        {/each}
      </ul>
      <button class="paso" data-testid="pasar" onclick={() => sesion.jugar({ tipo: 'pasar' })}>
        {T.tuteSubastado.paso}
      </button>
      <div class="pujas" role="group" aria-label={T.tuteSubastado.subasta}>
        {#each pujas as p (p)}
          <button
            class="principal"
            data-testid="puja-{p}"
            onclick={() => sesion.jugar({ tipo: 'pujar', puntos: p })}>{p}</button
          >
        {/each}
      </div>
    </div>
  </div>
{/if}

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div
      class="dialogo"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fin-mano"
      data-testid="panel-mano"
    >
      <h2 id="fin-mano">{T.tuteSubastado.finMano(resumen + 1)}</h2>
      <ResumenTuteSubastado resultado={vista.resultadosManos[resumen]!} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.tuteSubastado.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .triunfo {
    color: var(--acento);
    text-transform: capitalize;
  }

  .lleva {
    padding: 0 8px;
    border-radius: 10px;
    color: #2b2005;
    background: var(--acento);
  }

  .decision {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .pregunta {
    flex-basis: 100%;
    text-align: center;
    font-size: 0.9rem;
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

  /* La subasta deja libre la cabecera: el menú y la guía siguen a mano. */
  .velo.subasta {
    top: 60px;
  }

  .dialogo {
    width: min(100%, 460px);
    max-height: calc(100dvh - 92px);
    overflow-y: auto;
    padding: 14px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.1rem;
    margin-bottom: 4px;
  }

  .nota {
    margin: 0 0 8px;
    font-size: 0.9rem;
    color: var(--texto-suave);
  }

  /* Las 10 cartas en una fila: se encogen en pantallas estrechas. */
  .mano-subasta {
    display: flex;
    justify-content: center;
    gap: 3px;
  }

  .mini {
    display: block;
    flex: 1 1 0;
    min-width: 0;
    max-width: 38px;
    aspect-ratio: 100 / 140;
  }

  .dichos {
    margin: 8px 0;
    padding: 0;
    list-style: none;
    font-size: 0.85rem;
    color: var(--texto-suave);
  }

  .paso {
    width: 100%;
    margin-bottom: 8px;
  }

  .pujas {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
  }

  .pujas button {
    min-width: 0;
    padding-inline: 0;
  }

  .dialogo > .principal {
    margin-top: 14px;
    width: 100%;
  }
</style>
