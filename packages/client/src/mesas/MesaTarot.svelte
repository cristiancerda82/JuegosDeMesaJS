<script lang="ts">
  import {
    esExcusa,
    esTriunfoTarot,
    fuerzaTarot,
    paloTarot,
    type AccionTarot,
    type Asiento,
    type ConfigTarot,
    type EstadoTarot,
    type IdCarta,
    type VistaTarot,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenTarot from './ResumenTarot.svelte';

  interface Props {
    sesion: SesionMesa<ConfigTarot, EstadoTarot, AccionTarot, VistaTarot>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const PALOS = ['picas', 'corazones', 'diamantes', 'treboles'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const n = $derived(vista.config.jugadores);

  const nombre = (asiento: Asiento) => nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN);

  /** La acción de tocar una carta de la mano: jugarla o, en el descarte, descartarla. */
  const accionDe = (carta: IdCarta): AccionTarot | null =>
    legales.find((a) => (a.tipo === 'jugar' || a.tipo === 'descartar') && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;

  const detalle = (asiento: Asiento) => {
    const partes: string[] = [];
    if (asiento === vista.repartidor) partes.push(T.tarot.reparte);
    if (vista.fase === 'subasta') {
      const d = vista.dichos[asiento];
      if (d) partes.push(T.tarot.dicho[d]);
    } else {
      if (asiento === vista.preneur) partes.push(T.tarot.preneur);
      else if (vista.bandos[asiento] === 'ataque') partes.push(T.tarot.pareja);
      partes.push(T.tarot.bazas(vista.bazas.filter((b) => b.ganador === asiento).length));
    }
    return partes.join(' · ');
  };

  /** La mano por palos y, al final, los triunfos y la Excusa. */
  const manoOrdenada = $derived.by(() => {
    const grupo = (c: IdCarta) =>
      esExcusa(c) ? 5 : esTriunfoTarot(c) ? 4 : PALOS.indexOf(paloTarot(c) as (typeof PALOS)[number]);
    return [...(vista.miMano ?? [])].sort(
      (a, b) => grupo(a) - grupo(b) || fuerzaTarot(b) - fuerzaTarot(a),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    config: { jugadores: n },
    miMano: manoOrdenada,
    mazo: 0,
    muestra: null,
    rotuloMuestra: null,
    bazas: Array.from({ length: n }, (_, a) => vista.bazas.filter((b) => b.ganador === a).length),
    ultimaBaza: vista.bazas.at(-1) ?? null,
    resultadosManos: [],
  });

  // ── Subasta, llamada y poignée ─────────────────────────────────────────────

  const activo = $derived(legales.length > 0 && sesion.fin === null && !sesion.bloqueada);
  const subasta = $derived(activo && vista.fase === 'subasta' ? legales : []);
  const llamables = $derived(
    activo ? legales.flatMap((a) => (a.tipo === 'llamar' ? [a.carta] : [])) : [],
  );
  const poignee = $derived(
    activo ? (legales.filter((a) => a.tipo === 'poignee').at(-1) ?? null) : null,
  );

  const juego = $derived.by(() => {
    if (vista.fase === 'subasta') return T.tarot.subasta;
    if (vista.contrato === null || vista.preneur === null) return '';
    return T.tarot.contratoDe(vista.contrato, nombre(vista.preneur));
  });

  const aviso = $derived.by(() => {
    if (sesion.fin !== null) return null;
    if (vista.fase === 'descarte') {
      if (vista.preneur === yo) return T.tarot.descarta(vista.enPerro - vista.enDescarte);
      return T.tarot.descartando(nombre(vista.preneur!));
    }
    if (vista.fase === 'llamada' && vista.preneur !== yo) return T.tarot.llamando(nombre(vista.preneur!));
    return null;
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
  {aviso}
>
  {#snippet info()}
    <span class="juego" data-testid="contrato">{juego}</span>
    {#if vista.llamada}<span data-testid="llamada">{T.tarot.llama(nombreCarta(vista.llamada))}</span>{/if}
    <span data-testid="mano-ronda">{T.tarot.manoRonda(vista.manoNumero, vista.manosRonda)}</span>
    <span data-testid="marcador">{T.tarot.tusPuntos(vista.puntos[yo] ?? 0)}</span>
    {#if vista.perro && vista.fase === 'descarte'}
      <span class="cartas" data-testid="perro">
        {T.tarot.perro}
        {#each vista.perro as id (id)}
          <span class="mini" data-carta={id}><Carta {id} /></span>
        {/each}
      </span>
    {/if}
    {#each vista.poignees as p (p.asiento)}
      <span data-testid="poignee-{p.asiento}">{T.tarot.poigneeDe(nombre(p.asiento), p.nivel, p.cartas.length)}</span>
    {/each}
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if subasta.length > 0}
      <div class="decisiones">
        {#each subasta as a (a.tipo === 'pujar' ? a.contrato : 'pasar')}
          <button
            class:principal={a.tipo === 'pujar'}
            data-testid={a.tipo === 'pujar' ? `contrato-${a.contrato}` : 'pasar'}
            onclick={() => {
              cancelar();
              sesion.jugar(a);
            }}>{a.tipo === 'pujar' ? T.tarot.contrato[a.contrato] : T.tarot.pasar}</button
          >
        {/each}
      </div>
    {:else if llamables.length > 0}
      <div class="decisiones">
        {#each llamables as carta (carta)}
          <button
            class="principal"
            data-testid="llamar-{carta}"
            onclick={() => {
              cancelar();
              sesion.jugar({ tipo: 'llamar', carta });
            }}>{nombreCarta(carta)}</button
          >
        {/each}
      </div>
    {:else if poignee && poignee.tipo === 'poignee'}
      {@const nivel = poignee.nivel}
      <div class="decisiones">
        <button
          class="principal"
          data-testid="poignee"
          onclick={() => {
            cancelar();
            sesion.jugar({ tipo: 'poignee', nivel });
          }}>{T.tarot.ensenarPoignee(nivel)}</button
        >
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.tarot.finMano(resumen + 1)}</h2>
      <ResumenTarot resultado={vista.resultadosManos[resumen]!} {yo} {n} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.tarot.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .juego {
    font-weight: 700;
    color: var(--acento);
  }

  .cartas {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .mini {
    display: inline-block;
    width: 26px;
    aspect-ratio: 100 / 140;
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
