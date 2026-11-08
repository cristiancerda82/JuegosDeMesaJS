<script lang="ts">
  import {
    MATRIMONIO_TYSIACHA,
    paloTysiacha,
    rangoTysiacha,
    rivalesTysiacha,
    type AccionTysiacha,
    type Asiento,
    type ConfigTysiacha,
    type EstadoTysiacha,
    type IdCarta,
    type PaloFrances,
    type VistaTysiacha,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenTysiacha from './ResumenTysiacha.svelte';

  interface Props {
    sesion: SesionMesa<ConfigTysiacha, EstadoTysiacha, AccionTysiacha, VistaTysiacha>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 3;
  const PALOS: readonly PaloFrances[] = ['corazones', 'diamantes', 'treboles', 'picas'];

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);

  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, JUGADORES, yo, sesion.red, T.brisca.rivalN);
  const detalle = (asiento: Asiento) => {
    const marcas: string[] = [];
    if (asiento === vista.repartidor) marcas.push(T.tysiacha.reparte);
    if (vista.fase === 'subasta') {
      const p = vista.pujas[asiento];
      if (p !== null && p !== undefined) marcas.push(p === 'paso' ? T.tysiacha.paso : T.tysiacha.puja(p));
    } else {
      if (asiento === vista.declarante) marcas.push(T.tysiacha.declara);
      if (vista.fase === 'bazas') {
        marcas.push(T.tysiacha.puntosMano((vista.puntosCartas[asiento] ?? 0) + (vista.puntosMatrimonios[asiento] ?? 0)));
      }
    }
    if (asiento !== yo) marcas.push(`${vista.marcador[asiento]}`);
    return marcas.join(' · ');
  };

  // ── Cartas: dar o jugar ────────────────────────────────────────────────────

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => (a.tipo === 'jugar' || a.tipo === 'dar') && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  function jugar(carta: IdCarta) {
    const accion = accionDe(carta);
    if (accion) sesion.jugar(accion);
  }

  /** La mano por palos (el triunfo primero) y por rango. */
  const manoOrdenada = $derived.by(() => {
    const t = vista.triunfo;
    const orden = t === null ? [...PALOS] : [t, ...PALOS.filter((p) => p !== t)];
    return [...(vista.miMano ?? [])].sort(
      (a, b) =>
        orden.indexOf(paloTysiacha(a)) - orden.indexOf(paloTysiacha(b)) || rangoTysiacha(b) - rangoTysiacha(a),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    config: { jugadores: JUGADORES },
    miMano: manoOrdenada,
    mazo: 0,
    muestra: null,
    bazas: vista.bazasGanadas,
    resultadosManos: [],
  });

  // ── Subasta y contrato ─────────────────────────────────────────────────────

  const puedePujar = $derived(legales.some((a) => a.tipo === 'pujar'));
  const panelSubasta = $derived(miTurno && vista.fase === 'subasta');
  const valores = $derived(legales.flatMap((a) => (a.tipo === 'fijar' ? [a.valor] : [])));
  let elegido: number | null = $state(null);
  const contratoElegido = $derived(
    elegido !== null && valores.includes(elegido) ? elegido : (valores[0] ?? null),
  );
  function cambiar(paso: number) {
    if (contratoElegido === null) return;
    const i = valores.indexOf(contratoElegido) + paso;
    if (i >= 0 && i < valores.length) elegido = valores[i]!;
  }

  const aviso = $derived.by(() => {
    if (sesion.fin !== null) return null;
    const quien = nombre(vista.turno ?? 0);
    switch (vista.fase) {
      case 'subasta':
        return vista.turno === yo ? T.tysiacha.tuPuja : T.tysiacha.pujando(quien);
      case 'dar': {
        if (vista.turno !== yo || vista.declarante === null) return T.tysiacha.dando(quien);
        const para = rivalesTysiacha(vista.declarante)[vista.cartasDadas] ?? 0;
        return T.tysiacha.daA(nombre(para));
      }
      case 'contrato':
        return vista.turno === yo ? T.tysiacha.fijaContrato : T.tysiacha.fijando(quien);
      default:
        return null;
    }
  });

  const contratoTexto = $derived(
    vista.declarante !== null && vista.contrato !== null
      ? T.tysiacha.contrato(nombre(vista.declarante), vista.contrato)
      : T.tysiacha.subasta(vista.puja, nombre(vista.pujador)),
  );
  const cante = $derived.by(() => {
    const m = vista.matrimonios.at(-1);
    return m ? T.tysiacha.canta(nombre(m.asiento), m.palo, MATRIMONIO_TYSIACHA[m.palo]) : null;
  });
  const barril = $derived(vista.barril[yo]);

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
    <span class="contrato" data-testid="contrato-tysiacha">{contratoTexto}</span>
    <span data-testid="triunfo-tysiacha">
      {vista.triunfo === null ? T.tysiacha.sinTriunfo : T.tysiacha.triunfo(vista.triunfo)}
    </span>
    {#if cante !== null}<span class="cante" data-testid="cante">{cante}</span>{/if}
    {#if vista.fase !== 'bazas' || vista.mesa.length === 0}
      <span class="prikup" data-testid="prikup">
        {T.tysiacha.prikup}
        <!-- Sin data-carta: la animación de la mesa las confundiría con las de la mano. -->
        {#if vista.prikup !== null}
          {#each vista.prikup as id (id)}<span class="mini" data-prikup={id}><Carta {id} /></span>{/each}
        {:else}
          {#each [0, 1, 2] as i (i)}<span class="mini" data-prikup="oculta"><Carta /></span>{/each}
        {/if}
      </span>
    {/if}
    <span class="cuenta" data-testid="marcador">
      {T.tysiacha.marcador(vista.marcador[yo] ?? 0)}{#if barril !== null && barril !== undefined}
        {' '}{T.tysiacha.barril(barril)}{/if}
    </span>
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if panelSubasta}
      <div class="otras" data-testid="subasta">
        {#if puedePujar}
          <button data-accion="pujar"
            class="principal"
            data-testid="pujar"
            onclick={() => {
              cancelar();
              sesion.jugar({ tipo: 'pujar' });
            }}>{T.tysiacha.pujar(vista.puja + 5)}</button
          >
        {/if}
        <button data-accion="pasar"
          data-testid="pasar"
          onclick={() => {
            cancelar();
            sesion.jugar({ tipo: 'pasar' });
          }}>{T.tysiacha.pasar}</button
        >
      </div>
    {:else if miTurno && vista.fase === 'contrato' && contratoElegido !== null}
      <div class="otras" data-testid="panel-contrato">
        <button
          data-testid="contrato-menos"
          aria-label="−5"
          disabled={valores.indexOf(contratoElegido) <= 0}
          onclick={() => cambiar(-1)}>−</button
        >
        <button data-accion="fijar"
          class="principal"
          data-testid="fijar"
          onclick={() => {
            cancelar();
            const valor = contratoElegido;
            elegido = null;
            sesion.jugar({ tipo: 'fijar', valor });
          }}>{T.tysiacha.fijar(contratoElegido)}</button
        >
        <button
          data-testid="contrato-mas"
          aria-label="+5"
          disabled={valores.indexOf(contratoElegido) >= valores.length - 1}
          onclick={() => cambiar(1)}>+</button
        >
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.tysiacha.finMano(resumen + 1)}</h2>
      <ResumenTysiacha resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.tysiacha.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .contrato {
    font-weight: 700;
    color: var(--acento);
  }

  .cante {
    color: var(--acento);
  }

  .cuenta {
    color: var(--texto-suave);
  }

  .prikup {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .mini {
    width: 22px;
    aspect-ratio: 100 / 140;
  }

  .otras {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .otras button {
    min-height: 36px;
    min-width: 40px;
    padding: 2px 10px;
  }

  .otras button:disabled {
    opacity: 0.3;
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
