<script lang="ts">
  import {
    cartaDeId,
    type AccionMentiroso,
    type Asiento,
    type ConfigMentiroso,
    type EstadoMentiroso,
    type IdCarta,
    type VistaMentiroso,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AsientoRival from './bazas/AsientoRival.svelte';
  import { lado, nombreNumerado } from './bazas/asientos';

  interface Props {
    sesion: SesionMesa<ConfigMentiroso, EstadoMentiroso, AccionMentiroso, VistaMentiroso>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  const rivales = $derived(Array.from({ length: n }, (_, a) => a).filter((a) => a !== yo));
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.mentiroso.rivalN);

  const puede = (tipo: AccionMentiroso['tipo']) => legales.some((a) => a.tipo === tipo);
  const miTurno = $derived(vista.turno === yo && sesion.fin === null);
  const marcable = (c: IdCarta) =>
    legales.some(
      (a) => (a.tipo === 'marcar' || a.tipo === 'desmarcar') && a.carta === c,
    );

  /** La mano ordenada por valor (y por palo dentro del valor). */
  const mano = $derived(
    [...(vista.miMano ?? [])].sort(
      (a, b) => cartaDeId(a)!.valor - cartaDeId(b)!.valor || a.localeCompare(b),
    ),
  );

  function tocar(c: IdCarta) {
    if (sesion.bloqueada || !marcable(c)) return;
    sesion.jugar({ tipo: vista.marcadas.includes(c) ? 'desmarcar' : 'marcar', carta: c });
  }

  const ultima = $derived(vista.bajadas.at(-1) ?? null);
  /** Tras un «¡Mentiroso!», hasta la siguiente bajada, se ven las cartas descubiertas. */
  const revelacion = $derived(
    vista.bajadas.length === 0 ? (vista.revelaciones.at(-1) ?? null) : null,
  );

  const turnoTexto = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (vista.turno !== yo) return T.mentiroso.leToca(nombre(vista.turno));
    if (puede('creer')) return T.mentiroso.ultimaBajada(nombre(ultima!.asiento));
    return T.mentiroso.tuTurno(T.mentiroso.valor(vista.valor, 2));
  });
</script>

<div class="mentiroso" class:muchos={n >= 5}>
  {#each rivales as asiento (asiento)}
    <AsientoRival
      {asiento}
      lado={lado(asiento, n, yo)}
      nombre={nombre(asiento)}
      detalle={T.mentiroso.cartas(vista.cartasEnMano[asiento] ?? 0)}
      cartas={Math.min(vista.cartasEnMano[asiento] ?? 0, 8)}
      activo={vista.turno === asiento && sesion.fin === null}
    />
  {/each}

  <div class="centro">
    <div class="monton" data-testid="monton" aria-label={T.mentiroso.monton(vista.monton)}>
      {#if vista.monton > 0}<Carta />{/if}
      <span class="cuenta">{vista.monton}</span>
    </div>
    <p class="toca" data-testid="valor">{T.mentiroso.toca(T.mentiroso.valor(vista.valor, 2))}</p>
    {#if ultima}
      <p class="bajada" data-testid="ultima-bajada">
        {T.mentiroso.bajada(nombre(ultima.asiento), ultima.cuantas, T.mentiroso.valor(ultima.valor, ultima.cuantas))}
      </p>
    {/if}
    {#if revelacion}
      <div class="revelacion" class:mentia={revelacion.mentia} data-testid="revelacion">
        <p>
          {revelacion.mentia
            ? T.mentiroso.pillado(nombre(revelacion.bajo))
            : T.mentiroso.eraVerdad(nombre(revelacion.bajo))}
        </p>
        <div class="descubiertas">
          {#each revelacion.cartas as c (c)}
            <span class="mini" data-carta={c}><Carta id={c} /></span>
          {/each}
        </div>
        <p class="nota" data-testid="se-lleva">
          {T.mentiroso.seLleva(nombre(revelacion.seLleva), revelacion.cuantas)}
        </p>
      </div>
    {/if}
  </div>

  <div class="abajo">
    <p class="turno" role="status" data-testid="turno">{turnoTexto}</p>
    {#if miTurno}
      <div class="botones">
        {#if puede('creer')}
          <button class="principal" data-testid="creer" onclick={() => sesion.jugar({ tipo: 'creer' })}>
            {T.mentiroso.creer}
          </button>
        {/if}
        {#if puede('desconfiar')}
          <button class="alarma" data-testid="desconfiar" onclick={() => sesion.jugar({ tipo: 'desconfiar' })}>
            {T.mentiroso.desconfiar}
          </button>
        {/if}
        {#if !puede('creer')}
          <button class="principal" data-testid="bajar" disabled={!puede('bajar')} onclick={() => sesion.jugar({ tipo: 'bajar' })}>
            {T.mentiroso.bajar(vista.marcadas.length)}
          </button>
        {/if}
      </div>
    {/if}
    <div class="mano" data-testid="mano">
      {#each mano as c (c)}
        <button
          class="carta-mano"
          class:seleccionada={vista.marcadas.includes(c)}
          data-testid="mano-{c}"
          data-carta={c}
          aria-pressed={vista.marcadas.includes(c)}
          disabled={!miTurno}
          onclick={() => tocar(c)}
        >
          <Carta id={c} />
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .mentiroso {
    --ancho-carta: min(15vw, 9dvh, 70px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-rival: min(8vw, 5dvh, 40px);
    --ancho-mini: min(10vw, 6dvh, 44px);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      'arriba arriba arriba'
      'izquierda centro derecha'
      'abajo abajo abajo';
    gap: 6px;
    width: min(100%, 900px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    user-select: none;
    -webkit-user-select: none;
  }

  .mentiroso.muchos {
    --ancho-rival: min(6vw, 4dvh, 32px);
  }

  .mentiroso :global(.asiento.arriba-izquierda),
  .mentiroso :global(.asiento.arriba-derecha) {
    grid-area: arriba;
  }

  .mentiroso :global(.asiento.arriba-izquierda) {
    justify-self: start;
  }

  .mentiroso :global(.asiento.arriba-derecha) {
    justify-self: end;
  }

  .centro {
    grid-area: centro;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 0;
  }

  .monton {
    position: relative;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    border-radius: 7%;
    outline: 2px dashed rgb(255 255 255 / 0.2);
    outline-offset: -2px;
  }

  .cuenta {
    position: absolute;
    right: 3px;
    bottom: 3px;
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    background: rgb(0 0 0 / 0.55);
  }

  .toca,
  .bajada {
    margin: 0;
    text-align: center;
  }

  .toca {
    font-weight: 600;
    color: var(--acento);
  }

  .bajada {
    font-size: 0.92rem;
  }

  .revelacion {
    padding: 6px 12px;
    border-radius: 12px;
    text-align: center;
    background: rgb(0 0 0 / 0.35);
  }

  .revelacion p {
    margin: 0;
  }

  .revelacion.mentia p:first-child {
    color: #ff9a9a;
    font-weight: 600;
  }

  .descubiertas {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin: 6px 0;
  }

  .mini {
    width: var(--ancho-mini);
    height: calc(var(--ancho-mini) * 1.4);
  }

  .nota {
    font-size: 0.85rem;
    color: var(--texto-suave);
  }

  .abajo {
    grid-area: abajo;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .turno {
    margin: 0;
    min-height: 1.3em;
    text-align: center;
  }

  .botones {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .alarma {
    color: #fff;
    background: #b3261e;
    border-color: #b3261e;
  }

  .mano {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 6px;
    width: 100%;
    padding: 10px calc(var(--ancho-carta) * 0.55) 0 0;
  }

  .carta-mano {
    position: relative;
    width: calc(var(--ancho-carta) * 0.45);
    height: var(--alto-carta);
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    transition: translate 120ms;
  }

  .carta-mano:disabled {
    opacity: 1;
    cursor: default;
  }

  .carta-mano :global(.carta) {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--ancho-carta);
    height: var(--alto-carta);
  }

  .carta-mano.seleccionada {
    translate: 0 -10px;
  }

  .carta-mano.seleccionada :global(.carta) {
    outline: 3px solid var(--resalte);
    border-radius: 7%;
  }
</style>
