<script lang="ts">
  import {
    esTriunfoSchafkopf,
    fuerzaSchafkopf,
    paloSchafkopf,
    PALOS_LLAMABLES_SCHAFKOPF,
    type AccionSchafkopf,
    type Asiento,
    type ConfigSchafkopf,
    type ContratoSchafkopf,
    type EstadoSchafkopf,
    type IdCarta,
    type VistaSchafkopf,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenSchafkopf from './ResumenSchafkopf.svelte';

  interface Props {
    sesion: SesionMesa<ConfigSchafkopf, EstadoSchafkopf, AccionSchafkopf, VistaSchafkopf>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 4;
  const PALOS = ['treboles', 'picas', 'corazones', 'diamantes'] as const;
  /** Para ordenar la mano mientras no hay contrato: los triunfos del Rufspiel. */
  const RUFSPIEL: ContratoSchafkopf = { tipo: 'rufspiel', palo: 'picas' };

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => a.tipo === 'jugar' && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, JUGADORES, yo, sesion.red, T.brisca.rivalN);

  const detalle = (asiento: Asiento) => {
    const partes: string[] = [];
    if (asiento === vista.repartidor) partes.push(T.schafkopf.reparte);
    if (vista.fase === 'anuncio') {
      const anuncio = vista.anuncios.find((x) => x.asiento === asiento);
      if (anuncio) {
        partes.push(anuncio.contrato ? T.schafkopf.contrato(anuncio.contrato) : T.schafkopf.paso);
      }
    } else {
      if (asiento === vista.jugador) partes.push(T.schafkopf.juegaCorto);
      else if (asiento === vista.companero) partes.push(T.schafkopf.companeroCorto);
      partes.push(T.schafkopf.bazas(vista.bazas[asiento] ?? 0));
      partes.push(T.schafkopf.puntos(vista.puntosMano[asiento] ?? 0));
    }
    return partes.join(' · ');
  };

  /** La mano con los triunfos primero, de mayor a menor, y después cada palo. */
  const manoOrdenada = $derived.by(() => {
    const contrato = vista.contrato ?? RUFSPIEL;
    const grupo = (c: IdCarta) =>
      esTriunfoSchafkopf(c, contrato) ? -1 : PALOS.indexOf(paloSchafkopf(c) as (typeof PALOS)[number]);
    return [...(vista.miMano ?? [])].sort(
      (a, b) => grupo(a) - grupo(b) || fuerzaSchafkopf(b, contrato) - fuerzaSchafkopf(a, contrato),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    config: { jugadores: JUGADORES },
    miMano: manoOrdenada,
    mazo: 0,
    muestra: null,
    rotuloMuestra: null,
    resultadosManos: [],
  });

  // ── Anuncio del contrato ───────────────────────────────────────────────────

  const activo = $derived(
    vista.fase === 'anuncio' && legales.length > 0 && sesion.fin === null && !sesion.bloqueada,
  );
  const clave = (c: ContratoSchafkopf) => `${c.tipo}-${'palo' in c ? c.palo : ''}`;
  const posibles = $derived(
    new Set(legales.flatMap((a) => (a.tipo === 'anunciar' ? [clave(a.contrato)] : []))),
  );
  const fila1: ContratoSchafkopf[] = [
    ...PALOS_LLAMABLES_SCHAFKOPF.map((palo) => ({ tipo: 'rufspiel', palo }) as const),
    { tipo: 'wenz' },
  ];
  const fila2: ContratoSchafkopf[] = PALOS.map((palo) => ({ tipo: 'solo', palo }) as const);
  const testid = (c: ContratoSchafkopf) => ('palo' in c ? `${c.tipo}-${c.palo}` : c.tipo);

  const tipoJuego = $derived.by(() => {
    if (vista.fase === 'anuncio' || vista.contrato === null || vista.jugador === null) {
      return T.schafkopf.anunciando;
    }
    return T.schafkopf.juega(nombre(vista.jugador), T.schafkopf.contrato(vista.contrato));
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
    {#if vista.fase === 'bazas' && vista.contrato}
      <span data-testid="triunfo">{T.schafkopf.triunfo(vista.contrato)}</span>
    {/if}
    {#if vista.companero !== null}
      <span data-testid="companero">
        {vista.companero === yo ? T.schafkopf.eresCompanero : T.schafkopf.companero(nombre(vista.companero))}
      </span>
    {/if}
    <span data-testid="mano-ronda">{T.schafkopf.manoDe(vista.manoNumero, vista.config.manos)}</span>
    <span data-testid="marcador">{T.schafkopf.tusFichas(vista.fichas[yo] ?? 0)}</span>
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if activo}
      <div class="anuncio" data-testid="panel-anuncio">
        {#each [fila1, fila2] as fila, i (i)}
          <div class="fila">
            {#if i === 0}
              <button
                data-testid="pasar"
                onclick={() => {
                  cancelar();
                  sesion.jugar({ tipo: 'pasar' });
                }}>{T.schafkopf.pasar}</button
              >
            {/if}
            {#each fila as contrato (clave(contrato))}
              <button
                class="principal"
                data-testid={testid(contrato)}
                disabled={!posibles.has(clave(contrato))}
                onclick={() => {
                  cancelar();
                  sesion.jugar({ tipo: 'anunciar', contrato });
                }}>{T.schafkopf.boton(contrato)}</button
              >
            {/each}
          </div>
        {/each}
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.schafkopf.finMano(resumen + 1)}</h2>
      <ResumenSchafkopf resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.schafkopf.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .juego {
    font-weight: 700;
    color: var(--acento);
  }

  .anuncio {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .fila {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .fila button {
    min-height: 40px;
    padding: 4px 10px;
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
