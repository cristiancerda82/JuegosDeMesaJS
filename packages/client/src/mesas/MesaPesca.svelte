<script lang="ts">
  import {
    valorPesca,
    valoresDe,
    type AccionPesca,
    type ConfigPesca,
    type EstadoPesca,
    type IdCarta,
    type VistaPesca,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado } from './bazas/asientos';

  interface Props {
    sesion: SesionMesa<ConfigPesca, EstadoPesca, AccionPesca, VistaPesca>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const n = $derived(vista.config.jugadores);
  const nombre = (asiento: number) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);

  /** Los rivales, desde el de la izquierda del jugador. */
  const rivales = $derived(Array.from({ length: n - 1 }, (_, k) => (yo + 1 + k) % n));

  /** La mano agrupada por valores. */
  const grupos = $derived(
    valoresDe(vista.miMano ?? []).map((v) => ({
      valor: v,
      cartas: (vista.miMano ?? []).filter((c: IdCarta) => valorPesca(c) === v),
    })),
  );

  // ── Pedir: valor y después rival ───────────────────────────────────────────

  let valor: number | null = $state(null);
  $effect(() => {
    if (!miTurno) valor = null;
  });
  const puedeValor = (v: number) => miTurno && legales.some((a) => a.valor === v);
  const accionA = (a: number) =>
    valor === null ? null : (legales.find((x) => x.a === a && x.valor === valor) ?? null);

  function pedirA(a: number) {
    const accion = accionA(a);
    if (accion === null) return;
    valor = null;
    sesion.jugar(accion);
  }

  // ── Avisos ─────────────────────────────────────────────────────────────────

  const aviso = $derived.by(() => {
    const r = vista.registro.at(-1);
    if (!r) return null;
    const quien = nombre(r.asiento);
    if (r.tipo === 'robar') return T.pesca.roba(quien);
    const partes = [T.pesca.pide(quien, nombre(r.a), r.valor)];
    if (r.dadas.length > 0) partes.push(T.pesca.da(nombre(r.a), r.dadas.length, r.valor));
    else if (r.pesco === 'nada') partes.push(`${T.pesca.aPescar} ${T.pesca.marVacio}`);
    else if (r.pesco === 'otra' || r.pesco === null) partes.push(T.pesca.aPescar);
    else partes.push(`${T.pesca.aPescar} ${T.pesca.pesca(quien, r.valor)}`);
    if (r.cuarteto !== null) partes.push(T.pesca.cuarteto(quien, r.cuarteto));
    return partes.join(' · ');
  });

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    if (vista.turno !== yo) return T.pesca.turnoDe(nombre(vista.turno));
    return valor === null ? `${T.pesca.tuTurno} · ${T.pesca.eligeValor}` : T.pesca.eligeRival(valor);
  });
</script>

<div class="mesa-pesca">
  <div class="rivales">
    {#each rivales as a (a)}
      <button
        type="button"
        class="rival"
        class:activo={vista.turno === a && sesion.fin === null}
        class:pedible={accionA(a) !== null}
        disabled={accionA(a) === null}
        data-testid="asiento-{a}"
        onclick={() => pedirA(a)}
      >
        <span class="nombre">{nombre(a)}</span>
        <span class="dorsos" aria-label={T.pesca.cartas(vista.cartasEnMano[a]!)}>
          {#each { length: Math.min(vista.cartasEnMano[a]!, 8) }, k (k)}
            <span class="dorso"><Carta /></span>
          {/each}
        </span>
        <small>{T.pesca.cartas(vista.cartasEnMano[a]!)}</small>
        <span class="cuartetos" data-testid="cuartetos-{a}">
          {#each vista.cuartetos[a]! as v (v)}<span class="chip">{T.pesca.valor(v)}</span>{/each}
        </span>
      </button>
    {/each}
  </div>

  <div class="centro">
    <div class="mar" data-testid="mar">
      {#if vista.enMar > 0}
        <span class="dorso grande"><Carta /></span>
      {/if}
      <span>{T.pesca.mar(vista.enMar)}</span>
    </div>
    {#if aviso}
      <p class="aviso" role="status" data-testid="aviso">{aviso}</p>
    {/if}
  </div>

  <div class="propio">
    <div class="estado">
      <span class="nombre" class:activo={vista.turno === yo && sesion.fin === null}>
        {T.brisca.tu}
        <small data-testid="cuartetos-{yo}">
          {T.pesca.cuartetos(vista.cuartetos[yo]!.length)}
          {#each vista.cuartetos[yo]! as v (v)}<span class="chip">{T.pesca.valor(v)}</span>{/each}
        </small>
      </span>
      <span class="turno" data-testid="turno">{turno}</span>
    </div>
    <div class="mano" data-testid="mano">
      {#each grupos as g (g.valor)}
        <button
          type="button"
          class="grupo"
          class:jugable={puedeValor(g.valor)}
          class:marcado={valor === g.valor}
          disabled={!puedeValor(g.valor)}
          data-testid="valor-{g.valor}"
          onclick={() => (valor = valor === g.valor ? null : g.valor)}
        >
          {#each g.cartas as id (id)}
            <span class="carta-mano" data-carta={id}><Carta {id} /></span>
          {/each}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .mesa-pesca {
    --ancho-carta: min(15vw, 11dvh, 84px);
    --ancho-rival: min(6vw, 4.5dvh, 30px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
  }

  .rivales {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .rival {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    min-width: 0;
    flex: 0 1 108px;
    padding: 4px 6px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.2);
    border: 2px solid transparent;
  }

  .rival:disabled {
    opacity: 1;
    cursor: default;
  }

  .rival.activo {
    border-color: var(--acento);
  }

  .rival.pedible {
    border-color: var(--resalte);
    cursor: pointer;
  }

  .nombre {
    font-weight: 600;
  }

  .rival small {
    color: var(--texto-suave);
  }

  .dorsos {
    display: flex;
    min-height: calc(var(--ancho-rival) * 1.4);
  }

  .dorso {
    display: block;
    width: var(--ancho-rival);
    aspect-ratio: 100 / 140;
  }

  .dorsos .dorso + .dorso {
    margin-left: calc(var(--ancho-rival) * -0.55);
  }

  .dorso.grande {
    width: min(12vw, 8dvh, 64px);
  }

  .cuartetos {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px;
    min-height: 1.2em;
  }

  .chip {
    padding: 0 5px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    background: var(--acento);
    color: #2b2005;
    margin-left: 3px;
  }

  .centro {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .mar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: var(--texto-suave);
  }

  .aviso {
    margin: 0;
    padding: 6px 12px;
    border-radius: 12px;
    text-align: center;
    font-weight: 600;
    background: rgb(0 0 0 / 0.3);
  }

  .propio {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .estado {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 12px;
  }

  .estado .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.2);
  }

  .estado .nombre.activo {
    background: var(--acento);
    color: #2b2005;
  }

  .estado small {
    font-weight: 400;
    margin-left: 4px;
  }

  .turno {
    font-weight: 600;
  }

  .mano {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 10px;
    width: 100%;
  }

  .grupo {
    display: flex;
    padding: 4px;
    border-radius: 10px;
    background: none;
    border: 2px solid transparent;
    cursor: default;
  }

  .grupo:disabled {
    opacity: 1;
  }

  .grupo.jugable {
    cursor: pointer;
  }

  .grupo.jugable:hover {
    translate: 0 -4px;
  }

  .grupo.marcado {
    border-color: var(--resalte);
    translate: 0 -8px;
  }

  .carta-mano {
    display: block;
    width: var(--ancho-carta);
    aspect-ratio: 100 / 140;
  }

  .carta-mano + .carta-mano {
    margin-left: calc(var(--ancho-carta) * -0.7);
  }
</style>
