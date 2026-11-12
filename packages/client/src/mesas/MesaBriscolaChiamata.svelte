<script lang="ts">
  import {
    cartaDeNivel,
    fuerza,
    paloDe,
    puntosDeNivel,
    nivelDePuntos,
    type AccionBriscolaChiamata,
    type Asiento,
    type ConfigBriscolaChiamata,
    type EstadoBriscolaChiamata,
    type IdCarta,
    type PaloEspanol,
    type VistaBriscolaChiamata,
  } from '@juegos/engine';
  import { nombreCarta } from '../cartas/dibujo';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenBriscolaChiamata from './ResumenBriscolaChiamata.svelte';

  interface Props {
    sesion: SesionMesa<
      ConfigBriscolaChiamata,
      EstadoBriscolaChiamata,
      AccionBriscolaChiamata,
      VistaBriscolaChiamata
    >;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 5;
  const PALOS: readonly PaloEspanol[] = ['oros', 'copas', 'espadas', 'bastos'];
  /** Primer nivel de las pujas de puntos («2 con 62»). */
  const PRIMERA_DE_PUNTOS = 10;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);

  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, JUGADORES, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);
  const detalle = (asiento: Asiento) => {
    const marcas: string[] = [];
    if (asiento === vista.repartidor) marcas.push(T.briscolaChiamata.reparte);
    if (vista.fase === 'subasta') {
      const p = vista.pujas[asiento];
      if (p !== null && p !== undefined) marcas.push(T.briscolaChiamata.dicho(p));
    } else if (asiento === vista.llamador) marcas.push(T.briscolaChiamata.llama);
    if (vista.companero === asiento && asiento !== vista.llamador)
      marcas.push(T.briscolaChiamata.companero);
    marcas.push(T.briscolaChiamata.puntosAsiento(vista.puntosMano[asiento]!, vista.marcador[asiento]!));
    return marcas.join(' · ');
  };

  // ── Cartas ─────────────────────────────────────────────────────────────────

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => a.tipo === 'jugarCarta' && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  function jugar(carta: IdCarta) {
    const accion = accionDe(carta);
    if (accion) sesion.jugar(accion);
  }

  /** La mano por palos (el triunfo, si lo hay, primero) y de mayor a menor. */
  const manoOrdenada = $derived.by(() => {
    const orden = vista.triunfo ? [vista.triunfo, ...PALOS.filter((p) => p !== vista.triunfo)] : PALOS;
    return [...(vista.miMano ?? [])].sort(
      (a, b) => orden.indexOf(paloDe(a)) - orden.indexOf(paloDe(b)) || fuerza(b) - fuerza(a),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    config: { jugadores: JUGADORES },
    miMano: manoOrdenada,
    cartasEnMano: vista.cartasEnMano,
    mazo: 0,
    muestra: null,
    mesa: vista.mesa,
    turno: vista.turno,
    bazas: [0, 0, 0, 0, 0],
    ultimaBaza: vista.ultimaBaza,
    resultadosManos: [],
  });

  // ── Subasta y llamada ──────────────────────────────────────────────────────

  const pujas = $derived(
    legales.filter(
      (a): a is Extract<AccionBriscolaChiamata, { tipo: 'pujar' }> => a.tipo === 'pujar',
    ),
  );
  const pujasDeCarta = $derived(pujas.filter((a) => a.nivel < PRIMERA_DE_PUNTOS));
  const pujasDePuntos = $derived(pujas.filter((a) => a.nivel >= PRIMERA_DE_PUNTOS));
  const puedePasar = $derived(legales.some((a) => a.tipo === 'pasar'));
  const llamadas = $derived(
    legales.filter(
      (a): a is Extract<AccionBriscolaChiamata, { tipo: 'llamar' }> => a.tipo === 'llamar',
    ),
  );

  /** Los puntos elegidos para la puja de puntos (entre la mínima legal y 120). */
  let puntosElegidos = $state(62);
  const minimoPuntos = $derived(
    pujasDePuntos.length > 0 ? puntosDeNivel(pujasDePuntos[0]!.nivel) : 62,
  );
  $effect(() => {
    if (puntosElegidos < minimoPuntos) puntosElegidos = minimoPuntos;
  });
  const pujaPuntos = $derived(
    pujasDePuntos.find((a) => a.nivel === nivelDePuntos(puntosElegidos)) ?? null,
  );

  function hacer(accion: AccionBriscolaChiamata, cancelar: () => void) {
    cancelar();
    sesion.jugar(accion);
  }

  // ── Información ────────────────────────────────────────────────────────────

  const textoPuja = $derived(
    vista.nivel === null || vista.llamador === null
      ? T.briscolaChiamata.sinPuja
      : T.briscolaChiamata.puja(
          T.briscolaChiamata.nombrePuja(vista.nivel),
          nombre(vista.llamador),
          vista.nivel < PRIMERA_DE_PUNTOS ? puntosDeNivel(vista.nivel) : null,
        ),
  );
  const textoLlamada = $derived(
    vista.llamada === null
      ? T.briscolaChiamata.porLlamar
      : `${nombreCarta(vista.llamada)} (${T.briscolaChiamata.triunfo(T.cartas.palos[vista.triunfo!] ?? vista.triunfo!)})`,
  );
  const textoCompanero = $derived.by(() => {
    if (vista.llamada === null) return null;
    if (vista.solo) return T.briscolaChiamata.solo;
    if (vista.companero === null) return T.briscolaChiamata.companeroOculto;
    if (vista.companero === yo) return T.briscolaChiamata.companeroTu;
    return T.briscolaChiamata.companeroDe(nombre(vista.companero));
  });

  const aviso = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return null;
    const mio = vista.turno === yo;
    switch (vista.fase) {
      case 'subasta':
        // En su turno, los botones de las pujas ya lo dicen (y el aviso los taparía).
        return mio ? null : T.briscolaChiamata.pujando(nombre(vista.turno));
      case 'llamada':
        return mio ? null : T.briscolaChiamata.llamando(nombre(vista.turno));
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

<MesaBazas vista={vistaMesa} {sesion} {jugable} {jugar} {nombre} {detalle} {aviso}>
  {#snippet info()}
    <span data-testid="puja-chiamata">{textoPuja}</span>
    <span data-testid="llamada-chiamata">{T.briscolaChiamata.llamada}: <b>{textoLlamada}</b></span>
    {#if textoCompanero}
      <span data-testid="companero-chiamata">{textoCompanero}</span>
    {/if}
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if miTurno && (pujas.length > 0 || llamadas.length > 0)}
      <div class="decision" data-testid="panel-chiamata">
        {#if pujasDeCarta.length > 0}
          <div class="pujas" role="group" aria-label={T.briscolaChiamata.subasta}>
            {#each pujasDeCarta as a (a.nivel)}
              <button
                class="principal"
                data-accion={a.tipo}
                data-jugada={JSON.stringify(a)}
                data-testid="puja-{a.nivel}"
                onclick={() => hacer(a, cancelar)}>{T.briscolaChiamata.nombrePuja(a.nivel)}</button
              >
            {/each}
          </div>
        {/if}
        {#if pujasDePuntos.length > 0}
          <div class="puntos" role="group" aria-label={T.briscolaChiamata.pujarPuntos(puntosElegidos)}>
            <button
              aria-label={T.briscolaChiamata.puntosMenos}
              data-testid="puntos-menos"
              disabled={puntosElegidos <= minimoPuntos}
              onclick={() => (puntosElegidos = Math.max(minimoPuntos, puntosElegidos - 1))}>−</button
            >
            <button
              class="principal"
              data-accion="pujar"
              data-jugada={pujaPuntos ? JSON.stringify(pujaPuntos) : undefined}
              data-testid="pujar-puntos"
              disabled={pujaPuntos === null}
              onclick={() => pujaPuntos && hacer(pujaPuntos, cancelar)}
              >{T.briscolaChiamata.pujarPuntos(puntosElegidos)}</button
            >
            <button
              aria-label={T.briscolaChiamata.puntosMas}
              data-testid="puntos-mas"
              disabled={puntosElegidos >= 120}
              onclick={() => (puntosElegidos = Math.min(120, puntosElegidos + 1))}>+</button
            >
          </div>
        {/if}
        {#if puedePasar}
          <button
            data-accion="pasar"
            data-jugada={JSON.stringify({ tipo: 'pasar' })}
            data-testid="pasar"
            onclick={() => hacer({ tipo: 'pasar' }, cancelar)}>{T.briscolaChiamata.pasar}</button
          >
        {/if}
        {#if llamadas.length > 0}
          <p class="pregunta">{T.briscolaChiamata.llamaTu}</p>
          {#each llamadas as a (a.palo)}
            <button
              class="principal"
              data-accion={a.tipo}
              data-jugada={JSON.stringify(a)}
              data-testid="llamar-{a.palo}"
              onclick={() => hacer(a, cancelar)}
              >{nombreCarta(`${a.palo}-${cartaDeNivel(vista.nivel!)}` as IdCarta)}</button
            >
          {/each}
        {/if}
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.briscolaChiamata.finMano(resumen + 1)}</h2>
      <ResumenBriscolaChiamata resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.briscolaChiamata.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .decision {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .decision button {
    min-height: 36px;
    padding: 2px 12px;
  }

  .pujas {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 4px;
    width: min(100%, 360px);
  }

  .pujas button {
    min-width: 0;
    padding-inline: 0;
  }

  .puntos {
    display: flex;
    gap: 4px;
  }

  .puntos button:not(.principal) {
    width: 40px;
    padding-inline: 0;
  }

  .pregunta {
    width: 100%;
    margin: 0;
    text-align: center;
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
