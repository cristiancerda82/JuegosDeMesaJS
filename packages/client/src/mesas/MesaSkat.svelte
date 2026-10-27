<script lang="ts">
  import {
    paloSkat,
    rangoSkat,
    siguienteValorSkat,
    type AccionSkat,
    type AnuncioSkat,
    type Asiento,
    type ConfigSkat,
    type EstadoSkat,
    type IdCarta,
    type JuegoSkat,
    type VistaSkat,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import Carta from '../cartas/Carta.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenSkat from './ResumenSkat.svelte';

  interface Props {
    sesion: SesionMesa<ConfigSkat, EstadoSkat, AccionSkat, VistaSkat>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 3;
  const PALOS = ['treboles', 'picas', 'corazones', 'diamantes'] as const;
  const JUEGOS: readonly JuegoSkat[] = [...PALOS, 'grand', 'nulo'];
  const ANUNCIOS: readonly AnuncioSkat[] = ['ninguno', 'schneider', 'schwarz', 'ouvert'];

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => (a.tipo === 'jugar' || a.tipo === 'descartar') && a.carta === carta) ??
    null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, JUGADORES, yo, sesion.red);
  const detalle = (asiento: Asiento) => {
    const marcas: string[] = [];
    if (asiento === vista.solista) marcas.push(T.skat.solista);
    if (asiento === vista.repartidor) marcas.push(T.skat.reparte);
    marcas.push(T.skat.puntosPartida(vista.puntos[asiento] ?? 0));
    return marcas.join(' · ');
  };

  /** La mano por palos efectivos (el triunfo primero) y por orden. */
  const manoOrdenada = $derived.by(() => {
    const juego = vista.juego;
    const orden = ['triunfo', ...PALOS];
    return [...(vista.miMano ?? [])].sort(
      (a, b) =>
        orden.indexOf(paloSkat(a, juego)) - orden.indexOf(paloSkat(b, juego)) ||
        rangoSkat(b, juego) - rangoSkat(a, juego),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    mazo: 0,
    muestra: null,
    resultadosManos: [],
  });

  // ── Subasta, Skat y declaración ────────────────────────────────────────────

  const puede = (tipo: AccionSkat['tipo']) => legales.some((a) => a.tipo === tipo);
  const valorPuja = $derived(
    vista.subasta.tramo === 3 ? 18 : (siguienteValorSkat(vista.subasta.valor) ?? 0),
  );
  /** Al jugar de mano: el anuncio elegido antes de pulsar el juego. */
  let deMano = $state(false);
  let anuncio: AnuncioSkat = $state('ninguno');
  $effect(() => {
    if (vista.fase !== 'skat') {
      deMano = false;
      anuncio = 'ninguno';
    }
  });

  const declaracion = (juego: JuegoSkat, a: AnuncioSkat) =>
    legales.find((x) => x.tipo === 'declarar' && x.juego === juego && x.anuncio === a) ?? null;

  function hacer(accion: AccionSkat | null, cancelar: () => void) {
    if (accion === null) return;
    cancelar();
    sesion.jugar(accion);
  }

  const nombreJuego = (juego: JuegoSkat) => T.skat.juego(juego);

  const aviso = $derived.by(() => {
    if (vista.fase === 'descarte' && vista.turno === yo) return T.skat.descartate;
    const hecha = vista.ultimaAccion;
    if (hecha === null || sesion.fin !== null) return null;
    const a = hecha.accion;
    const quien = nombre(hecha.asiento);
    switch (a.tipo) {
      case 'pujar':
        return T.skat.puja(quien, hecha.valor ?? vista.puja);
      case 'aceptar':
        return T.skat.acepta(quien, hecha.valor ?? 0);
      case 'pasar':
        return vista.fase === 'subasta' ? T.skat.pasa(quien) : null;
      case 'cogerSkat':
        return T.skat.cogeSkat(quien);
      case 'descartar':
        return T.skat.seDescarta(quien);
      case 'declarar':
        return T.skat.declara(quien, nombreJuego(a.juego), !vista.cogioSkat, a.anuncio);
      default:
        return null;
    }
  });

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
  jugar={(carta) => {
    const accion = accionDe(carta);
    if (accion) sesion.jugar(accion);
  }}
  {nombre}
  {detalle}
  {aviso}
>
  {#snippet info()}
    {#if vista.fase === 'subasta'}
      <span class="juego" data-testid="subasta">
        {T.skat.subasta(nombre(vista.subasta.pujador), nombre(vista.subasta.escucha), vista.subasta.valor, vista.subasta.tramo)}
      </span>
    {:else if vista.solista !== null}
      <span class="juego" data-testid="juego">
        {vista.juego === null
          ? T.skat.eligiendo(nombre(vista.solista), vista.puja)
          : T.skat.juegaSolista(nombre(vista.solista), nombreJuego(vista.juego), !vista.cogioSkat, vista.anuncio, vista.puja)}
      </span>
      {#if vista.fase === 'bazas'}
        <span class="bandos" data-testid="bandos">{T.skat.bandos(vista.puntosBazas[0], vista.puntosBazas[1])}</span>
      {/if}
    {/if}
    {#if vista.manoOuvert && vista.solista !== null && vista.solista !== yo}
      <span class="ouvert" data-testid="mano-ouvert">
        {T.skat.cartasDe(nombre(vista.solista))}
        {#each vista.manoOuvert as c (c)}
          <span class="mini"><Carta id={c} /></span>
        {/each}
      </span>
    {/if}
    {#if vista.skat && vista.skat.length > 0 && vista.fase !== 'bazas'}
      <span class="ouvert" data-testid="mi-skat">
        {T.skat.tuSkat}
        {#each vista.skat as c (c)}
          <span class="mini"><Carta id={c} /></span>
        {/each}
      </span>
    {/if}
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if sesion.fin === null && !sesion.bloqueada && vista.turno === yo}
      <div class="decisiones">
        {#if vista.fase === 'subasta'}
          {#if puede('pujar')}
            <button class="principal" data-testid="pujar" onclick={() => hacer({ tipo: 'pujar' }, cancelar)}>
              {vista.subasta.tramo === 3 ? T.skat.jugarCon(valorPuja) : String(valorPuja)}
            </button>
          {/if}
          {#if puede('aceptar')}
            <button class="principal" data-testid="aceptar" onclick={() => hacer({ tipo: 'aceptar' }, cancelar)}>
              {T.skat.si(vista.subasta.valor)}
            </button>
          {/if}
          <button data-testid="paso" onclick={() => hacer({ tipo: 'pasar' }, cancelar)}>{T.skat.paso}</button>
        {:else if vista.fase === 'skat' && !deMano}
          <button class="principal" data-testid="coger-skat" onclick={() => hacer({ tipo: 'cogerSkat' }, cancelar)}>
            {T.skat.cogerSkat}
          </button>
          <button data-testid="de-mano" onclick={() => (deMano = true)}>{T.skat.deMano}</button>
        {:else if vista.fase === 'skat' || vista.fase === 'declarar'}
          {#if vista.fase === 'skat'}
            <div class="anuncios" role="radiogroup" aria-label={T.skat.anuncio}>
              {#each ANUNCIOS as a (a)}
                <button
                  role="radio"
                  aria-checked={anuncio === a}
                  class:elegido={anuncio === a}
                  data-testid="anuncio-{a}"
                  onclick={() => (anuncio = a)}>{T.skat.nombreAnuncio(a)}</button
                >
              {/each}
            </div>
          {/if}
          {#each JUEGOS as j (j)}
            {@const accion = declaracion(j, vista.fase === 'skat' ? anuncio : 'ninguno')}
            <button
              class="principal"
              disabled={accion === null}
              data-testid="declarar-{j}"
              onclick={() => hacer(accion, cancelar)}>{nombreJuego(j)}</button
            >
          {/each}
          {#if vista.fase === 'declarar'}
            <button data-testid="declarar-nulo-ouvert" onclick={() => hacer(declaracion('nulo', 'ouvert'), cancelar)}>
              {T.skat.nuloOuvert}
            </button>
          {/if}
        {/if}
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.skat.finMano(resumen + 1)}</h2>
      <ResumenSkat resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.skat.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .juego {
    font-weight: 700;
    color: var(--acento);
  }

  .bandos {
    color: var(--texto-suave);
  }

  .ouvert {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px;
  }

  .mini {
    width: 22px;
    aspect-ratio: 100 / 140;
  }

  .decisiones,
  .anuncios {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .anuncios {
    width: 100%;
  }

  .decisiones button {
    min-height: 40px;
    padding: 4px 10px;
  }

  .anuncios button.elegido {
    outline: 2px solid var(--acento);
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

  .dialogo > button {
    margin-top: 10px;
    width: 100%;
  }
</style>
