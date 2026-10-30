<script lang="ts">
  import {
    esTriunfoDoppelkopf,
    fuerzaDoppelkopf,
    nivelAnuncioDoppelkopf,
    paloDoppelkopf,
    type AccionDoppelkopf,
    type Asiento,
    type ConfigDoppelkopf,
    type EstadoDoppelkopf,
    type IdCarta,
    type VistaDoppelkopf,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenDoppelkopf from './ResumenDoppelkopf.svelte';

  interface Props {
    sesion: SesionMesa<ConfigDoppelkopf, EstadoDoppelkopf, AccionDoppelkopf, VistaDoppelkopf>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 4;
  const PALOS = ['treboles', 'picas', 'corazones', 'diamantes'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => a.tipo === 'jugar' && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, JUGADORES, yo, sesion.red, T.brisca.rivalN);

  /** El último anuncio de un asiento, si ha anunciado. */
  const anuncioDe = (asiento: Asiento) => {
    const ultimo = vista.anuncios.filter((x) => x.asiento === asiento).at(-1);
    return ultimo ? T.doppelkopf.anuncio(ultimo.bando, ultimo.nivel) : null;
  };

  const detalle = (asiento: Asiento) => {
    const partes: string[] = [];
    if (asiento === vista.repartidor) partes.push(T.doppelkopf.reparte);
    if (vista.fase === 'reservas') {
      const r = vista.reservas[asiento];
      if (r) partes.push(T.doppelkopf.reserva[r]);
    } else {
      const bando = vista.bandos[asiento];
      if (bando) partes.push(T.doppelkopf.bando[bando]);
      const anuncio = anuncioDe(asiento);
      if (anuncio && anuncio !== T.doppelkopf.bando[bando ?? 're']) partes.push(`«${anuncio}»`);
      partes.push(T.doppelkopf.bazas(vista.bazas.filter((b) => b.ganador === asiento).length));
    }
    return partes.join(' · ');
  };

  /** La mano con los triunfos primero, de mayor a menor, y después cada palo. */
  const manoOrdenada = $derived.by(() => {
    const juego = vista.juego;
    const grupo = (c: IdCarta) =>
      esTriunfoDoppelkopf(c, juego) ? -1 : PALOS.indexOf(paloDoppelkopf(c) as (typeof PALOS)[number]);
    return [...(vista.miMano ?? [])].sort(
      (a, b) => grupo(a) - grupo(b) || fuerzaDoppelkopf(b, juego) - fuerzaDoppelkopf(a, juego),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    config: { jugadores: JUGADORES },
    miMano: manoOrdenada,
    mazo: 0,
    muestra: null,
    rotuloMuestra: null,
    bazas: Array.from({ length: JUGADORES }, (_, a) => vista.bazas.filter((b) => b.ganador === a).length),
    ultimaBaza: vista.bazas.at(-1) ?? null,
    resultadosManos: [],
  });

  // ── Reservas y anuncios ────────────────────────────────────────────────────

  const activo = $derived(legales.length > 0 && sesion.fin === null && !sesion.bloqueada);
  const reservas = $derived(
    activo && vista.fase === 'reservas'
      ? legales.flatMap((a) => (a.tipo === 'reservar' ? [a.reserva] : []))
      : [],
  );
  const miBando = $derived(vista.bandos[yo] ?? null);
  const anuncio = $derived.by(() => {
    if (!activo || !legales.some((a) => a.tipo === 'anunciar') || miBando === null) return null;
    return T.doppelkopf.anuncio(miBando, nivelAnuncioDoppelkopf(vista.anuncios, miBando) + 1);
  });

  const tipoJuego = $derived.by(() => {
    if (vista.fase === 'reservas') return T.doppelkopf.reservas;
    if (vista.juego === 'normal') return T.doppelkopf.juegoNormal;
    const quien = nombre(vista.solista!);
    if (vista.juego === 'boda') {
      if (vista.pareja !== null) return T.doppelkopf.bodaCon(quien, nombre(vista.pareja));
      return vista.bazaPareja !== null ? T.doppelkopf.bodaSola(quien) : T.doppelkopf.boda(quien);
    }
    return T.doppelkopf.solo(vista.juego, quien);
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
>
  {#snippet info()}
    <span class="juego" data-testid="tipo-juego">{tipoJuego}</span>
    <span data-testid="mano-ronda">{T.doppelkopf.manoRonda(vista.manoNumero, vista.config.manos)}</span>
    {#if miBando}<span data-testid="mi-bando">{T.doppelkopf.tuBando(miBando)}</span>{/if}
    <span data-testid="marcador">{T.doppelkopf.tusPuntos(vista.puntos[yo] ?? 0)}</span>
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if reservas.length > 0}
      <div class="decisiones">
        {#each reservas as r (r)}
          <button
            class:principal={r !== 'sano'}
            data-testid="reserva-{r}"
            onclick={() => {
              cancelar();
              sesion.jugar({ tipo: 'reservar', reserva: r });
            }}>{T.doppelkopf.reserva[r]}</button
          >
        {/each}
      </div>
    {:else if anuncio}
      <div class="decisiones">
        <button
          class="principal"
          data-testid="anunciar"
          onclick={() => {
            cancelar();
            sesion.jugar({ tipo: 'anunciar' });
          }}>{T.doppelkopf.anunciar(anuncio)}</button
        >
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.doppelkopf.finMano(resumen + 1)}</h2>
      <ResumenDoppelkopf resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.doppelkopf.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .juego {
    font-weight: 700;
    color: var(--acento);
  }

  .decisiones {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .decisiones button {
    min-height: 40px;
    padding: 4px 12px;
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
