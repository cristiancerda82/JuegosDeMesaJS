<script lang="ts">
  import type {
    AccionJulepe,
    Asiento,
    ConfigJulepe,
    EstadoJulepe,
    IdCarta,
    VistaJulepe,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenJulepe from './ResumenJulepe.svelte';

  interface Props {
    sesion: SesionMesa<ConfigJulepe, EstadoJulepe, AccionJulepe, VistaJulepe>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'carta' && a.carta === carta);
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, sesion.asiento, sesion.red, T.julepe.rivalN);
  const detalle = (asiento: Asiento) =>
    T.julepe.detalle(
      vista.juega[asiento] ?? null,
      vista.bazas[asiento] ?? 0,
      vista.fichas[asiento] ?? 0,
      vista.fase === 'jugar' && vista.bazasJugadas.length === 0 && vista.mesa.length === 0
        ? (vista.cambios[asiento] ?? null)
        : null,
      vista.eliminados[asiento] ?? false,
    );
  const cartaVisible = (asiento: Asiento) =>
    asiento === vista.repartidor ? vista.cartaTriunfo : null;

  const puedeDecidir = $derived(legales.some((a) => a.tipo === 'jugar'));
  const puedePasar = $derived(legales.some((a) => a.tipo === 'pasar'));
  const puedoDescartar = $derived(legales.some((a) => a.tipo === 'descartar'));

  /** La última baza se ve hasta que empieza a decidirse la mano siguiente. */
  const vistaMesa: VistaBazas = $derived({
    ...vista,
    ultimaBaza:
      vista.fase === 'jugar' || vista.juega.every((j) => j === null) ? vista.ultimaBaza : null,
    resultadosManos: [],
  });

  // ── Descarte ───────────────────────────────────────────────────────────────

  let marcadas: IdCarta[] = $state([]);
  $effect(() => {
    if (!puedoDescartar) marcadas = [];
  });

  function marcar(id: IdCarta) {
    if (marcadas.includes(id)) marcadas = marcadas.filter((c) => c !== id);
    else if (marcadas.length < vista.mazo) marcadas = [...marcadas, id];
  }

  function descartar() {
    const clave = [...marcadas].sort().join();
    const accion = legales.find(
      (a) => a.tipo === 'descartar' && [...a.cartas].sort().join() === clave,
    );
    if (accion) sesion.jugar(accion);
  }

  // ── Avisos de lo que deciden los demás ─────────────────────────────────────

  let anunciado: string | null = $state(null);
  let antes: VistaJulepe | null = null;
  $effect(() => {
    const ahora = vista;
    const previa = antes;
    antes = ahora;
    if (previa === null || previa.turno === null) return;
    const quien = previa.turno;
    const r = ahora.resultadosManos.at(-1);
    if (ahora.resultadosManos.length > previa.resultadosManos.length && r?.nadieJugo) {
      anunciado = T.julepe.nadieJuega(nombre(r.repartidor));
    } else if (previa.fase === 'decidir') {
      anunciado =
        quien === sesion.asiento
          ? null
          : ahora.juega[quien] === false
            ? T.julepe.pasa(nombre(quien))
            : T.julepe.juega(nombre(quien));
    } else if (previa.fase === 'descartar' && ahora.cambios[quien] !== previa.cambios[quien]) {
      anunciado = quien === sesion.asiento ? null : T.julepe.cambia(nombre(quien), ahora.cambios[quien] ?? 0);
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
  jugar={(carta) => sesion.jugar({ tipo: 'carta', carta })}
  {cartaVisible}
  {aviso}
  {nombre}
  {detalle}
>
  {#snippet info()}
    <span>{T.julepe.triunfo}: <b class="triunfo">{vista.triunfo}</b></span>
    <b class="bote" data-testid="bote">{T.julepe.bote(vista.bote)}</b>
    <span data-testid="mano-julepe">
      {T.julepe.mano(Math.min(vista.numeroMano + 1, vista.config.manos), vista.config.manos)}
    </span>
  {/snippet}

  {#snippet acciones(cancelar: () => void)}
    {#if puedeDecidir && vista.fase === 'decidir'}
      <div class="decision" role="group" aria-label={T.julepe.decidir}>
        <button
          class="principal"
          data-testid="julepe-jugar"
          onclick={() => {
            cancelar();
            sesion.jugar({ tipo: 'jugar' });
          }}>{T.julepe.juego}</button
        >
        {#if puedePasar}
          <button
            data-testid="julepe-pasar"
            onclick={() => {
              cancelar();
              sesion.jugar({ tipo: 'pasar' });
            }}>{T.julepe.paso}</button
          >
        {:else}
          <span class="obligado" data-testid="obligado">{T.julepe.obligado}</span>
        {/if}
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if puedoDescartar && resumen === null && sesion.fin === null}
  <div class="velo descarte">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="titulo-descarte" data-testid="panel-descarte">
      <h2 id="titulo-descarte">{T.julepe.marcaCambio}</h2>
      <p class="nota">{T.julepe.mazo(vista.mazo)}</p>
      <div class="cartas-descarte">
        {#each vista.miMano ?? [] as id (id)}
          <button
            class="carta-descarte"
            class:marcada={marcadas.includes(id)}
            data-testid="descarte-{id}"
            aria-pressed={marcadas.includes(id)}
            onclick={() => marcar(id)}
          >
            <Carta {id} />
          </button>
        {/each}
      </div>
      <button class="principal" data-testid="descartar" onclick={descartar}>
        {T.julepe.cambiar(marcadas.length)}
      </button>
    </div>
  </div>
{/if}

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.julepe.finMano(resumen + 1)}</h2>
      <ResumenJulepe resultado={vista.resultadosManos[resumen]!} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.julepe.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .triunfo {
    color: var(--acento);
    text-transform: capitalize;
  }

  .bote {
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

  .obligado {
    font-size: 0.85rem;
    color: var(--texto-suave);
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

  /* El descarte deja libre la cabecera: el menú y la guía siguen a mano. */
  .velo.descarte {
    top: 60px;
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
    font-size: 1.1rem;
    margin-bottom: 6px;
  }

  .nota {
    margin: 0 0 10px;
    font-size: 0.85rem;
    color: var(--texto-suave);
  }

  .cartas-descarte {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px 4px;
  }

  .carta-descarte {
    display: block;
    width: min(16vw, 64px);
    aspect-ratio: 100 / 140;
    padding: 0;
    border: none;
    border-radius: 7%;
    background: none;
    transition: translate 120ms;
  }

  .carta-descarte.marcada {
    translate: 0 -8px;
    outline: 3px solid var(--resalte);
  }

  .dialogo > button {
    margin-top: 14px;
    width: 100%;
  }
</style>
