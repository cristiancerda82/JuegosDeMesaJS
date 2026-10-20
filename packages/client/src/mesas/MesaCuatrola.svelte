<script lang="ts">
  import {
    bazasPorBando,
    type AccionCuatrola,
    type Asiento,
    type ConfigCuatrola,
    type EstadoCuatrola,
    type IdCarta,
    type PaloEspanol,
    type VistaCuatrola,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenCuatrola from './ResumenCuatrola.svelte';

  interface Props {
    sesion: SesionMesa<ConfigCuatrola, EstadoCuatrola, AccionCuatrola, VistaCuatrola>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'jugar' && a.carta === carta);
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, 4, sesion.asiento, sesion.red, T.cuatrola.rivalN);
  const carta = (id: IdCarta) => nombreCarta(id).toLowerCase();
  const detalle = (asiento: Asiento) => {
    if (vista.fase !== 'bazas') {
      return T.cuatrola.detalle(vista.dichos[asiento] ?? null, vista.fichas[asiento] ?? 0);
    }
    const papel =
      asiento === vista.jugador
        ? T.cuatrola.papelJugador
        : asiento === vista.companero
          ? T.cuatrola.papelCompanero
          : '';
    return T.cuatrola.detalleBazas(papel, vista.bazas[asiento] ?? 0, vista.fichas[asiento] ?? 0);
  };

  const puedoHablar = $derived(legales.some((a) => a.tipo === 'pasar'));
  const puedoRey = $derived(legales.some((a) => a.tipo === 'pujar' && a.modalidad === 'rey'));
  const elecciones = $derived(
    legales.filter(
      (a): a is Extract<AccionCuatrola, { tipo: 'elegir' }> => a.tipo === 'elegir',
    ),
  );
  const palos = $derived([...new Set(elecciones.map((a) => a.triunfo))]);

  /** Con rey, primero el palo y después la carta que se llama. */
  let paloElegido: PaloEspanol | null = $state(null);
  $effect(() => {
    if (elecciones.length === 0) paloElegido = null;
  });
  const llamables = $derived(
    paloElegido === null ? [] : elecciones.filter((a) => a.triunfo === paloElegido),
  );

  function elegirPalo(palo: PaloEspanol, cancelar: () => void) {
    const opciones = elecciones.filter((a) => a.triunfo === palo);
    if (opciones.length === 1 && opciones[0]!.llamada === null) {
      cancelar();
      sesion.jugar(opciones[0]!);
    } else {
      paloElegido = palo;
    }
  }

  const bandos = $derived(bazasPorBando(vista));

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

  // ── Avisos de lo que dicen los demás y del compañero ───────────────────────

  let anunciado: string | null = $state(null);
  let antes: VistaCuatrola | null = null;
  $effect(() => {
    const ahora = vista;
    const previa = antes;
    antes = ahora;
    if (previa === null || previa.turno === null) return;
    const quien = previa.turno;
    if (previa.companero === null && ahora.companero !== null && ahora.fase === 'bazas') {
      anunciado = T.cuatrola.descubre(nombre(ahora.companero));
    } else if (previa.fase === 'subasta' && ahora.todosPasaron) {
      anunciado = T.cuatrola.todosPasaron;
    } else if (previa.fase === 'subasta' && ahora.fase === 'triunfo') {
      anunciado = T.cuatrola.juega(nombre(ahora.jugador!), ahora.modalidad!);
    } else if (previa.fase === 'subasta' && quien !== sesion.asiento) {
      const dicho = ahora.dichos[quien];
      anunciado =
        dicho === 'paso'
          ? T.cuatrola.pasa(nombre(quien))
          : dicho
            ? T.cuatrola.pujaAviso(nombre(quien), dicho)
            : null;
    } else if (previa.fase === 'triunfo' && ahora.triunfo !== null) {
      anunciado = T.cuatrola.eligio(
        nombre(quien),
        ahora.triunfo,
        ahora.llamada === null ? null : carta(ahora.llamada),
      );
    } else if (ahora.mesa.length > 0) {
      anunciado = null;
    }
  });

  const enPausa = $derived(sesion.bloqueada && sesion.pensando === null);
  const aviso = $derived(enPausa && vista.mesa.length <= 1 ? anunciado : null);

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
  jugar={(c) => sesion.jugar({ tipo: 'jugar', carta: c })}
  {aviso}
  {nombre}
  {detalle}
>
  {#snippet info()}
    {#if vista.jugador === null || vista.modalidad === null}
      <span data-testid="modalidad">{T.cuatrola.sinPuja}</span>
    {:else}
      <b class="modalidad" data-testid="modalidad">
        {T.cuatrola.juega(nombre(vista.jugador), vista.modalidad)}
      </b>
    {/if}
    <span data-testid="triunfo">
      {T.cuatrola.triunfo}:
      {#if vista.triunfo === null}
        {T.cuatrola.sinTriunfo}
      {:else}
        <b class="triunfo">{vista.triunfo}</b>
      {/if}
    </span>
    {#if vista.llamada !== null}
      <span data-testid="llamada">{T.cuatrola.llama(carta(vista.llamada))}</span>
      {#if vista.companero === sesion.asiento}
        <b class="companero" data-testid="eres-companero">{T.cuatrola.eresCompanero}</b>
      {:else if vista.companero !== null}
        <span data-testid="companero">{T.cuatrola.companero(nombre(vista.companero))}</span>
      {/if}
    {/if}
    {#if vista.fase === 'bazas'}
      <span data-testid="bazas-bando">{T.cuatrola.bazasBando(bandos.jugador, bandos.defensores)}</span>
    {/if}
    <span data-testid="mano-cuatrola">
      {T.cuatrola.mano(Math.min(vista.numeroMano + 1, vista.config.manos), vista.config.manos)}
    </span>
  {/snippet}

  {#snippet acciones(cancelar: () => void)}
    {#if palos.length > 0 && paloElegido === null}
      <div class="decision" role="group" aria-label={T.cuatrola.eligeTriunfo}>
        <span class="pregunta">{T.cuatrola.eligeTriunfo}</span>
        {#each palos as palo (palo)}
          <button
            class="principal"
            data-testid="triunfo-{palo}"
            onclick={() => elegirPalo(palo, cancelar)}>{T.cuatrola.palo(palo)}</button
          >
        {/each}
      </div>
    {:else if llamables.length > 0}
      <div class="decision" role="group" aria-label={T.cuatrola.eligeLlamada}>
        <span class="pregunta">{T.cuatrola.eligeLlamada}</span>
        {#each llamables as a (a.llamada)}
          <button
            class="principal"
            data-testid="llamar-{a.llamada}"
            onclick={() => {
              cancelar();
              sesion.jugar(a);
            }}>{nombreCarta(a.llamada!)}</button
          >
        {/each}
        <button data-testid="otro-palo" onclick={() => (paloElegido = null)}>
          {T.cuatrola.triunfo}: {paloElegido}
        </button>
      </div>
    {/if}
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
      <h2 id="titulo-subasta">{T.cuatrola.subasta}</h2>
      <p class="nota">{T.cuatrola.tuTurno(vista.modalidad)}</p>
      <div class="mano-subasta" aria-hidden="true">
        {#each vista.miMano ?? [] as id (id)}
          <span class="mini"><Carta {id} /></span>
        {/each}
      </div>
      <ul class="dichos">
        {#each [0, 1, 2, 3].filter((a) => a !== sesion.asiento) as a (a)}
          <li>{nombre(a)}: {T.cuatrola.detalle(vista.dichos[a] ?? null, vista.fichas[a] ?? 0)}</li>
        {/each}
      </ul>
      <div class="pujas">
        <button data-testid="pasar" onclick={() => sesion.jugar({ tipo: 'pasar' })}>
          {T.cuatrola.paso}
        </button>
        {#if puedoRey}
          <button
            class="principal"
            data-testid="pujar-rey"
            onclick={() => sesion.jugar({ tipo: 'pujar', modalidad: 'rey' })}
            >{T.cuatrola.conRey}</button
          >
        {/if}
        <button
          class="principal"
          data-testid="pujar-solo"
          onclick={() => sesion.jugar({ tipo: 'pujar', modalidad: 'solo' })}
          >{T.cuatrola.solo}</button
        >
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
      <h2 id="fin-mano">{T.cuatrola.finMano(resumen + 1)}</h2>
      <ResumenCuatrola resultado={vista.resultadosManos[resumen]!} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.cuatrola.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .triunfo {
    color: var(--acento);
    text-transform: capitalize;
  }

  .modalidad,
  .companero {
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

  .pujas {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 6px;
  }

  .dialogo > .principal {
    margin-top: 14px;
    width: 100%;
  }
</style>
