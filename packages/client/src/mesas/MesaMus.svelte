<script lang="ts">
  import {
    parejaDe,
    type AccionMus,
    type AccionVisibleMus,
    type Asiento,
    type ConfigMus,
    type EstadoMus,
    type IdCarta,
    type LanceMus,
    type RegistroLanceMus,
    type VistaMus,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AsientoRival from './bazas/AsientoRival.svelte';
  import { lado, nombreAsiento } from './bazas/asientos';
  import ConteoMus from './ConteoMus.svelte';

  interface Props {
    sesion: SesionMesa<ConfigMus, EstadoMus, AccionMus, VistaMus>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, 4, yo, sesion.red);
  /** Nombre de la pareja dentro de una frase. */
  const pareja = (p: 0 | 1) => (p === parejaDe(yo) ? T.mus.nosotrosEn : T.mus.ellosEn);
  const activo = (asiento: Asiento) => vista.turno === asiento && sesion.fin === null;

  // ── Lo que dice cada uno ───────────────────────────────────────────────────

  function texto(accion: AccionVisibleMus): string {
    switch (accion.tipo) {
      case 'mus':
        return T.mus.pideMus;
      case 'cortar':
        return T.mus.corta;
      case 'descartar':
        return T.mus.descarta(accion.cantidad);
      case 'paso':
        return T.mus.paso;
      case 'envidar':
        return T.mus.envida(accion.piedras);
      case 'subir':
        return T.mus.sube(accion.piedras);
      case 'ordago':
        return T.mus.ordago;
      case 'quiero':
        return T.mus.quiero;
      case 'noQuiero':
        return T.mus.noQuiero;
    }
  }

  /** Lo último que dijo cada asiento en la ronda en curso (el mus o el lance). */
  let dichos: (string | null)[] = $state([null, null, null, null]);
  let ronda = '';
  let manosRonda = -1;
  let ultimaVista = '';
  $effect(() => {
    const manos = vista.resultadosManos.length;
    const clave = `${manos}/${vista.fase === 'lance' ? vista.lance : 'mus'}`;
    if (clave !== ronda) {
      ronda = clave;
      dichos = [null, null, null, null];
    }
    // La última acción de la mano anterior no es de esta mano.
    const manoNueva = manos !== manosRonda;
    manosRonda = manos;
    const ultima = vista.ultimaAccion;
    const marca = JSON.stringify(ultima);
    if (ultima !== null && marca !== ultimaVista && !manoNueva) {
      dichos[ultima.asiento] = texto(ultima.accion);
    }
    ultimaVista = marca;
  });

  const detalle = (asiento: Asiento) =>
    [asiento === vista.mano ? T.mus.mano : null, dichos[asiento]].filter(Boolean).join(' · ');

  // ── Lances ─────────────────────────────────────────────────────────────────

  const ORDEN: readonly LanceMus[] = ['grande', 'chica', 'pares', 'juego'];
  const registro = (lance: LanceMus): RegistroLanceMus | undefined =>
    vista.lances.find((r) => r.lance === lance || (lance === 'juego' && r.lance === 'punto'));
  const enCurso = (lance: LanceMus) =>
    vista.fase === 'lance' &&
    (vista.lance === lance || (lance === 'juego' && vista.lance === 'punto'));
  const nombreLance = (lance: LanceMus) => {
    const juegaPunto =
      registro('juego')?.lance === 'punto' || (lance === 'juego' && vista.lance === 'punto');
    return T.mus.lances[lance === 'juego' && juegaPunto ? 'punto' : lance];
  };

  function estadoLance(lance: LanceMus): string {
    const r = registro(lance);
    if (r) {
      switch (r.estado) {
        case 'paso':
          return T.mus.estadoLance.paso;
        case 'querido':
          return T.mus.estadoLance.querido(r.piedras);
        case 'noQuerido':
          return T.mus.estadoLance.noQuerido(r.piedras, pareja(r.pareja!));
        case 'ordago':
          return T.mus.estadoLance.ordago;
        case 'sinApuesta': {
          const decl = lance === 'pares' ? vista.declaraciones.pares : vista.declaraciones.juego;
          const quien = decl?.findIndex(Boolean) ?? -1;
          return T.mus.estadoLance.sinApuesta(quien === -1 ? '' : pareja(parejaDe(quien)));
        }
        case 'noSeJuega':
          return T.mus.estadoLance.noSeJuega;
      }
    }
    if (!enCurso(lance)) return '';
    const e = vista.envite;
    if (e === null) return '';
    return e.ordago ? T.mus.enviteOrdago(pareja(e.pareja)) : T.mus.envite(pareja(e.pareja), e.total);
  }

  /** Quién tiene la jugada en Pares o Juego, una vez declarado. */
  function tienen(lance: LanceMus): string | null {
    const decl = lance === 'pares' ? vista.declaraciones.pares : lance === 'juego' ? vista.declaraciones.juego : null;
    if (decl === null || (lance === 'juego' && registro('juego')?.lance === 'punto')) return null;
    if (lance === 'juego' && vista.lance === 'punto') return null;
    const quienes = decl.flatMap((t, a) => (t ? [nombre(a)] : []));
    return T.mus.tienen(quienes.length === 0 ? T.mus.nadie : quienes.join(', '));
  }

  // ── Acciones del humano ────────────────────────────────────────────────────

  const hay = (tipo: AccionMus['tipo'], piedras?: number) =>
    legales.find(
      (a) => a.tipo === tipo && (piedras === undefined || ('piedras' in a && a.piedras === piedras)),
    );
  const enDescarte = $derived(legales.some((a) => a.tipo === 'descartar'));

  let marcadas: IdCarta[] = $state([]);
  $effect(() => {
    if (!enDescarte) marcadas = [];
  });

  function tocarCarta(id: IdCarta) {
    if (!enDescarte) return;
    marcadas = marcadas.includes(id) ? marcadas.filter((c) => c !== id) : [...marcadas, id];
  }

  function descartar() {
    const clave = [...marcadas].sort().join();
    const accion = legales.find(
      (a) => a.tipo === 'descartar' && [...a.cartas].sort().join() === clave,
    );
    if (accion) sesion.jugar(accion);
  }

  const botones = $derived.by(() => {
    const b: { accion: AccionMus; texto: string; id: string; principal: boolean }[] = [];
    const poner = (accion: AccionMus | undefined, texto: string, id: string, principal = false) => {
      if (accion) b.push({ accion, texto, id, principal });
    };
    poner(hay('mus'), T.mus.botonMus, 'mus', true);
    poner(hay('cortar'), T.mus.botonCortar, 'cortar', true);
    poner(hay('paso'), T.mus.botonPaso, 'paso');
    poner(hay('quiero'), T.mus.quiero, 'quiero', true);
    poner(hay('noQuiero'), T.mus.noQuiero, 'no-quiero');
    poner(hay('envidar', 2), T.mus.botonEnvidar(2), 'envidar-2', true);
    poner(hay('envidar', 5), T.mus.botonEnvidar(5), 'envidar-5', true);
    poner(hay('subir', 2), T.mus.botonSubir(2), 'subir-2', true);
    poner(hay('subir', 5), T.mus.botonSubir(5), 'subir-5', true);
    poner(hay('ordago'), T.mus.botonOrdago, 'ordago');
    return b;
  });

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (sesion.bloqueada) return '';
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    return enDescarte ? T.mus.eligeDescarte : T.brisca.tuTurno;
  });

  const aviso = $derived.by(() => {
    const u = vista.ultimaAccion;
    if (u === null || u.asiento === yo || sesion.fin !== null) return null;
    return T.mus.dice(nombre(u.asiento), texto(u.accion));
  });

  // ── Conteo al terminar cada mano ───────────────────────────────────────────

  let conteo: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      conteo = total - 1;
      sesion.pausar();
    }
    manosVistas = total;
  });

  function siguienteMano() {
    conteo = null;
    sesion.reanudar();
  }
</script>

<div class="mus">
  <div class="info">
    <span data-testid="marcador-mus">
      {T.mus.nosotros} <b>{vista.piedras[parejaDe(yo)]}</b> · {T.mus.ellos} <b>{vista.piedras[1 - parejaDe(yo)]}</b>
      <small>({T.opciones.piedrasN(vista.config.puntos).toLowerCase()})</small>
    </span>
    {#if vista.config.juegos > 1}
      <span data-testid="juegos-mus">{T.mus.juegos(vista.juegos[parejaDe(yo)]!, vista.juegos[1 - parejaDe(yo)]!)}</span>
    {/if}
  </div>

  {#each [0, 1, 2, 3].filter((a) => a !== yo) as asiento (asiento)}
    <AsientoRival
      {asiento}
      lado={lado(asiento, 4, yo)}
      nombre={nombre(asiento)}
      detalle={detalle(asiento)}
      cartas={vista.cartasEnMano[asiento] ?? 0}
      activo={activo(asiento)}
    />
  {/each}

  <div class="centro">
    <ol class="lances" data-testid="lances">
      {#if vista.fase !== 'lance'}
        <li class="actual fase" data-testid="fase-mus">
          {vista.fase === 'mus' ? T.mus.faseMus : T.mus.faseDescarte}
        </li>
      {/if}
      {#each ORDEN as lance (lance)}
        {@const t = tienen(lance)}
        <li class:actual={enCurso(lance)} class:hecho={registro(lance) !== undefined} data-testid="lance-{lance}">
          <span class="nombre-lance">{nombreLance(lance)}</span>
          <span class="estado">{estadoLance(lance)}</span>
          {#if t && (enCurso(lance) || registro(lance))}
            <small class="tienen">{t}</small>
          {/if}
        </li>
      {/each}
    </ol>
    {#if aviso}
      <p class="aviso" role="status" data-testid="aviso">{aviso}</p>
    {/if}
  </div>

  <div class="propio" class:activo={activo(yo)}>
    <div class="estado-propio">
      <span class="nombre">
        {T.brisca.tu} <small data-testid="detalle-propio">{detalle(yo)}</small>
      </span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
    </div>
    <div class="botones">
      {#each botones as b (b.id)}
        <button class:principal={b.principal} data-testid="accion-{b.id}" onclick={() => sesion.jugar(b.accion)}>
          {b.texto}
        </button>
      {/each}
      {#if enDescarte}
        <button
          class="principal"
          data-testid="descartar"
          disabled={marcadas.length === 0}
          onclick={descartar}
        >
          {T.mus.botonDescartar(marcadas.length)}
        </button>
      {/if}
    </div>
    <div class="mano" data-testid="mano">
      {#each vista.miMano ?? [] as id (id)}
        <button
          class="carta-mus"
          class:marcada={marcadas.includes(id)}
          class:elegible={enDescarte}
          disabled={!enDescarte}
          data-carta={id}
          data-testid="mano-{id}"
          aria-pressed={enDescarte ? marcadas.includes(id) : undefined}
          onclick={() => tocarCarta(id)}
        >
          <Carta {id} />
        </button>
      {/each}
    </div>
  </div>
</div>

{#if conteo !== null && vista.resultadosManos[conteo]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.mus.conteo(conteo + 1)}</h2>
      <ConteoMus resultado={vista.resultadosManos[conteo]!} config={vista.config} {yo} red={sesion.red} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.mus.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .mus {
    --ancho-carta: min(19vw, 13dvh, 100px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-rival: min(9vw, 6dvh, 46px);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas:
      'info info info'
      'arriba arriba arriba'
      'izquierda centro derecha'
      'abajo abajo abajo';
    gap: 8px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
  }

  .info {
    grid-area: info;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px 18px;
    color: var(--texto-suave);
    font-size: 0.9rem;
  }

  .info b {
    color: var(--texto);
  }

  .centro {
    grid-area: centro;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 0;
  }

  .lances {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: min(100%, 300px);
    margin: 0;
    padding: 8px;
    list-style: none;
    border-radius: 14px;
    background: rgb(0 0 0 / 0.15);
  }

  .lances li {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0 8px;
    padding: 3px 8px;
    border-radius: 8px;
    color: var(--texto-suave);
  }

  .lances li.hecho {
    color: var(--texto);
  }

  .lances li.actual {
    color: #2b2005;
    background: var(--acento);
    font-weight: 700;
  }

  .lances li.fase {
    justify-content: center;
  }

  .nombre-lance {
    font-weight: 700;
  }

  .estado {
    font-size: 0.85rem;
    text-align: right;
  }

  .tienen {
    flex-basis: 100%;
    font-size: 0.75rem;
    font-weight: 400;
  }

  .aviso {
    margin: 0;
    padding: 4px 12px;
    border-radius: 14px;
    font-weight: 700;
    text-align: center;
    background: rgb(0 0 0 / 0.6);
  }

  .propio {
    grid-area: abajo;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .estado-propio,
  .botones {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 10px;
  }

  .estado-propio {
    min-height: 32px;
  }

  .botones {
    min-height: 44px;
  }

  .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: rgb(0 0 0 / 0.2);
  }

  .nombre small {
    font-weight: 400;
    color: var(--texto-suave);
    margin-left: 4px;
  }

  .activo .nombre {
    background: var(--acento);
    color: #2b2005;
  }

  .activo .nombre small {
    color: #5b4a12;
  }

  .turno {
    font-weight: 600;
  }

  .mano {
    display: flex;
    justify-content: center;
    gap: clamp(4px, 2vw, 12px);
    padding-top: 10px;
  }

  .carta-mus {
    width: var(--ancho-carta);
    height: var(--alto-carta);
    padding: 0;
    border: none;
    border-radius: 7%;
    background: none;
    transition: translate 120ms;
  }

  .carta-mus:disabled {
    opacity: 1;
    cursor: default;
  }

  .carta-mus.elegible {
    cursor: pointer;
  }

  .carta-mus.marcada {
    translate: 0 -12px;
    outline: 3px solid var(--resalte);
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
    width: min(100%, 420px);
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
    font-size: 1.2rem;
    margin-bottom: 8px;
  }

  .dialogo > button {
    margin-top: 12px;
    width: 100%;
  }
</style>
